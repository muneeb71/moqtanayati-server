const prisma = require("../../../config/prisma");

class AddressService {
  async getAddresses(userId) {
    return prisma.address.findMany({ where: { userId } });
  }

  async addAddress(userId, data) {
    if (data.id) {
      const existing = await prisma.address.findFirst({
        where: { id: data.id, userId },
      });
      if (existing) {
        return prisma.address.update({
          where: { id: data.id },
          data: { ...data, userId },
        });
      }
    }
    return prisma.address.create({ data: { ...data, userId } });
  }

  async removeAddress(userId, id) {
    await prisma.address.deleteMany({ where: { userId, id } });
  }
}

module.exports = new AddressService();
