const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ProfileService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: true,
        orders: true,
        sellerOrders: true,
        payments: true,
        auctions: true,
        bids: true,
        preferences: true,
        watchlists: true,
        carts: true,
        paymentMethods: true,
        addresses: true,
        notifications: true,
        chatsA: true,
        chatsB: true,
        messages: true,
        feedbacks: true,
        reviews: true,
        reviewsGiven: true,
        sellerSurvey: true,
      },
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateProfile(userId, data) {
    const allowedFields = ["name", "phone", "email", "nationalId", "address"];
    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new Error("User not found");

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return user;
  }

  async updateStatus(userId, status) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    return user;
  }
}

module.exports = new ProfileService();
