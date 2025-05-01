const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const AnalyticsController = require('../controllers/analytics.controller');

// User dashboard analytics
router.get('/user/:userId', AnalyticsController.getUserAnalytics);

router.get('/dashboard', auth, AnalyticsController.getDashboardStats);

module.exports = router; 