const notificationService = require('../services/notification.service');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const notifications = await notificationService.getNotifications(userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const notification = await notificationService.markAsRead(userId, id);
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new NotificationController(); 