const prisma = require('../../../config/prisma').default;

class FeedbackService {
  async getFeedback(userId) {
    return prisma.feedback.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createFeedback(userId, orderId, rating, comment) {
    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: 'COMPLETED'
      }
    });

    if (!order) {
      throw new Error('Order not found or not eligible for feedback');
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findFirst({
      where: { userId, orderId }
    });

    if (existingFeedback) {
      throw new Error('Feedback already exists for this order');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return prisma.feedback.create({
      data: {
        userId,
        orderId,
        rating,
        comment
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });
  }

  async deleteFeedback(userId, id) {
    const feedback = await prisma.feedback.findFirst({
      where: { id, userId }
    });

    if (!feedback) {
      throw new Error('Feedback not found');
    }

    await prisma.feedback.delete({
      where: { id }
    });
  }

  async submitFeedback(userId, orderId, feedbackData) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        buyerId: userId,
        status: 'DELIVERED'
      }
    });

    if (!order) {
      throw new Error('Order not found or not eligible for feedback');
    }

    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        orderId,
        buyerId: userId
      }
    });

    if (existingFeedback) {
      throw new Error('Feedback already submitted for this order');
    }

    if (feedbackData.rating < 1 || feedbackData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    return await prisma.feedback.create({
      data: {
        ...feedbackData,
        orderId,
        buyerId: userId,
        sellerId: order.sellerId
      }
    });
  }
}

module.exports = new FeedbackService(); 