const prisma = require('../../../config/prisma');

class ChatService {
  async getConversations(userId) {
    return prisma.chat.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      },
      include: {
        userA: {
          select: { id: true, name: true, avatar: true }
        },
        userB: {
          select: { id: true, name: true, avatar: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  async getMessages(userId, chatId) {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { userAId: userId },
          { userBId: userId }
        ]
      }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return prisma.message.findMany({
      where: { chatId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async sendMessage(senderId, chatId, content) {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [
          { userAId: senderId },
          { userBId: senderId }
        ]
      }
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    const message = await prisma.message.create({
      data: {
        content,
        userId: senderId,
        chatId: chatId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    // Also update the 'updatedAt' field of the chat
    await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
    });

    return message;
  }
}

module.exports = new ChatService(); 