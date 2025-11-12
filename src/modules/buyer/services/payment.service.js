const prisma = require("../../../config/prisma");

class PaymentService {
  async getPaymentMethods(userId) {
    return prisma.paymentMethod.findMany({ where: { userId } });
  }

  async addPaymentMethod(userId, data) {
    console.log("body :", data);
    console.log("user id :", userId);
    return prisma.paymentMethod.create({ data: { ...data, userId } });
  }

  async removePaymentMethod(userId, id) {
    await prisma.paymentMethod.deleteMany({ where: { userId, id } });
  }
}

module.exports = new PaymentService();
