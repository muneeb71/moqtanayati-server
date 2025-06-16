const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class AuctionService {
  async createAuction(data) {
    const requiredFields = [
      "productId",
      "sellerId",
      "title",
      "description",
      "startTime",
      "endTime",
      "startingBid",
      "status",
    ];
    for (const field of requiredFields) {
      if (!data[field]) throw new Error(`Missing required field: ${field}`);
    }
    const auction = await prisma.auction.create({ data });
    return auction;
  }

  async getAllAuctions() {
    return prisma.auction.findMany();
  }

  async getAuctionById(id) {
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        product: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: {
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!auction) throw new Error("Auction not found");
    return auction;
  }

  async updateAuction(id, data) {
    const auction = await prisma.auction.update({ where: { id }, data });
    return auction;
  }

  async deleteAuction(id) {
    await prisma.auction.delete({ where: { id } });
  }

  async getLiveAuctions() {
    return prisma.auction.findMany({ where: { status: "LIVE" } });
  }

  async getUpcomingAuctions() {
    return prisma.auction.findMany({ where: { status: "UPCOMING" } });
  }

  async getAuctionHistory() {
    return prisma.auction.findMany({
      where: { OR: [{ status: "ENDED" }, { status: "CANCELLED" }] },
    });
  }

  async getAuctionDetails(id) {
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          include: {
            bidder: true,
          },
          orderBy: { createdAt: "desc" },
        },
        product: true,
        seller: true,
      },
    });
    if (!auction) throw new Error("Auction not found");
    return auction;
  }

  async updateAuctionStatus(id, status) {
    const auction = await prisma.auction.update({
      where: { id },
      data: { status },
    });
    return auction;
  }

  async getSellerAuctions(sellerId) {
    const products = await prisma.auction.findMany({
      where: {
        sellerId: sellerId,
      },
      include: {
        product: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bids: {
          include: {
            bidder: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return products;
  }
}

module.exports = new AuctionService();
