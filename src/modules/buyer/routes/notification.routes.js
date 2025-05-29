const express = require('express');
const notificationController = require('../controllers/notification.controller');
const router = express.Router();

/**
 * @swagger
 * /api/buyers/notification:
 *   get:
 *     summary: Get all notifications for the buyer
 *     tags: [Buyer Notification]
 *     responses:
 *       200:
 *         description: List of notifications
 */

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;