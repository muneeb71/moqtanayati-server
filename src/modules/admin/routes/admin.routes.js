const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const adminOnly = require("../../../middlewares/admin.middleware");
const AdminController = require("../controllers/admin.controller");

router.use(auth, adminOnly);

router.get("/dashboard/stats", AdminController.getDashboardStats);
router.get("/dashboard/profit-chart", AdminController.getProfitChart);
router.get("/dashboard/orders-chart", AdminController.getOrdersChart);

router.get("/users", AdminController.getUsers);
router.get("/users/:id", AdminController.getUserDetails);
router.patch("/users/:id/status", AdminController.updateUserStatus);
router.patch("/users/:id/verify", AdminController.verifyUser);
router.delete("/users/:id", AdminController.deleteUser);

router.get("/orders", AdminController.getOrders);
router.get("/orders/:id", AdminController.getOrderDetails);
router.patch("/orders/:id/status", AdminController.updateOrderStatus);

router.get("/auctions", AdminController.getAuctions);
router.get("/auctions/:id", AdminController.getAuctionDetails);
router.delete("/auctions/:id", AdminController.cancelAuction);

router.get("/reviews", AdminController.getReviews);
router.patch("/reviews/:id/approve", AdminController.approveReview);
router.patch("/reviews/:id/reject", AdminController.rejectReview);
router.delete("/reviews/:id", AdminController.deleteReview);

router.get("/payments", AdminController.getPayments);
router.get("/payments/cash", AdminController.getCashPayments);
router.get("/payments/third-party", AdminController.getThirdPartyPayments);
router.patch("/payments/:id/status", AdminController.updatePaymentStatus);

router.get("/reports/buyers", AdminController.getBuyersReport);
router.get("/reports/sellers", AdminController.getSellersReport);

module.exports = router;
