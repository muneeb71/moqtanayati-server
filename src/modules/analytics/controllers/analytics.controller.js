const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  async getUserAnalytics(req, res) {
    try {
      const analytics = await analyticsService.getUserAnalytics(req.params.userId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getSellerAnalytics(req, res) {
    try {
      const userId = req.user.userId;
      const analytics = await analyticsService.getSellerAnalytics(userId);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      console.error('Error in getSellerAnalytics:', {
        message: error.message,
        stack: error.stack,
        userId: req.user ? req.user.userId : undefined
      });
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AnalyticsController(); 