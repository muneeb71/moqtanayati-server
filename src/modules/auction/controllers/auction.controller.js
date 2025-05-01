const auctionService = require('../services/auction.service');

class AuctionController {
  async createAuction(req, res) {
    try {
      const auction = await auctionService.createAuction(req.body);
      res.status(201).json({ success: true, data: auction });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllAuctions(req, res) {
    try {
      const auctions = await auctionService.getAllAuctions();
      res.status(200).json({ success: true, data: auctions });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAuctionById(req, res) {
    try {
      const auction = await auctionService.getAuctionById(req.params.id);
      res.status(200).json({ success: true, data: auction });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateAuction(req, res) {
    try {
      const auction = await auctionService.updateAuction(req.params.id, req.body);
      res.status(200).json({ success: true, data: auction });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteAuction(req, res) {
    try {
      await auctionService.deleteAuction(req.params.id);
      res.status(200).json({ success: true, message: 'Auction deleted successfully.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getLiveAuctions(req, res) {
    try {
      const auctions = await auctionService.getLiveAuctions();
      res.status(200).json({ success: true, data: auctions });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUpcomingAuctions(req, res) {
    try {
      const auctions = await auctionService.getUpcomingAuctions();
      res.status(200).json({ success: true, data: auctions });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAuctionHistory(req, res) {
    try {
      const auctions = await auctionService.getAuctionHistory();
      res.status(200).json({ success: true, data: auctions });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAuctionDetails(req, res) {
    try {
      const details = await auctionService.getAuctionDetails(req.params.id);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateAuctionStatus(req, res) {
    try {
      const auction = await auctionService.updateAuctionStatus(req.params.id, req.body.status);
      res.status(200).json({ success: true, data: auction });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuctionController(); 