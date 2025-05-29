const express = require('express');
const profileController = require('../controllers/profile.controller');
const logoUpload = require('../../utils/logoUpload');
const router = express.Router();

/**
 * @swagger
 * /api/sellers/profile/{userId}:
 *   get:
 *     summary: Get seller profile by userId
 *     tags: [Seller Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller profile data
 *   put:
 *     summary: Update seller profile (with logo upload)
 *     tags: [Seller Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 *   patch:
 *     summary: Update seller status
 *     tags: [Seller Profile]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

// Get user profile
router.get('/:userId', profileController.getProfile);
// Update user profile (with logo upload)
router.put('/:userId', logoUpload, profileController.updateProfile);
// Update user status
router.patch('/:userId/status', profileController.updateStatus);

module.exports = router;