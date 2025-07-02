const notificationService = require("../services/notification.service");

class NotificationController {
  // Send + Save Notification
  async send(req, res) {
    try {
      const { token, title, body, data, userId } = req.body;
      // Send push notification using Firebase
      await notificationService.sendNotification(token, title, body, data);
      // Save to DB
      const notification = await notificationService.create(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all notifications
  async findAll(req, res) {
    try {
      const notifications = await notificationService.findAll();
      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all notifications of a specific user
  async getUserNotifications(req, res) {
    try {
      const notifications = await notificationService.findAllNotificationOfUser(
        req.params.id
      );
      res.json({ success: true, data: notifications });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get single notification by ID
  async findOne(req, res) {
    try {
      const notification = await notificationService.findOne(req.params.id);
      res.json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Update a notification (mark as read, etc.)
  async update(req, res) {
    try {
      const notification = await notificationService.update(
        req.params.id,
        req.body
      );
      res.json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete a notification
  async remove(req, res) {
    try {
      await notificationService.remove(req.params.id);
      res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Mark all notifications as read for a user
  async markNotificationsAsRead(req, res) {
    try {
      const result = await notificationService.updateNotificationReadStatus(
        req.params.userId
      );
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new NotificationController();
