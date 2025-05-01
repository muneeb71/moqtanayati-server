const watchlistService = require('../services/watchlist.service');

class WatchlistController {
  async getWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const items = await watchlistService.getWatchlist(userId);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addToWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const { auctionId } = req.params;
      const item = await watchlistService.addToWatchlist(userId, auctionId);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeFromWatchlist(req, res) {
    try {
      const userId = req.user.id;
      const { auctionId } = req.params;
      await watchlistService.removeFromWatchlist(userId, auctionId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WatchlistController(); 