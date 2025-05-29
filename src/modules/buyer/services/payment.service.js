const prisma = require('../../../config/prisma').default;

class PaymentService {
  async getPaymentMethods(userId) {
    return prisma.paymentMethod.findMany({ where: { userId } });
  }

  async addPaymentMethod(userId, data) {
    return prisma.paymentMethod.create({ data: { ...data, userId } });
  }

  async removePaymentMethod(userId, id) {
    await prisma.paymentMethod.deleteMany({ where: { userId, id } });
  }
}

module.exports = new PaymentService(); 