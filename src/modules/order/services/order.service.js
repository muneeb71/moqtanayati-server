const prisma = require('../../config/prisma').default;

class OrderService {
  async createOrder(orderData) {
    const { items, ...orderDetails } = orderData;

    return await prisma.$transaction(async (prisma) => {
      const order = await prisma.order.create({
        data: {
          ...orderDetails,
          items: {
            create: items
          }
        },
        include: {
          items: true
        }
      });

      return order;
    });
  }

  async getAllOrders() {
    return prisma.order.findMany({ include: { items: true } });
  }

  async getOrderById(id) {
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new Error('Order not found');
    return order;
  }

  async updateOrder(id, data) {
    const order = await prisma.order.update({ where: { id }, data, include: { items: true } });
    return order;
  }

  async deleteOrder(id) {
    await prisma.order.delete({ where: { id } });
  }

  async getActiveOrders() {
    return prisma.order.findMany({ where: { OR: [{ status: 'PENDING' }, { status: 'PROCESSING' }] }, include: { items: true } });
  }

  async getCompletedOrders() {
    return prisma.order.findMany({ where: { status: 'DELIVERED' }, include: { items: true } });
  }

  async getCancelledOrders() {
    return prisma.order.findMany({ where: { status: 'CANCELLED' }, include: { items: true } });
  }

  async getReturnedOrders() {
    return prisma.order.findMany({ where: { status: 'RETURNED' }, include: { items: true } });
  }

  async getOrderDetails(id) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        seller: true,
      },
    });
    if (!order) throw new Error('Order not found');
    return order;
  }

  async updateOrderStatus(id, status) {
    const order = await prisma.order.update({ where: { id }, data: { status }, include: { items: true } });
    return order;
  }

  async handleCancelRequest(id) {
    const order = await prisma.order.update({ where: { id }, data: { status: 'CANCELLED' }, include: { items: true } });
    return order;
  }

  async handleReturnRequest(id) {
    const order = await prisma.order.update({ where: { id }, data: { status: 'RETURNED' }, include: { items: true } });
    return order;
  }
}

module.exports = new OrderService(); 