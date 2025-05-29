const express = require('express');
const router = express.Router();
const { auth } = require('../../../middlewares/auth.middleware');
const AnalyticsController = require('../controllers/analytics.controller');

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

module.exports = router;