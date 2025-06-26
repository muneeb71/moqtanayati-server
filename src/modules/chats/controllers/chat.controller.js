const chatService = require("../services/chat.service");

class ChatController {
  async getConversations(req, res, next) {
    try {
      const conversations = await chatService.getConversations(req.user.userId);

      res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getMessages(req, res, next) {
    try {
      const messages = await chatService.getMessages(
        req.user.userId,
        req.params.id
      );
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async sendMessage(req, res, next) {
    try {
      const userAId = req.user.userId;
      const userBId = req.params.id;
      const { content, chatId } = req.body;
      const message = await chatService.sendMessage(
        userAId,
        userBId,
        content,
        chatId
      );
      if (message.chatId && global.io) {
        console.log("emitted");
        global.io.to(message.chatId).emit("receive_message", message);
      }
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async createChat(req, res, next) {
    try {
      const userAId = req.user.userId;
      const { otherUserId } = req.body;
      const chat = await chatService.createChat(userAId, otherUserId);
      res.status(201).json(chat);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
