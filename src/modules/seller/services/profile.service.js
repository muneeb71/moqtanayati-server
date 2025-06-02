const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ProfileService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log("PROFLE", user);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId, data) {
    const user = await prisma.user.update({ where: { id: userId }, data });
    return user;
  }

  async updateStatus(userId, status) {
    const user = await prisma.user.update({ where: { id: userId }, data: { status } });
    return user;
  }
}

module.exports = new ProfileService(); 