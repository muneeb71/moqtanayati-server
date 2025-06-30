const { PrismaClient } = require("@prisma/client");
const productService = require("../../product/services/product.service");
const cartService = require("../../buyer/services/cart.service");

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
    return await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
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
      return order;
    });
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
      },
    });
  }

  async getOrderById(id) {
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

  async updateOrderStatus(id, status) {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
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
}

module.exports = new OrderService();
