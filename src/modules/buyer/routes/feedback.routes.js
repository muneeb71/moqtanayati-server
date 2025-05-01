const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const router = express.Router();

router.get('/', feedbackController.getFeedback);
router.post('/', feedbackController.createFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router; 