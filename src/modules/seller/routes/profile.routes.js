const express = require('express');
const profileController = require('../controllers/profile.controller');
const logoUpload = require('../../utils/logoUpload');
const router = express.Router();

// Get user profile
router.get('/:userId', profileController.getProfile);
// Update user profile (with logo upload)
router.put('/:userId', logoUpload, profileController.updateProfile);
// Update user status
router.patch('/:userId/status', profileController.updateStatus);

module.exports = router; 