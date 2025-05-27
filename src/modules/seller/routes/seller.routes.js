const express = require('express');
const router = express.Router();
const { auth } = require('../../../middlewares/auth.middleware');
const SellerController = require('../controllers/seller.controller');

// Registration (multi-step)
router.post('/register', SellerController.register);

// Login
router.post('/login', SellerController.login);

// Forgot Password (request reset)
router.post('/forgot-password', SellerController.forgotPassword);

// Verify OTP
router.post('/verify-otp', SellerController.verifyOtp);

// Reset Password
router.post('/reset-password', SellerController.resetPassword);

// Get current authenticated user
// router.get('/me', auth, SellerController.getCurrentUser);

module.exports = router;