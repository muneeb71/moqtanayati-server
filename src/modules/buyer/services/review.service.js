const prisma = require("../../../config/prisma");

class ReviewService {
  async getDeliveredReviewedOrders(userId) {
    if (!userId) {
      throw new Error("userId is required");
    }
    // Find delivered orders for the user
    const deliveredOrders = await prisma.order.findMany({
      where: {
        userId,
        status: "DELIVERED",
      },
      include: {
        OrderItem: {
          include: { product: true },
        },
        seller: true,
      },
    });

    // Get all orderIds
    const orderIds = deliveredOrders.map((order) => order.id);
    if (orderIds.length === 0) return [];

    // Find reviews for these orders by the user
    const reviews = await prisma.review.findMany({
      where: {
        userId,
        orderId: { in: orderIds },
      },
    });

    return reviews;
  }

  async addReview({ userId, sellerId, orderId, rating, comment }) {
    if (!userId || !sellerId || !orderId || !rating) {
      throw new Error("userId, sellerId, orderId, and rating are required");
    }
    // Optionally: check if review already exists for this order and user
    const existing = await prisma.review.findFirst({
      where: { userId, orderId },
    });
    if (existing) {
      throw new Error("Review already exists for this order");
    }
    // Optionally: check if order exists and belongs to user
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.userId !== userId) {
      throw new Error("UserId not matched");
    }
    if (order.sellerId !== sellerId) {
      throw new Error("SellerId not matched");
    }
    const review = await prisma.review.create({
      data: { userId, sellerId, orderId, rating, comment },
    });
    return review;
  }

  async getReview(userId, orderId) {
    if (!userId || !orderId) {
      throw new Error("userId and orderId are required");
    }
    return prisma.review.findFirst({ where: { userId, orderId } });
  }

  async updateReview(id, userId, rating, comment) {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.userId !== userId) {
      return null;
    }
    const updated = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });
    return updated;
  }
}

module.exports = new ReviewService();
