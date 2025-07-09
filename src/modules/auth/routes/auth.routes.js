const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authMiddleware } = require("../../../middlewares/auth.middleware");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-forgot-otp", authController.verifyForgotOtp);
router.post("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
