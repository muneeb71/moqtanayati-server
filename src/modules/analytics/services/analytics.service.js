const prisma = require('../../../config/prisma');

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

  async getSellerAnalytics(userId) {  
    const totalSales = await prisma.order.aggregate({
      where: { sellerId: userId, status: 'DELIVERED' },
      _sum: { totalAmount: true }
    });

    const activeOrders = await prisma.order.count({
      where: {
        sellerId: userId,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    const completedOrders = await prisma.order.count({
      where: {
        sellerId: userId,
        status: 'DELIVERED'
      }
    });

    const reviews = await prisma.review.findMany({
      where: { sellerId: userId }
    });
    const totalReviews = reviews.length;
    const positive = reviews.filter(r => r.rating >= 4).length;
    const neutral = reviews.filter(r => r.rating === 3).length;
    const negative = reviews.filter(r => r.rating === 1 || r.rating === 2).length;
    const nil = totalReviews === 0 ? 1 : 0;

    const ratings = {
      positive: totalReviews ? (positive / totalReviews) * 100 : 0,
      neutral: totalReviews ? (neutral / totalReviews) * 100 : 0,
      negative: totalReviews ? (negative / totalReviews) * 100 : 0,
      nil: totalReviews === 0 ? 100 : 0
    };

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    const salesByMonth = await Promise.all(months.map(async ({ year, month }) => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      const sales = await prisma.order.aggregate({
        where: {
          sellerId: userId,
          status: 'DELIVERED',
          createdAt: { gte: start, lt: end }
        },
        _sum: { totalAmount: true }
      });
      return { month, year, sales: sales._sum.totalAmount || 0 };
    }));

    return {
      totalSales: totalSales._sum.totalAmount || 0,
      activeOrders,
      completedOrders,
      ratings,
      salesByMonth
    };
  }
}

module.exports = new AnalyticsService(); 