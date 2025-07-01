const reviewService = require('../services/review.service');

class ReviewController {
  async addReview(req, res) {
    try {
      const userId = req.user.userId;
      const { sellerId, orderId, rating, comment } = req.body;
      const review = await reviewService.addReview({ userId, sellerId, orderId, rating, comment });
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getReview(req, res) {
    try {
      const userId = req.user.userId;
      const { orderId } = req.params;
      const review = await reviewService.getReview(userId, orderId);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      res.status(200).json({ success: true, data: review });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateReview(req, res) {
    try {
      const userId = req.user.userId;
      const { id } = req.params;
      const { rating, comment } = req.body;
      const review = await reviewService.updateReview(id, userId, rating, comment);
      if (!review) {
        return res.status(403).json({ success: false, message: 'Not allowed to update this review' });
      }
      res.status(200).json({ success: true, data: review });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReviewController(); 