const express = require('express');
const router = express.Router();
const { auth } = require('../../../middlewares/auth.middleware');
const SellerController = require('../controllers/seller.controller');

/**
 * @swagger
 * /api/sellers/register:
 *   post:
 *     summary: Register a new seller
 *     tags: [Sellers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - name
 *               - email
 *               - phone
 *               - address
 *               - nationalId
 *               - password
 *             properties:
 *               role:
 *                 type: string
 *                 example: SELLER
 *               name:
 *                 type: string
 *                 example: John Doe
 *               businessName:
 *                 type: string
 *                 example: John's Store
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               phone:
 *                 type: string
 *                 example: '+1234567890'
 *               address:
 *                 type: string
 *                 example: '123 Main St, City, Country'
 *               nationalId:
 *                 type: string
 *                 example: 'A123456789'
 *               password:
 *                 type: string
 *                 example: 'password123'
 *               latitude:
 *                 type: number
 *                 example: 40.7128
 *               longitude:
 *                 type: number
 *                 example: -74.0060
 *     responses:
 *       201:
 *         description: Seller registered
 *
 * /api/sellers/login:
 *   post:
 *     summary: Seller login
 *     tags: [Sellers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *
 * /api/sellers/forgot-password:
 *   post:
 *     summary: Request password reset for seller
 *     tags: [Sellers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *     responses:
 *       200:
 *         description: Reset instructions sent
 *
 * /api/sellers/verify-otp:
 *   post:
 *     summary: Verify OTP for seller
 *     tags: [Sellers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               otp:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * /api/sellers/reset-password:
 *   post:
 *     summary: Reset seller password
 *     tags: [Sellers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               otp:
 *                 type: string
 *                 example: '123456'
 *               newPassword:
 *                 type: string
 *                 example: 'newPassword123'
 *     responses:
 *       200:
 *         description: Password reset successful
 */

router.post('/check-existing', SellerController.checkExisting);
router.post('/register', SellerController.register);
router.post('/login', SellerController.login);
router.post('/forgot-password', SellerController.forgotPassword);
router.post('/verify-otp', SellerController.verifyOtp);
router.post('/reset-password', SellerController.resetPassword);

// Get current authenticated user
// router.get('/me', auth, SellerController.getCurrentUser);

module.exports = router;