const { PrismaClient } = require("@prisma/client");
const admin = require("../../../utils/firebase");

const prisma = new PrismaClient();

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
      return {
        success: false,
        message: "Failed to send notification",
        data: null,
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
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return {
        success: true,
        message: "All unread notifications marked as read",
      };
    } catch (error) {
      console.error("Error updating notifications:", error.message);
      throw new Error("Failed to mark notifications as read");
    }
  }

  // Notify user on order status change
  async notifyUserOnStatusChange(userFcmToken, status, orderNumber, userId) {
    // You should define your own status-to-message mapping
    const statusMessages = {
      pending: { title: "Order Pending", body: "Your order is pending." },
      processing: {
        title: "Order Processing",
        body: "Your order is being processed.",
      },
      readyToPickup: {
        title: "Order Ready",
        body: "Your order is ready to pick up.",
      },
      completed: {
        title: "Order Completed",
        body: "Your order has been completed.",
      },
      cancelled: {
        title: "Order Cancelled",
        body: "Your order has been cancelled.",
      },
    };
    const notification = statusMessages[status];
    if (!notification) return;

    const title = notification.title;
    const body = `${notification.body} Your Order No is ${orderNumber}`;
    const data = { orderNumber, status };

    // 1. Send FCM notification
    await this.sendNotification(userFcmToken, title, body, data);

    // 2. Save to DB
    await this.create({
      userId,
      title,
      body,
      data,
      type: "order_status",
    });
  }
}

module.exports = new NotificationService();
