const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const reviewController = require('../controllers/review.controller');

// Add review
router.post('/', authMiddleware, reviewController.addReview);

// Get review by orderId
router.get('/:orderId', authMiddleware, reviewController.getReview);

// Update review by id
router.patch('/:id', authMiddleware, reviewController.updateReview);

module.exports = router; 
