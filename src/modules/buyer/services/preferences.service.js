const prisma = require("../../../config/prisma");

class PreferencesService {
  async getPreferences(userId) {
    return prisma.auctionPreference.findFirst({ where: { userId } });
  }

  async updatePreferences(userId, data) {
    const existing = await prisma.auctionPreference.findFirst({
      where: { userId },
    });
    if (existing) {
      await prisma.auctionPreference.updateMany({
        where: { userId },
        data,
      });

      return prisma.auctionPreference.findFirst({ where: { userId } });
    } else {
      return prisma.auctionPreference.create({ data: { ...data, userId } });
    }
  }
}

module.exports = new PreferencesService();
