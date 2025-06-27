const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

class ProfileService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        store: {
          include: {
            products: true,
          },
        },
        orders: true,
        sellerOrders: true,
        payments: true,
        auctions: {
          include: {
            product: true,
            bids: {
              include: {
                bidder: true,
              },
            },
          },
        },
        bids: true,
        preferences: true,
        watchlists: {
          include: {
            auction: {
              include: {
                product: true,
                seller: true
              }
            }
          }
        },
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

  async changePassword(userId, currentPassword, newPassword, confirmNewPassword) {
    if (newPassword !== confirmNewPassword) {
      throw new Error("New password and confirm password do not match");
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { message: "Password changed successfully" };
  }
}

module.exports = new ProfileService();
