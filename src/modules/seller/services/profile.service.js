const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

class ProfileService {
  async updateProfile(userId, data) {
    // const allowedFields = ["name", "phone", "email", "nationalId", "address"];
    const allowedFields = ["name"];
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
      data: { accountStatus: status },
    });
    return user;
  }

  async changePassword(
    userId,
    currentPassword,
    newPassword,
    confirmNewPassword
  ) {
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

  async updateAuctionPreference(userId, preferenceData) {
    const { categories, minPrice, maxPrice, alertEnding, alertNew } =
      preferenceData;
    const existing = await prisma.auctionPreference.findFirst({
      where: { userId },
    });
    if (existing) {
      const updated = await prisma.auctionPreference.update({
        where: { id: existing.id },
        data: { categories, minPrice, maxPrice, alertEnding, alertNew },
      });
      return updated;
    } else {
      const created = await prisma.auctionPreference.create({
        data: { userId, categories, minPrice, maxPrice, alertEnding, alertNew },
      });
      return created;
    }
  }
}

module.exports = new ProfileService();
