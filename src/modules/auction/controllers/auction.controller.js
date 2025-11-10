const auctionService = require("../services/auction.service");

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
      const { search, location, condition, month, year } = req.query;

      // Handle both categories and categories[]
      let rawCategories = req.query.categories || req.query["categories[]"];
      let categories = [];

      if (Array.isArray(rawCategories)) {
        categories = rawCategories;
      } else if (typeof rawCategories === "string") {
        categories = [rawCategories];
      }

      const auctions = await auctionService.getAllAuctions({
        search,
        categories,
        location,
        condition,
        month,
        year,
      });

      res.status(200).json({ success: true, data: auctions });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAuctionById(req, res) {
    console.log("pong");

    try {
      const auction = await auctionService.getAuctionById(req.params.id);
      res.status(200).json({ success: true, data: auction });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateAuction(req, res) {
    try {
      const auction = await auctionService.updateAuction(
        req.params.id,
        req.body
      );
      res.status(200).json({ success: true, data: auction });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteAuction(req, res) {
    try {
      await auctionService.deleteAuction(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Auction deleted successfully." });
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
      const auction = await auctionService.updateAuctionStatus(
        req.params.id,
        req.body.status
      );
      res.status(200).json({ success: true, data: auction });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getSellerAuctions(req, res) {
    try {
      const { search, location, condition, month, year } = req.query;

      // Handle both categories and categories[]
      let rawCategories = req.query.categories || req.query["categories[]"];
      let categories = [];

      if (Array.isArray(rawCategories)) {
        categories = rawCategories;
      } else if (typeof rawCategories === "string") {
        categories = [rawCategories];
      }

      const sellerId = req.params.sellerId;

      const auctions = await auctionService.getSellerAuctions({
        sellerId,
        search,
        categories,
        location,
        condition,
        month,
        year,
      });

      res.status(200).json({ success: true, data: auctions });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async placeBid(req, res) {
    try {
      const userId = req.user.userId;
      const { productId, amount } = req.body;
      const bid = await auctionService.placeBid({ userId, productId, amount });
      res.status(201).json({ success: true, data: bid });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getBidsByProductId(req, res) {
    try {
      const { productId } = req.params;
      const bids = await auctionService.getBidsByProductId(productId);
      if (!bids || bids.length === 0) {
        return res
          .status(200)
          .json({ success: true, message: "No bids found", data: [] });
      }
      res.status(200).json({ success: true, data: bids });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getMyBids(req, res) {
    try {
      const userId = req.user.userId;
      const bids = await auctionService.getMyBids(userId);
      if (!bids || bids.length === 0) {
        return res
          .status(200)
          .json({ success: true, message: "No bids found", data: [] });
      }
      res.status(200).json({ success: true, data: bids });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMyBidsDetail(req, res) {
    try {
      const bids = await auctionService.getMyBids(req.params.id);
      if (!bids || bids.length === 0) {
        return res
          .status(200)
          .json({ success: true, message: "No bids found", data: [] });
      }
      res.status(200).json({ success: true, data: bids });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async withdrawBid(req, res) {
    try {
      const userId = req.user.userId;
      const auctionId = req.params.id;
      const withdraw = await auctionService.withdrawBid(userId, auctionId);
      res.status(200).json({ success: true, data: withdraw });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Bid Retraction Request Controllers
  async createBidRetractionRequest(req, res) {
    try {
      const bidderId = req.user.userId;
      const { bidId, reason } = req.body;
      const request = await auctionService.createBidRetractionRequest({
        bidderId,
        bidId,
        reason,
      });
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getBidRetractionRequests(req, res) {
    try {
      const sellerId = req.user.userId;
      const { status } = req.query;
      const requests = await auctionService.getBidRetractionRequests(
        sellerId,
        status || null
      );
      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMyRetractionRequests(req, res) {
    try {
      const bidderId = req.user.userId;
      const { status } = req.query;
      const requests = await auctionService.getMyRetractionRequests(
        bidderId,
        status || null
      );
      res.status(200).json({ success: true, data: requests });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async respondToRetractionRequest(req, res) {
    try {
      const sellerId = req.user.userId;
      const { requestId } = req.params;
      const { action } = req.body; // "ACCEPTED" or "DENIED"
      const result = await auctionService.respondToRetractionRequest({
        requestId,
        sellerId,
        action,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRetractionRequestCount(req, res) {
    try {
      const sellerId = req.user.userId;
      const count = await auctionService.getRetractionRequestCount(sellerId);
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuctionController();
