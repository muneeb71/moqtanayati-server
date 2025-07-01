const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-forgot-otp', authController.verifyForgotOtp);

module.exports = router;
