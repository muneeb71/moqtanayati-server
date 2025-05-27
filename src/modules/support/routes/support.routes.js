const express = require('express');
const router = express.Router();
const { auth } = require('../../../middlewares/auth.middleware');
const upload = require('../../../middlewares/upload.middleware');
const SupportController = require('../controllers/support.controller');

// Submit support/contact form (with optional file upload)
router.post('/contact', upload.single('attachment'), SupportController.submitContactForm);

module.exports = router; 