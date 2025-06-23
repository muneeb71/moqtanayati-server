const watchlistService = require('../services/watchlist.service');

class WatchlistController {
  async getWatchlist(req, res) {
    try {
      const userId = req.user.userId;
      const items = await watchlistService.getWatchlist(userId);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {  
    try {
      const userId = req.user.userId;
      const { productId } = req.params
      const items = await watchlistService.getWatchlistById(userId, productId);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addToWatchlist(req, res) {
    try {
      const userId = req.user.userId;
      const { productId } = req.params;
      const item = await watchlistService.addToWatchlist(userId, productId);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeFromWatchlist(req, res) {
    try {
      const userId = req.user.userId;
      const { auctionId } = req.params;
      await watchlistService.removeFromWatchlist(userId, auctionId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WatchlistController(); 