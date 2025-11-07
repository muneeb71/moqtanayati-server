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

      console.log("REST API sendMessage called:", {
        userAId,
        userBId,
        content,
        chatId,
      });

      const message = await chatService.sendMessage(
        userAId,
        userBId,
        content,
        chatId
      );

      console.log("Message created:", message);

      // Emit the message to all users in the chat room
      if (message.chatId && global.io) {
        console.log(`Emitting message to chat room: ${message.chatId}`);
        global.io.to(message.chatId).emit("receive_message", message);
        console.log("Message emitted successfully");
      } else {
        console.log(
          "No socket emission - chatId:",
          message.chatId,
          "global.io:",
          !!global.io
        );
      }

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      console.error("❌ Error in sendMessage controller:", error);
      console.error("❌ Error stack:", error.stack);
      console.error("❌ Request details:", {
        userAId: req.user?.userId,
        userBId: req.params.id,
        body: req.body,
        headers: req.headers,
      });
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.name,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }

  async createChat(req, res, next) {
    try {
      const userAId = req.user.userId;
      const { userBId } = req.body;
      const chat = await chatService.createChat(userAId, userBId);
      res.status(201).json({ success: true, data: chat });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteChat(req, res, next) {
    try {
      const chatId = req.params.id;
      const result = await chatService.deleteChat(chatId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ChatController();
