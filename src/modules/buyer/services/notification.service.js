const prisma = require('../../../config/prisma').default;

class NotificationService {
  async getNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true
          }
        }
      }
    });
  }

  async markAsRead(userId, id) {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true }
    });
  }
}

module.exports = new NotificationService(); 