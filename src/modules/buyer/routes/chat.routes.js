const express = require('express');
const chatController = require('../controllers/chat.controller');
const router = express.Router();

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', chatController.sendMessage);
router.patch('/conversations/:id/read', chatController.markAsRead);

module.exports = router; 