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
}

module.exports = new ChatService();
