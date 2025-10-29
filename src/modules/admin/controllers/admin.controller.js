const adminService = require("../services/admin.service");
const { bucket } = require("../../../config/firebase");

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
      const data = await adminService.getOrdersChart();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Users
  async getUsers(req, res) {
    try {
      const { role, status, page, limit = 10, search, filter } = req.query;
      const users = await adminService.getUsers({
        role,
        status,
        page: Number(page),
        limit: Number(limit),
        search,
        filter,
      });
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

  async disableUser(req, res) {
    try {
      const { id } = req.params;
      const user = await adminService.updateUserStatus(id, "DISABLED");
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
      console.log("id : ", id);
      await adminService.deleteUser(id);
      console.log("user deleted");
      res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
      console.error("Delete user failed", { id: req.params?.id, error });
      res.status(400).json({ error: error.message });
    }
  }

  // Orders
  async getOrders(req, res) {
    try {
      const { status, page, limit = 10, search, filter } = req.query;
      const orders = await adminService.getOrders({
        status,
        page: Number(page),
        limit: Number(limit),
        search,
        filter,
      });
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
      const { status, page, limit = 10, search, filter } = req.query;
      const auctions = await adminService.getAuctions({
        status,
        page: Number(page),
        limit: Number(limit),
        search,
        filter,
      });
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
      const updatedAuction = await adminService.cancelAuction(id);
      res
        .status(200)
        .json({ message: "Auction cancelled", auction: updatedAuction });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Reviews
  async getReviews(req, res) {
    try {
      const { status, page, limit = 10, search } = req.query;
      const reviews = await adminService.getReviews({
        status,
        page: Number(page),
        limit: Number(limit),
        search,
      });
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
      const payments = await adminService.getPayments({
        status,
        page: Number(page),
        limit: Number(limit),
      });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCashPayments(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const payments = await adminService.getCashPayments({
        status,
        page: Number(page),
        limit: Number(limit),
      });
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getThirdPartyPayments(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const payments = await adminService.getThirdPartyPayments({
        status,
        page: Number(page),
        limit: Number(limit),
      });
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
  // async getBuyersReport(req, res) {
  //   try {
  //     const { startDate, endDate } = req.query;
  //     const report = await adminService.getBuyersReport(startDate, endDate);
  //     res.json(report);
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // }

  async getReport(req, res) {
    try {
      const { role, page, limit = 10, search, filter } = req.query;
      const report = await adminService.getReport({
        role,
        page: Number(page),
        limit: Number(limit),
        search,
        filter,
      });

      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      await adminService.deleteReport(id);
      res.status(204).end();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async exportReport(req, res) {
    try {
      const { type } = req.params;
      const { startDate, endDate, format = "excel" } = req.query;
      const file = await adminService.exportReport(
        type,
        startDate,
        endDate,
        format
      );
      res.download(file);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      console.log("user id 1 : ", req);
      console.log("user id 2 : ", req.user.userId);
      const userId = req.user.userId;
      console.log("user id 3 : ", userId);
      const profile = await adminService.getProfile(userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getNotifications(req, res) {
    try {
      const notifications = await adminService.getNotifications();
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      let image;

      if (req.files?.avatar && req.files.avatar.length > 0) {
        console.log("Uploading profile image...");
        const imageFile = req.files.avatar[0];
        const imageName = `moqtanayati/${userId}/profile/image_${Date.now()}_${
          imageFile.originalname
        }`;
        const file = bucket.file(imageName);

        await file.save(imageFile.buffer, {
          contentType: imageFile.mimetype,
          resumable: false,
        });

        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });

        image = url;
        console.log("Image uploaded:", image);
      } else {
        console.log("No image file provided in request.");
      }

      // Merge data
      const data = { ...req.body };
      if (image) data.avatar = image;

      const profile = await adminService.updateProfile(userId, data);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AdminController();
