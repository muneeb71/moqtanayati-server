const chatService = require('../services/chat.service');

class ChatController {
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await chatService.getConversations(userId);
      res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const userId = req.user.id;
      const { id: conversationId } = req.params;
      const messages = await chatService.getMessages(userId, conversationId);
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { id: conversationId } = req.params;
      const { content } = req.body;
      const message = await chatService.sendMessage(userId, conversationId, content);
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id: conversationId } = req.params;
      await chatService.markAsRead(userId, conversationId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ChatController(); 