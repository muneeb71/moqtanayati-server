const feedbackService = require('../services/feedback.service');

class FeedbackController {
  async getFeedback(req, res) {
    try {
      const userId = req.user.id;
      const feedback = await feedbackService.getFeedback(userId);
      res.status(200).json({ success: true, data: feedback });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createFeedback(req, res) {
    try {
      const userId = req.user.id;
      const { orderId, rating, comment } = req.body;
      const feedback = await feedbackService.createFeedback(userId, orderId, rating, comment);
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteFeedback(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await feedbackService.deleteFeedback(userId, id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new FeedbackController(); 