const express = require('express');
const router = express.Router();
const { auth } = require('../../../middlewares/auth.middleware');
const AnalyticsController = require('../controllers/analytics.controller');
const { authMiddleware } = require('../../../middlewares/auth.middleware');

/**
 * @swagger
 * /api/analytics/user/{userId}:
 *   get:
 *     summary: Get analytics for a user
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics data
 */

// User dashboard analytics
router.get('/user/:userId', AnalyticsController.getUserAnalytics);

// Seller analytics (scoped to authenticated seller)
router.get('/', authMiddleware, AnalyticsController.getSellerAnalytics);

module.exports = router;