const prisma = require('../../../config/prisma').default;

class PreferencesService {
  async getPreferences(userId) {
    return prisma.auctionPreference.findUnique({ where: { userId } });
  }

  async updatePreferences(userId, data) {
    const existing = await prisma.auctionPreference.findUnique({ where: { userId } });
    if (existing) {
      return prisma.auctionPreference.update({ where: { userId }, data });
    } else {
      return prisma.auctionPreference.create({ data: { ...data, userId } });
    }
  }
}

module.exports = new PreferencesService(); 