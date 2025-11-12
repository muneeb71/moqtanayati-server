const prisma = require("../../../config/prisma");
const admin = require("../../../utils/firebase");

class NotificationService {
  // Send push notification via Firebase
  async sendNotification(token, title, body, data = {}) {
    const message = {
      token,
      notification: { title, body },
      data: data || {},
    };
    try {
      const response = await admin.messaging().send(message);
      return {
        success: true,
        message: "Notification sent successfully",
        data: response,
      };
    } catch (error) {
      console.error("Firebase error:", error.message);
      console.error("Error code:", error.code);
      console.error("FCM Token:", token);

      // Handle specific FCM errors
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token"
      ) {
        console.error(
          "Invalid or expired FCM token. Token should be refreshed on client side."
        );
        return {
          success: false,
          message: "Invalid or expired FCM token",
          data: { errorCode: error.code, token },
        };
      }

      return {
        success: false,
        message: "Failed to send notification",
        data: { errorCode: error.code, errorMessage: error.message },
      };
    }
  }

  // Save notification to DB
  async create({ userId, title, body, data = {}, type = "order_status" }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message: body,
          type,
          read: false,
          // Optionally store data as JSON if your schema allows
          // data: JSON.stringify(data),
        },
      });
      return {
        success: true,
        message: "Notification saved successfully!",
        data: notification,
      };
    } catch (error) {
      console.error("DB error:", error.message);
      return {
        success: false,
        message: "Failed to save notification",
        data: null,
      };
    }
  }

  // Get all notifications
  async findAll() {
    try {
      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
      });
      return {
        success: true,
        message: "Notifications retrieved successfully!",
        data: notifications,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      return {
        success: false,
        message: "Failed to fetch notifications",
        data: null,
      };
    }
  }

  // Get all notifications for a user
  async findAllNotificationOfUser(userId) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      return {
        success: false,
        message: "Failed to fetch notifications",
        data: null,
      };
    }
  }

  // Get single notification by ID
  async findOne(id) {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id },
      });
      if (!notification) {
        return {
          success: false,
          message: "Notification not found!",
          data: null,
        };
      }
      return {
        success: true,
        message: "Notification found!",
        data: notification,
      };
    } catch (error) {
      console.error("Error fetching notification:", error.message);
      return {
        success: false,
        message: "Failed to fetch notification",
        data: null,
      };
    }
  }

  // Update a notification (e.g., mark as read)
  async update(id, updateData) {
    try {
      const updated = await prisma.notification.update({
        where: { id },
        data: updateData,
      });
      return {
        success: true,
        message: "Notification updated successfully!",
        data: updated,
      };
    } catch (error) {
      console.error("Error updating notification:", error.message);
      return {
        success: false,
        message: "Failed to update notification",
        data: null,
      };
    }
  }

  // Delete a notification
  async remove(id) {
    try {
      await prisma.notification.delete({ where: { id } });
      return {
        success: true,
        message: "Notification deleted successfully!",
      };
    } catch (error) {
      console.error("Error deleting notification:", error.message);
      return {
        success: false,
        message: "Failed to delete notification",
      };
    }
  }

  // Mark all notifications as read for a user
  async updateNotificationReadStatus(userId) {
    try {
      const before = await prisma.notification.count({
        where: { userId, read: false },
      });
      const result = await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      const after = await prisma.notification.count({
        where: { userId, read: false },
      });
      console.log(
        `Before: ${before}, Updated: ${result.count}, After: ${after}`
      );
      return result.count;
    } catch (error) {
      console.error("Error updating notifications:", error.message);
      throw new Error("Failed to mark notifications as read");
    }
  }

  // Notify user
  async notifyUserOnStatusChange(userFcmToken, status, userId, type) {
    const typeMessages = {
      purchases: {
        pending: { title: "Order Pending", body: "Your order is pending." },
        processing: {
          title: "Order Processing",
          body: "Your order is being processed.",
        },
        shipped: {
          title: "Order Ready",
          body: "Your order is ready to pick up.",
        },
        delivered: {
          title: "Order Completed",
          body: "Your order has been completed.",
        },
        cancelled: {
          title: "Order Cancelled",
          body: "Your order has been cancelled.",
        },
      },
      bids: {
        won: { title: "Bid Won", body: "Congratulations! You won the bid." },
        lost: { title: "Bid Lost", body: "Sorry, you lost the bid." },
      },
      messages: {
        new: { title: "New Message", body: "You have a new message." },
      },
    };

    const messages = typeMessages[type] || {};
    const notification = messages[status];
    if (!notification) return;

    const { title, body } = notification;
    const data = { status, type };

    // 1. Send FCM notification
    await this.sendNotification(userFcmToken, title, body, data);

    // 2. Save to DB with correct type
    await prisma.notification.create({
      data: {
        userId,
        title,
        message: body,
        type,
        read: false,
      },
    });
  }
}

module.exports = new NotificationService();
