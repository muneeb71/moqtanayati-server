const prisma = require('../../../config/prisma').default;

class ProfileService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
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