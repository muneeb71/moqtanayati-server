const adminService = require('../services/admin.service');

class AdminController {
  // Dashboard
  async getDashboardStats(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProfitChart(req, res) {
    try {
      const { period } = req.query;
      const data = await adminService.getProfitChart(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrdersChart(req, res) {
    try {
      const { period } = req.query;
      const data = await adminService.getOrdersChart(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Users
  async getUsers(req, res) {
    try {
      const { role, status, page = 1, limit = 10 } = req.query;
      const users = await adminService.getUsers({ role, status, page: Number(page), limit: Number(limit) });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserDetails(req, res) {
    try {
      const { id } = req.params;
      const user = await adminService.getUserDetails(id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await adminService.updateUserStatus(id, status);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyUser(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await adminService.verifyUser(id, status);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await adminService.deleteUser(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Orders
  async getOrders(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const orders = await adminService.getOrders({ status, page: Number(page), limit: Number(limit) });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOrderDetails(req, res) {
    try {
      const { id } = req.params;
      const order = await adminService.getOrderDetails(id);
      res.json(order);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await adminService.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Auctions
  async getAuctions(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const auctions = await adminService.getAuctions({ status, page: Number(page), limit: Number(limit) });
      res.json(auctions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAuctionDetails(req, res) {
    try {
      const { id } = req.params;
      const auction = await adminService.getAuctionDetails(id);
      res.json(auction);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async cancelAuction(req, res) {
    try {
      const { id } = req.params;
      await adminService.cancelAuction(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Reviews
  async getReviews(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const reviews = await adminService.getReviews({ status, page: Number(page), limit: Number(limit) });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async approveReview(req, res) {
    try {
      const { id } = req.params;
      const review = await adminService.approveReview(id);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async rejectReview(req, res) {
    try {
      const { id } = req.params;
      const review = await adminService.rejectReview(id);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      await adminService.deleteReview(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Payments
  async getPayments(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const payments = await adminService.getPayments({ status, page: Number(page), limit: Number(limit) });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCashPayments(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const payments = await adminService.getCashPayments({ status, page: Number(page), limit: Number(limit) });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getThirdPartyPayments(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const payments = await adminService.getThirdPartyPayments({ status, page: Number(page), limit: Number(limit) });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const payment = await adminService.updatePaymentStatus(id, status);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Reports
  async getBuyersReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const report = await adminService.getBuyersReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSellersReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const report = await adminService.getSellersReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async exportReport(req, res) {
    try {
      const { type } = req.params;
      const { startDate, endDate, format = 'excel' } = req.query;
      const file = await adminService.exportReport(type, startDate, endDate, format);
      res.download(file);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AdminController();