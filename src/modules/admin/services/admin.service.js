const prisma = require('../../../config/prisma').default;
const ExcelJS = require('exceljs');
const path = require('path');

class AdminService {
  // Dashboard
  async getDashboardStats() {
    const [
      monthlyProfit,
      bidsPlaced,
      bidsSuccessful,
      completedOrders
    ] = await Promise.all([
      this.calculateMonthlyProfit(),
      prisma.bid.count(),
      prisma.bid.count({ where: { status: 'WON' } }),
      prisma.order.count({ where: { status: 'COMPLETED' } })
    ]);

    return {
      monthlyProfit,
      bidsPlaced,
      bidsSuccessful,
      completedOrders
    };
  }

  async getProfitChart(period) {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const profits = await prisma.payment.groupBy({
      by: ['createdAt'],
      _sum: {
        amount: true
      },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    });

    return profits;
  }

  async getOrdersChart(period) {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const orders = await prisma.order.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return orders;
  }

  // Users
  async getUsers({ role, status, page, limit }) {
    const skip = (page - 1) * limit;
    const where = {};
    
    if (role) where.role = role;
    if (status) where.accountStatus = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountStatus: true,
          verificationStatus: true,
          registrationDate: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getUserDetails(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
        payments: true,
        reviews: true,
        auctions: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserStatus(id, status) {
    return prisma.user.update({
      where: { id },
      data: { accountStatus: status }
    });
  }

  async verifyUser(id, status) {
    return prisma.user.update({
      where: { id },
      data: { verificationStatus: status }
    });
  }

  async deleteUser(id) {
    return prisma.user.delete({
      where: { id }
    });
  }

  // Orders
  async getOrders({ status, page, limit }) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          product: true,
          payment: true
        }
      }),
      prisma.order.count({ where })
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getOrderDetails(id) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        seller: true,
        product: true,
        payment: true
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async updateOrderStatus(id, status) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  // Auctions
  async getAuctions({ status, page, limit }) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          product: true,
          bids: {
            include: {
              bidder: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.auction.count({ where })
    ]);

    return {
      auctions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getAuctionDetails(id) {
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        seller: true,
        product: true,
        bids: {
          include: {
            bidder: true
          }
        }
      }
    });

    if (!auction) {
      throw new Error('Auction not found');
    }

    return auction;
  }

  async cancelAuction(id) {
    return prisma.auction.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
  }

  // Reviews
  async getReviews({ status, page, limit }) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          seller: true,
          order: true
        }
      }),
      prisma.review.count({ where })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async approveReview(id) {
    return prisma.review.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
  }

  async rejectReview(id) {
    return prisma.review.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
  }

  async deleteReview(id) {
    return prisma.review.delete({
      where: { id }
    });
  }

  // Payments
  async getPayments({ status, page, limit }) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              user: true,
              seller: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getCashPayments({ status, page, limit }) {
    return this.getPayments({
      status,
      page,
      limit,
      where: { gateway: 'CASH' }
    });
  }

  async getThirdPartyPayments({ status, page, limit }) {
    return this.getPayments({
      status,
      page,
      limit,
      where: {
        NOT: { gateway: 'CASH' }
      }
    });
  }

  async updatePaymentStatus(id, status) {
    return prisma.payment.update({
      where: { id },
      data: { status }
    });
  }

  // Reports
  async getBuyersReport(startDate, endDate) {
    return prisma.user.findMany({
      where: {
        role: 'BUYER',
        registrationDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        _count: {
          select: {
            orders: true
          }
        },
        orders: {
          select: {
            totalAmount: true
          }
        }
      }
    });
  }

  async getSellersReport(startDate, endDate) {
    return prisma.user.findMany({
      where: {
        role: 'SELLER',
        registrationDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        _count: {
          select: {
            products: true,
            auctions: true
          }
        },
        orders: {
          select: {
            totalAmount: true
          }
        }
      }
    });
  }

  async exportReport(type, startDate, endDate, format) {
    let data;
    if (type === 'buyers') {
      data = await this.getBuyersReport(startDate, endDate);
    } else if (type === 'sellers') {
      data = await this.getSellersReport(startDate, endDate);
    } else {
      throw new Error('Invalid report type');
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');
      
      // Add headers and data based on report type
      if (type === 'buyers') {
        worksheet.columns = [
          { header: 'Name', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'Registration Date', key: 'registrationDate' },
          { header: 'Orders Count', key: 'ordersCount' },
          { header: 'Total Spent', key: 'totalSpent' }
        ];
      } else {
        worksheet.columns = [
          { header: 'Name', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'Registration Date', key: 'registrationDate' },
          { header: 'Products Count', key: 'productsCount' },
          { header: 'Auctions Count', key: 'auctionsCount' },
          { header: 'Total Sales', key: 'totalSales' }
        ];
      }

      // Add rows
      worksheet.addRows(data);

      // Save file
      const fileName = `${type}-report-${new Date().getTime()}.xlsx`;
      const filePath = path.join(__dirname, '../../../../public/reports', fileName);
      await workbook.xlsx.writeFile(filePath);
      return filePath;
    }

    throw new Error('Unsupported format');
  }

  // Helper methods
  async calculateMonthlyProfit() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const profit = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        createdAt: {
          gte: startOfMonth
        },
        status: 'COMPLETED'
      }
    });

    return profit._sum.amount || 0;
  }
}

module.exports = new AdminService(); 