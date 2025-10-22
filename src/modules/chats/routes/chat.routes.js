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

// Create a chat between two users
router.post("/", authMiddleware, chatController.createChat);

// Test socket connection
router.get("/test-socket", authMiddleware, (req, res) => {
  if (global.io) {
    res.json({
      success: true,
      message: "Socket server is running",
      connectedSockets: global.io.engine.clientsCount,
    });
  } else {
    res.json({
      success: false,
      message: "Socket server not initialized",
    });
  }
});

module.exports = router;
