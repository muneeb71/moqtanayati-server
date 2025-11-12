const prisma = require("../../../config/prisma");

class UserService {
  async getAllUsers() {
    return await prisma.user.findMany();
  }

  async getUserById(id) {
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
        auctions: true,
      },
    });

    if (!user) throw new Error("User not found");

    return user;
  }

  async getBuyerDetailById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new Error("User not found");

    const bidsPlaced = await prisma.bid.count({
      where: {
        bidderId: id,
      },
    });

    console.log("bidsPlaced", bidsPlaced);

    const bidsWon = await prisma.bid.count({
      where: {
        bidderId: id,
        status: "WON",
      },
    });
    console.log("bidsWon", bidsWon);

    const purchases = await prisma.order.count({
      where: {
        userId: id,
        deliveryStatus: "DELIVERED",
      },
    });

    const spentAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        userId: id,
        deliveryStatus: "DELIVERED",
      },
    });
    const spent = spentAgg._sum.totalAmount || 0;

    const reviews = await prisma.review.count({
      where: {
        userId: id,
      },
    });

    const ratingAgg = await prisma.review.aggregate({
      _sum: { rating: true },
      where: {
        userId: id,
      },
    });
    const rating = ratingAgg._sum.rating || 0;

    return {
      buyer: user,
      reviews: reviews,
      bidsPlaced: bidsPlaced,
      bidsWon: bidsWon,
      purchases: purchases,
      spent: spent,
      rating: rating,
    };
  }

  async editUser(id, data) {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    return user;
  }

  async deleteUser(id) {
    await prisma.user.delete({ where: { id } });
  }
}

module.exports = new UserService();
