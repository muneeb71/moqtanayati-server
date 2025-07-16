const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ExcelJS = require("exceljs");
const path = require("path");

class AdminService {
  // Dashboard
  async getDashboardStats() {
    const [monthlyProfit, bidsPlaced, bidsSuccessful, completedOrders] =
      await Promise.all([
        this.calculateMonthlyProfit(),
        prisma.bid.count(),
        prisma.bid.count({ where: { status: "WON" } }),
        prisma.order.count({ where: { status: "DELIVERED" } }),
      ]);

    return {
      monthlyProfit,
      bidsPlaced,
      bidsSuccessful,
      completedOrders,
    };
  }

  async getProfitChart(period) {
    const endDate = new Date();
    const startDate = new Date();

    if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 6);
    } else if (period === "year") {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const rawProfits = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Grouping by "YYYY-MM"
    const monthlyProfitsMap = {};

    for (const { amount, createdAt } of rawProfits) {
      const year = createdAt.getFullYear();
      const month = String(createdAt.getMonth() + 1).padStart(2, "0"); // 01-12
      const key = `${year}-${month}`;

      if (!monthlyProfitsMap[key]) {
        monthlyProfitsMap[key] = 0;
      }

      monthlyProfitsMap[key] += Number(amount);
    }

    // Create result for last 6 or 12 months
    const result = [];
    const now = new Date();
    const count = period === "month" ? 6 : 12;

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;
      const name = date.toLocaleString("default", { month: "short" });

      result.push({
        name,
        profit: monthlyProfitsMap[key] || 0,
      });
    }

    return result;
  }

  async getOrdersChart() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    // Create a list of last 7 months (0-indexed) from current month
    const months = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(currentYear, currentMonth - (6 - i));
      return {
        name: date.toLocaleString("default", { month: "short" }),
        month: date.getMonth() + 1, // 1-indexed
        year: date.getFullYear(),
      };
    });

    // Fetch orders for those months only
    const startDate = new Date(months[0].year, months[0].month - 1, 1);
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const allOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Count orders per month/year
    const monthlyCounts = {};
    for (const { createdAt } of allOrders) {
      const date = new Date(createdAt);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const key = `${y}-${m}`;
      monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    }

    // Build final chart data
    const chartData = months.map(({ name, month, year }) => {
      const thisYearKey = `${year}-${month}`;
      const lastYearKey = `${year - 1}-${month}`;

      return {
        name,
        thisYear: monthlyCounts[thisYearKey] || 0,
        lastYear: monthlyCounts[lastYearKey] || 0,
      };
    });

    return chartData;
  }

  // Users
  async getUsers({
    role,
    status,
    page = 1,
    limit = 10,
    search = "",
    filter = "",
  }) {
    const skip = (page - 1) * limit;

    const trimmedSearch = typeof search === "string" ? search.trim() : "";
    const trimmedFilter =
      typeof filter === "string" ? filter.trim().toUpperCase() : "";

    const baseWhere = {};

    // Apply role filter if explicitly passed or from filter
    if (role) {
      baseWhere.role = role;
    } else if (trimmedFilter === "SELLER" || trimmedFilter === "BUYER") {
      baseWhere.role = trimmedFilter;
    }

    // Apply status filter
    if (status) {
      baseWhere.accountStatus = status;
    }

    // Apply search logic
    const where =
      trimmedSearch.length > 0
        ? {
            AND: [
              baseWhere,
              {
                OR: [
                  { name: { contains: trimmedSearch, mode: "insensitive" } },
                  { email: { contains: trimmedSearch, mode: "insensitive" } },
                ],
              },
            ],
          }
        : baseWhere;

    // Apply sorting logic based on filter
    let orderBy = { registrationDate: "asc" };

    if (trimmedFilter === "NEWEST") {
      orderBy = { registrationDate: "desc" };
    } else if (trimmedFilter === "OLDEST") {
      orderBy = { registrationDate: "asc" };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountStatus: true,
          verificationStatus: true,
          registrationDate: true, // Ensure this field exists in your DB
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            product: true,
          },
        },
        payments: true,
        reviews: true,
        auctions: {
          include: {
            product: true,
            bids: true,
          },
        },
        watchlists: {
          include: {
            auction: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "SELLER") {
      const store = await prisma.store.findUnique({
        where: { userId: id },
      });

      if (store) {
        const listings = await prisma.product.findMany({
          where: { storeId: store.id },
        });

        const sales = await prisma.order.findMany({
          where: {
            sellerId: id,
          },
          include: {
            product: true,
          },
        });

        const buyerIds = sales.map((sale) => sale.userId);

        const payments = await prisma.payment.findMany({
          where: {
            userId: {
              in: buyerIds,
            },
          },
        });

        return {
          user,
          listings,
          sales,
          payments,
        };
      }
    }

    var data = {
      user,
    };

    return data;
  }

  async updateUserStatus(id, status) {
    return prisma.user.update({
      where: { id },
      data: { accountStatus: status },
    });
  }

  async verifyUser(id, status) {
    return prisma.user.update({
      where: { id },
      data: { verificationStatus: status },
    });
  }

  async deleteUser(id) {
    return prisma.user.delete({
      where: { id },
    });
  }

  // Orders
  async getOrders({ status, page, limit, search = "", filter = "" }) {
    const skip = (page - 1) * limit;

    const trimmedSearch = typeof search === "string" ? search.trim() : "";
    const trimmedFilter =
      typeof filter === "string" ? filter.trim().toUpperCase() : "";

    // Base filters
    const baseWhere = {};

    // Apply role filter if explicitly passed or from filter
    if (status) {
      baseWhere.status = status;
    } else if (
      trimmedFilter === "DELIVERED" ||
      trimmedFilter === "PENDING" ||
      trimmedFilter === "PROCESSING" ||
      trimmedFilter === "CANCELLED"
    ) {
      baseWhere.status = trimmedFilter;
    }

    // if (status) {
    //   baseWhere.status = status; // exact match
    // }

    // Build OR search conditions
    let searchConditions = [];

    if (trimmedSearch) {
      searchConditions = [
        { user: { name: { contains: trimmedSearch, mode: "insensitive" } } },
        { user: { email: { contains: trimmedSearch, mode: "insensitive" } } },
        { seller: { name: { contains: trimmedSearch, mode: "insensitive" } } },
        { seller: { email: { contains: trimmedSearch, mode: "insensitive" } } },
        { product: { name: { contains: trimmedSearch, mode: "insensitive" } } },
      ];

      // Also match exact enum values for status and paymentStatus
      const upperSearch = trimmedSearch.toUpperCase();

      const validStatusValues = [
        "PENDING",
        "DELIVERED",
        "PROCESSING",
        "CANCELLED",
      ];
      const validPaymentStatusValues = ["PENDING", "COMPLETED", "FAILED"];

      if (validStatusValues.includes(upperSearch)) {
        searchConditions.push({ status: upperSearch });
      }

      if (validPaymentStatusValues.includes(upperSearch)) {
        searchConditions.push({ paymentStatus: upperSearch });
      }
    }

    // Final where clause
    const where =
      searchConditions.length > 0
        ? {
            AND: [
              baseWhere,
              {
                OR: searchConditions,
              },
            ],
          }
        : baseWhere;

    // Apply sorting logic based on filter
    let orderBy = { createdAt: "asc" };

    if (trimmedFilter === "NEWEST") {
      orderBy = { createdAt: "desc" };
    } else if (trimmedFilter === "OLDEST") {
      orderBy = { createdAt: "asc" };
    }

    // Prisma queries
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        orderBy,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, email: true } },
          product: true,
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderDetails(id) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        seller: true,
        product: true,
        payment: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  async updateOrderStatus(id, status) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  // Auctions
  async getAuctions({ status, page, limit, search = "", filter = "" }) {
    const skip = (page - 1) * limit;
    const trimmedSearch = typeof search === "string" ? search.trim() : "";
    const trimmedFilter =
      typeof filter === "string" ? filter.trim().toLowerCase() : "";

    const baseWhere = {};

    // Handle status via query or filter
    if (status) {
      baseWhere.status = status.toUpperCase();
    } else if (["upcoming", "ended", "live"].includes(trimmedFilter)) {
      baseWhere.status = trimmedFilter.toLowerCase();
    }

    // Build search logic
    const searchConditions = [];
    const isNumericSearch = !isNaN(Number(trimmedSearch));
    const numericSearchValue = Number(trimmedSearch);

    if (trimmedSearch) {
      searchConditions.push(
        { seller: { name: { contains: trimmedSearch, mode: "insensitive" } } },
        { seller: { email: { contains: trimmedSearch, mode: "insensitive" } } },
        { product: { name: { contains: trimmedSearch, mode: "insensitive" } } }
      );

      if (isNumericSearch) {
        searchConditions.push({ product: { startingBid: numericSearchValue } });
        searchConditions.push({
          bids: {
            some: {
              amount: numericSearchValue,
            },
          },
        });
      }

      const validStatuses = ["PENDING", "ENDED", "UPCOMING", "LIVE"];
      if (validStatuses.includes(trimmedSearch.toUpperCase())) {
        searchConditions.push({ status: trimmedSearch.toUpperCase() });
      }
    }

    const where =
      searchConditions.length > 0
        ? {
            AND: [baseWhere, { OR: searchConditions }],
          }
        : baseWhere;

    // Apply sorting logic based on filter
    let orderBy = { createdAt: "asc" };

    if (trimmedFilter === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (trimmedFilter === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    // Fetch all matching auctions (for sorting and pagination)
    let auctions = await prisma.auction.findMany({
      where,
      orderBy,
      include: {
        seller: { select: { id: true, name: true, email: true } },
        product: true,
        bids: {
          include: {
            bidder: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    // Custom sorting
    switch (trimmedFilter) {
      case "highest starting bid":
        auctions.sort((a, b) => b.product.startingBid - a.product.startingBid);
        break;
      case "lowest starting bid":
        auctions.sort((a, b) => a.product.startingBid - b.product.startingBid);
        break;
      case "highest current bid":
        auctions.sort((a, b) => {
          const maxA =
            a.bids.length > 0
              ? Math.max(...a.bids.map((bid) => bid.amount))
              : 0;
          const maxB =
            b.bids.length > 0
              ? Math.max(...b.bids.map((bid) => bid.amount))
              : 0;
          return maxB - maxA; // descending
        });
        break;

      case "lowest current bid":
        auctions.sort((a, b) => {
          const maxA =
            a.bids.length > 0
              ? Math.max(...a.bids.map((bid) => bid.amount))
              : 0;
          const maxB =
            b.bids.length > 0
              ? Math.max(...b.bids.map((bid) => bid.amount))
              : 0;
          return maxA - maxB; // ascending
        });
        break;

      default:
        auctions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    // Apply pagination AFTER sorting
    const total = auctions.length;
    const paginated = auctions.slice(skip, skip + limit);

    return {
      auctions: paginated,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
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
            bidder: true,
          },
        },
      },
    });

    if (!auction) {
      throw new Error("Auction not found");
    }

    return auction;
  }

  async cancelAuction(id) {
    return prisma.auction.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }

  // Reviews
  async getReviews({ status, page, limit, search = "" }) {
    const skip = (page - 1) * limit;
    const trimmedSearch = typeof search === "string" ? search.trim() : "";

    // Base filter
    const baseWhere = status ? { status } : {};

    // Search conditions
    let searchConditions = [];

    const isNumericSearch = !isNaN(Number(trimmedSearch));
    const numericSearchValue = Number(trimmedSearch);

    if (trimmedSearch) {
      searchConditions = [
        {
          seller: {
            name: { contains: trimmedSearch, mode: "insensitive" },
          },
        },
        {
          user: {
            name: { contains: trimmedSearch, mode: "insensitive" },
          },
        },
      ];

      if (isNumericSearch) {
        searchConditions.push({ rating: numericSearchValue });
      }
    }

    const where =
      searchConditions.length > 0
        ? {
            AND: [baseWhere, { OR: searchConditions }],
          }
        : baseWhere;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          seller: true,
          order: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async approveReview(id) {
    return prisma.review.update({
      where: { id },
      data: { status: "APPROVED" },
    });
  }

  async rejectReview(id) {
    return prisma.review.update({
      where: { id },
      data: { status: "REJECTED" },
    });
  }

  async deleteReview(id) {
    return prisma.review.delete({
      where: { id },
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
              seller: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCashPayments({ status, page, limit }) {
    return this.getPayments({
      status,
      page,
      limit,
      where: { gateway: "CASH" },
    });
  }

  async getThirdPartyPayments({ status, page, limit }) {
    return this.getPayments({
      status,
      page,
      limit,
      where: {
        NOT: { gateway: "CASH" },
      },
    });
  }

  async updatePaymentStatus(id, status) {
    return prisma.payment.update({
      where: { id },
      data: { status },
    });
  }

  // Reports

  // async getBuyersReport() {
  //   const buyers = await prisma.user.findMany({
  //     where: {
  //       role: "BUYER",
  //     },
  //   });

  //   const reports = await Promise.all(
  //     buyers.map(async (buyer) => {
  //       const deliveredOrders = await prisma.order.findMany({
  //         where: {
  //           userId: buyer.id,
  //           status: "DELIVERED",
  //         },
  //         select: {
  //           totalAmount: true,
  //         },
  //       });
  //       console.log("delibered : ", deliveredOrders);

  //       const ordersDispatched = deliveredOrders.length;
  //       const paymentsEarned = deliveredOrders.reduce(
  //         (sum, order) => sum + order.totalAmount,
  //         0
  //       );

  //       return {
  //         user: buyer,
  //         ordersDispatched,
  //         paymentsEarned,
  //       };
  //     })
  //   );

  //   return reports;
  // }

  async getReport({ role, page = 1, limit = 10, search = "", filter = "" }) {
    const skip = (page - 1) * limit;
    const trimmedSearch = typeof search === "string" ? search.trim() : "";
    const trimmedFilter =
      typeof filter === "string" ? filter.trim().toLowerCase() : "";

    // First, filter users by role and optional search
    const users = await prisma.user.findMany({
      where: {
        role,
        ...(trimmedSearch && {
          OR: [
            {
              name: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true, // Required for newest/oldest sorting
      },
    });

    // Count total matching users for pagination
    const total = users.length;

    // Apply sorting logic based on filter
    let orderBy = { createdAt: "asc" };

    if (trimmedFilter === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (trimmedFilter === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    // Prepare report data per user
    let reports = await Promise.all(
      users.map(async (user) => {
        const deliveredOrders = await prisma.order.findMany({
          where:
            role === "SELLER"
              ? { sellerId: user.id, status: "DELIVERED" }
              : { userId: user.id, status: "DELIVERED" },
          select: {
            totalAmount: true,
          },
          orderBy,
        });

        const ordersDispatched = deliveredOrders.length;
        const paymentsEarned = deliveredOrders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        );

        return {
          user,
          ordersDispatched,
          paymentsEarned,
        };
      })
    );

    // Apply custom sorting
    switch (trimmedFilter) {
      case "newest":
        reports.sort(
          (a, b) => new Date(b.user.createdAt) - new Date(a.user.createdAt)
        );
        break;
      case "oldest":
        reports.sort(
          (a, b) => new Date(a.user.createdAt) - new Date(b.user.createdAt)
        );
        break;
      case "highest orders dispatched":
        reports.sort((a, b) => b.ordersDispatched - a.ordersDispatched);
        break;
      case "lowest orders dispatched":
        reports.sort((a, b) => a.ordersDispatched - b.ordersDispatched);
        break;
      case "highest payment earned":
        reports.sort((a, b) => b.paymentsEarned - a.paymentsEarned);
        break;
      case "lowest payment earned":
        reports.sort((a, b) => a.paymentsEarned - b.paymentsEarned);
        break;
      default:
        break;
    }

    // Apply pagination **after** sorting
    const paginatedReports = reports.slice(skip, skip + limit);

    return {
      reports: paginatedReports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async exportReport(type, startDate, endDate, format) {
    let data;
    if (type === "buyers") {
      data = await this.getBuyersReport(startDate, endDate);
    } else if (type === "sellers") {
      data = await this.getSellersReport(startDate, endDate);
    } else {
      throw new Error("Invalid report type");
    }

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      // Add headers and data based on report type
      if (type === "buyers") {
        worksheet.columns = [
          { header: "Name", key: "name" },
          { header: "Email", key: "email" },
          { header: "Registration Date", key: "registrationDate" },
          { header: "Orders Count", key: "ordersCount" },
          { header: "Total Spent", key: "totalSpent" },
        ];
      } else {
        worksheet.columns = [
          { header: "Name", key: "name" },
          { header: "Email", key: "email" },
          { header: "Registration Date", key: "registrationDate" },
          { header: "Products Count", key: "productsCount" },
          { header: "Auctions Count", key: "auctionsCount" },
          { header: "Total Sales", key: "totalSales" },
        ];
      }

      // Add rows
      worksheet.addRows(data);

      // Save file
      const fileName = `${type}-report-${new Date().getTime()}.xlsx`;
      const filePath = path.join(
        __dirname,
        "../../../../public/reports",
        fileName
      );
      await workbook.xlsx.writeFile(filePath);
      return filePath;
    }

    throw new Error("Unsupported format");
  }

  // Helper methods
  async calculateMonthlyProfit() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const profit = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        status: "COMPLETED",
      },
    });

    return profit._sum.amount || 0;
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateProfile(userId, data) {
    const allowedFields = ["name", "phone", "nationalId", "address"];

    const updateData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new Error("User not found");

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    return user;
  }
}

module.exports = new AdminService();
