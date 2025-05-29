const express = require('express');
const chatController = require('../controllers/chat.controller');
const router = express.Router();

/**
 * @swagger
 * /api/buyers/chat:
 *   get:
 *     summary: Get all chats for the buyer
 *     tags: [Buyer Chat]
 *     responses:
 *       200:
 *         description: List of chats
 *   post:
 *     summary: Start a new chat
 *     tags: [Buyer Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Chat started
 */

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.patch('/conversations/:id/read', chatController.markAsRead);

module.exports = router;