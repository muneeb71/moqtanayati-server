/**
 * @swagger
 * /api/buyers/preferences:
 *   get:
 *     summary: Get buyer preferences
 *     tags: [Buyer Preferences]
 *     responses:
 *       200:
 *         description: Preferences data
 *   post:
 *     summary: Update buyer preferences
 *     tags: [Buyer Preferences]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Preferences updated
 */

const express = require('express');
const preferencesController = require('../controllers/preferences.controller');
const router = express.Router();

router.get('/', preferencesController.getPreferences);
router.put('/', preferencesController.updatePreferences);

module.exports = router;