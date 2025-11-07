const prisma = require("../../../config/prisma");

class ChatService {
  async getConversations(userId) {
    // fetch all chats
    const conversations = await prisma.chat.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: {
          select: { id: true, name: true, avatar: true },
        },
        userB: {
          select: { id: true, name: true, avatar: true },
        },
        messages: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            read: true,
            senderId: true,
            chatId: true,
          },
          // take: 1,
          // orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!conversations || conversations.length === 0) {
      const err = new Error("Chat does not exist");
      err.status = 404;
      throw err;
    }

    return conversations;
  }

  async getMessages(userAId, userBId) {
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
      include: {
        messages: true,
      },
    });
    if (!chat) {
      chat = await prisma.chat.create({
        data: { userAId, userBId },
      });
    }
    return prisma.message.findMany({
      where: { chatId: chat.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        read: true,
        senderId: true,
        chatId: true,
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async sendMessage(userAId, userBId, content, chatId) {
    console.log("🔍 ChatService.sendMessage called with:", {
      userAId,
      userBId,
      content,
      chatId,
    });

    let chat;

    if (chatId) {
      console.log("🔍 Looking for chat by ID:", chatId);
      // If chatId is provided, use it directly
      chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });
      console.log("🔍 Chat found by ID:", chat);
    } else {
      console.log("🔍 Looking for chat between users:", { userAId, userBId });
      // Find existing chat between users
      chat = await prisma.chat.findFirst({
        where: {
          OR: [
            { userAId, userBId },
            { userAId: userBId, userBId: userAId },
          ],
        },
      });
      console.log("🔍 Chat found between users:", chat);
    }

    if (!chat) {
      console.error("❌ Chat not found for:", { userAId, userBId, chatId });
      throw new Error("Chat not found");
    }

    console.log("💾 Creating message with data:", {
      content,
      senderId: userAId,
      chatId: chat.id,
    });

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userAId,
        chatId: chat.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        read: true,
        senderId: true,
        chatId: true,
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    console.log("✅ Message created successfully:", message);
    return message;
  }

  async createChat(userAId, userBId) {
    if (!userAId || !userBId) {
      throw new Error("Both userAId and userBId are required");
    }
    if (userAId === userBId) {
      throw new Error("Cannot create chat with yourself");
    }
    // Fetch both users
    const userA = await prisma.user.findUnique({ where: { id: userAId } });
    const userB = await prisma.user.findUnique({ where: { id: userBId } });
    if (!userA || !userB) {
      throw new Error("One or both users not found");
    }
    // Ensure userA is BUYER and userB is SELLER
    if (userA.role === "SELLER" && userB.role === "BUYER") {
      // Swap so userA is always BUYER and userB is SELLER
      [userAId, userBId] = [userBId, userAId];
    } else if (!(userA.role === "BUYER" && userB.role === "SELLER")) {
      throw new Error("Chats can only be created between a BUYER and a SELLER");
    }
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });
    if (chat) return chat;
    chat = await prisma.chat.create({
      data: { userAId, userBId },
    });
    return chat;
  }

  async markMessagesRead(conversationId, userId) {
    return prisma.message.updateMany({
      where: {
        chatId: conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });
  }

  async deleteChat(chatId, userId) {
    if (!chatId) {
      throw new Error("Chat ID is required");
    }

    // Find the chat and verify the user is part of it
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Delete all messages in the chat first
    await prisma.message.deleteMany({
      where: { chatId: chatId },
    });

    // Delete the chat
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return { message: "Chat and all messages deleted successfully" };
  }
}

module.exports = new ChatService();
