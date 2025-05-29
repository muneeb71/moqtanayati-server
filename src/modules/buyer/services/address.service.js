const prisma = require('../../../config/prisma').default;

class AddressService {
  async getAddresses(userId) {
    return prisma.address.findMany({ where: { userId } });
  }

  async addAddress(userId, data) {
    return prisma.address.create({ data: { ...data, userId } });
  }

  async removeAddress(userId, id) {
    await prisma.address.deleteMany({ where: { userId, id } });
  }
}

module.exports = new AddressService(); 