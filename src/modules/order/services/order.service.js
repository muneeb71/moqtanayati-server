const { PrismaClient } = require("@prisma/client");
const productService = require("../../product/services/product.service");
const cartService = require("../../buyer/services/cart.service");
const notificationService = require("../../notification/services/notification.service");

const prisma = new PrismaClient();

class OrderService {
  async createOrder(orderData, userId) {
    const { items, totalAmount, status } = orderData;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order must have at least one item");
    }
    const productIds = items.map((item) => item.productId);
    const products = await productService.getProductsByIds(productIds);
    if (products.length !== items.length) {
      throw new Error("Some products not found");
    }
    const productMap = {};
    products.forEach((p) => {
      productMap[p.id] = p;
    });
    const sellerId = products[0].store.userId;

    const orderItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: productMap[item.productId].price || item.price || 0,
    }));
    const order = await prisma.$transaction(async (prisma) => {
      const created = await prisma.order.create({
        data: {
          userId,
          sellerId,
          productId: items[0].productId,
          status: status || "PENDING",
          totalAmount,
          OrderItem: {
            create: orderItems,
          },
        },
        include: {
          OrderItem: true,
        },
      });
      await cartService.clearCart(userId);
      return created;
    });

    // Notify seller about the new order (outside the transaction)
    try {
      const seller = await prisma.user.findUnique({ where: { id: sellerId } });
      if (seller && seller.deviceToken) {
        const title = "New Order Received";
        const body = "You have a new order.";
        const pushResult = await notificationService.sendNotification(
          seller.deviceToken,
          title,
          body,
          {
            orderId: order.id,
            type: "sales",
          }
        );
        console.log(
          "Seller push notification:",
          pushResult && pushResult.success ? "sent" : "failed",
          pushResult && pushResult.data ? pushResult.data : ""
        );

        const saveResult = await notificationService.create({
          userId: sellerId,
          title,
          body,
          type: "sales",
        });
        console.log(
          "Seller in-app notification save:",
          saveResult && saveResult.success ? "saved" : "failed"
        );
      } else if (seller && !seller.deviceToken) {
        console.log(
          "Seller has no deviceToken; skipping push notification. SellerId:",
          sellerId
        );
      } else {
        console.log("Seller record not found for SellerId:", sellerId);
      }
    } catch (e) {
      // Do not fail the order creation if notification fails
      console.error("Failed to notify seller for new order:", e?.message || e);
    }

    // Emit realtime event to the seller's user room with the new order payload
    try {
      const room = `user:${sellerId}`;
      console.log("room: ", room);
      if (global.io && room) {
        console.log("room 0");
        global.io.to(room).emit("order:new", order);

        console.log(`Emitted order:new to ${room}`, { orderId: order.id });
      }
    } catch (e) {
      console.error("Failed to emit order:new event:", e?.message || e);
    }

    return order;
  }

  async getAllOrders() {
    return prisma.order.findMany({
      include: {
        user: true,
        OrderItem: {
          include: {
            product: true,
          },
        },
        product: true,
      },
    });
  }

  async getAllMyOrders(id) {
    return prisma.order.findMany({
      where: { sellerId: id },
      include: {
        user: true,
        OrderItem: {
          include: {
            product: true,
          },
        },
        product: true,
      },
    });
  }

  async getOrderById(id) {
    console.log("Order ID:", JSON.stringify(id));
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          OrderItem: true,
          user: true,
          seller: true,
          product: true,
        },
      });
      if (!order) throw new Error("Order not found");
      return order;
    } catch (error) {
      console.error("Error in getOrderById:", error);
      throw error;
    }
  }

  async updateOrder(id, data) {
    const order = await prisma.order.update({
      where: { id },
      data,
      include: { items: true },
    });
    return order;
  }

  async deleteOrder(id) {
    await prisma.order.delete({ where: { id } });
  }

  async getActiveOrders() {
    return prisma.order.findMany({
      where: { OR: [{ status: "PENDING" }, { status: "PROCESSING" }] },
      include: { items: true },
    });
  }

  async getCompletedOrders() {
    return prisma.order.findMany({
      where: { status: "DELIVERED" },
      include: { items: true },
    });
  }

  async getCancelledOrders() {
    return prisma.order.findMany({
      where: { status: "CANCELLED" },
      include: { items: true },
    });
  }

  async getReturnedOrders() {
    return prisma.order.findMany({
      where: { status: "RETURNED" },
      include: { items: true },
    });
  }

  async getOrderDetails(id) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        seller: true,
      },
    });
    if (!order) throw new Error("Order not found");
    return order;
  }

  async updateOrderStatus(id, body) {
    const { deliveryStatus, status } = body || {};

    const validDeliveryStatuses = ["PENDING", "SHIPPED", "DELIVERED", "FAILED"];
    const validOrderStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    // Build update payload only with provided fields, with normalization
    const dataToUpdate = {};
    const normalizedDelivery =
      typeof deliveryStatus === "string"
        ? deliveryStatus.toUpperCase()
        : undefined;
    const normalizedStatus =
      typeof status === "string" ? status.toUpperCase() : undefined;

    if (normalizedDelivery) {
      if (validDeliveryStatuses.includes(normalizedDelivery)) {
        dataToUpdate.deliveryStatus = normalizedDelivery;
      } else if (validOrderStatuses.includes(normalizedDelivery)) {
        // If someone sends PROCESSING/CANCELLED as deliveryStatus, treat it as order status
        dataToUpdate.status = normalizedDelivery;
      } else {
        throw new Error(
          "Invalid deliveryStatus value. Allowed: " +
            validDeliveryStatuses.join(", ")
        );
      }
    }

    if (normalizedStatus) {
      if (!validOrderStatuses.includes(normalizedStatus)) {
        throw new Error(
          "Invalid status value. Allowed: " + validOrderStatuses.join(", ")
        );
      }
      dataToUpdate.status = normalizedStatus;
    }

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: true, // include user to get FCM token
        OrderItem: true,
      },
    });

    // Determine notification status keyword expected by notification service
    // Preference: explicit `status` if provided, otherwise map deliveryStatus
    let notifyKey = undefined;
    if (normalizedStatus) {
      notifyKey = normalizedStatus.toLowerCase();
    } else if (normalizedDelivery) {
      const map = {
        PENDING: "pending",
        PROCESSING: "processing",
        SHIPPED: "shipped",
        DELIVERED: "delivered",
        CANCELLED: "cancelled",
        FAILED: "failed",
      };
      notifyKey = map[normalizedDelivery] || normalizedDelivery.toLowerCase();
    }

    // Send notification to buyer if FCM token exists and we have a valid key
    try {
      if (notifyKey && order && order.user && order.user.deviceToken) {
        await notificationService.notifyUserOnStatusChange(
          order.user.deviceToken,
          notifyKey,
          order.userId,
          "purchases"
        );
      }
    } catch (e) {
      console.error(
        "Failed to notify buyer on status change:",
        e?.message || e
      );
    }

    // Emit socket event to buyer room with updated order
    try {
      const room = `user:${order.userId}`;
      if (global.io) {
        global.io.to(room).emit("order:updated", order);
      }
    } catch (e) {
      console.error("Failed to emit order:updated event:", e?.message || e);
    }

    return order;
  }

  async handleCancelRequest(id) {
    const order = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { items: true },
    });
    return order;
  }

  async handleReturnRequest(id) {
    const order = await prisma.order.update({
      where: { id },
      data: { status: "RETURNED" },
      include: { items: true },
    });
    return order;
  }

  async getOrdersBySellerId(userId) {
    return await prisma.order.findMany({
      where: { sellerId: userId },
      include: { OrderItem: true, product: true },
    });
  }
}

module.exports = new OrderService();
