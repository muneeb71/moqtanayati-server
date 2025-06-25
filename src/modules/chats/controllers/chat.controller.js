const chatService = require('../services/chat.service');

class ChatController {
  async getConversations(req, res, next) {
    try {
      const conversations = await chatService.getConversations(req.user.id);
      res.json(conversations);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const messages = await chatService.getMessages(req.user.id, req.params.conversationId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const message = await chatService.sendMessage(req.user.id, req.params.conversationId, req.body.content);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController(); 