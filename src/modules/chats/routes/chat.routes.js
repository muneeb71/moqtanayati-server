const { Router } = require("express");
const chatController = require("../controllers/chat.controller");
const { authMiddleware } = require("../../../middlewares/auth.middleware");

const router = Router();

// Get all conversations for the logged-in user
router.get("/", authMiddleware, chatController.getConversations);

// Get messages for a specific conversation
router.get("/:id/messages", authMiddleware, chatController.getMessages);

// Send a message
router.post("/:id/messages", authMiddleware, chatController.sendMessage);

module.exports = router; 