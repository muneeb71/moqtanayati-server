/**
 * @swagger
 * /api/buyers/feedback:
 *   get:
 *     summary: Get all feedback for the buyer
 *     tags: [Buyer Feedback]
 *     responses:
 *       200:
 *         description: List of feedback
 *   post:
 *     summary: Submit feedback
 *     tags: [Buyer Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Feedback submitted
 */

const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const router = express.Router();

router.get('/', feedbackController.getFeedback);
router.post('/', feedbackController.createFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;