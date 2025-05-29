const prisma = require('../../../config/prisma').default;

class AnalyticsService {
  async getDashboardStats(userId) {
    const totalRevenue = await prisma.payment.aggregate({
      where: { sellerId: userId, status: 'COMPLETED' },
      _sum: { amount: true }
    });

    const orderCount = await prisma.order.count({
      where: { sellerId: userId }
    });

    const inventoryCount = await prisma.product.count({
      where: { sellerId: userId, status: 'ACTIVE' }
    });

    const draftCount = await prisma.product.count({
      where: { sellerId: userId, status: 'DRAFT' }
    });

    const auctionCount = await prisma.auction.count({
      where: { sellerId: userId }
    });

    const reviewCount = await prisma.review.count({
      where: { sellerId: userId }
    });

    const monthlySales = await this.getMonthlySales(userId);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      orderCount,
      inventoryCount,
      draftCount,
      auctionCount,
      reviewCount,
      monthlySales
    };
  }

  async getMonthlySales(userId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const sales = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        sellerId: userId,
        status: 'COMPLETED',
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        amount: true
      }
    });

    return sales.map(sale => ({
      month: sale.createdAt,
      amount: sale._sum.amount
    }));
  }
}

module.exports = new AnalyticsService(); 