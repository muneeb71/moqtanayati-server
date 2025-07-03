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
      where: {
        chatId: chat.id,
      },
      include: {
        sender: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async sendMessage(userAId, userBId, content, chatId) {
    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          { userAId, userBId },
          { userAId: userBId, userBId: userAId },
        ],
      },
    });
    // if (!chat) {
    //   chat = await prisma.chat.create({
    //     data: { userAId, userBId },
    //   });
    // }
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userAId,
        chatId,
      },
    });
    return message;
  }

  async createChat(userAId, userBId) {
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
    if (userA.role === 'SELLER' && userB.role === 'BUYER') {
      // Swap so userA is always BUYER and userB is SELLER
      [userAId, userBId] = [userBId, userAId];
    } else if (!(userA.role === 'BUYER' && userB.role === 'SELLER')) {
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
}

module.exports = new ChatService();
