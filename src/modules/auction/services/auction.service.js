const { PrismaClient } = require("@prisma/client");
const prisma = require('../../../config/prisma');

const prismaClient = new PrismaClient();

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
    const auction = await prismaClient.auction.create({ data });
    return auction;
  }

  async getAllAuctions() {
    return prismaClient.auction.findMany();
  }

  async getAuctionById(id) {
    const auction = await prismaClient.auction.findUnique({
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
    const auction = await prismaClient.auction.update({ where: { id }, data });
    return auction;
  }

  async deleteAuction(id) {
    await prismaClient.auction.delete({ where: { id } });
  }

  async getLiveAuctions() {
    return prismaClient.auction.findMany({ where: { status: "LIVE" } });
  }

  async getUpcomingAuctions() {
    return prismaClient.auction.findMany({ where: { status: "UPCOMING" } });
  }

  async getAuctionHistory() {
    return prismaClient.auction.findMany({
      where: { OR: [{ status: "ENDED" }, { status: "CANCELLED" }] },
    });
  }

  async getAuctionDetails(id) {
    const auction = await prismaClient.auction.findUnique({
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
    const auction = await prismaClient.auction.update({
      where: { id },
      data: { status },
    });
    return auction;
  }

  async getSellerAuctions(sellerId) {
    const products = await prismaClient.auction.findMany({
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

  async placeBid({ userId, productId, amount }) {
    const auction = await prismaClient.auction.findUnique({
      where: { productId },
      include: { bids: true, product: true }
    });
    if (!auction) throw new Error('Auction not found');

    if (auction.bids.some(bid => bid.amount === amount)) {
      throw new Error('A bid with this amount already exists.');
    }

    const highestBid = auction.bids.length
      ? Math.max(...auction.bids.map(bid => bid.amount))
      : 0;
    if (amount <= highestBid) {
      throw new Error('Bid must be higher than the current highest bid.');
    }

    const existingBid = auction.bids.find(bid => bid.bidderId === userId);

    let bid;
    if (existingBid) {
      bid = await prismaClient.bid.update({
        where: { id: existingBid.id },
        data: { amount }
      });
    } else {
      bid = await prismaClient.bid.create({
        data: {
          auctionId: auction.id,
          bidderId: userId,
          amount,
        },
      });
    }

    await prismaClient.product.update({
      where: { id: productId },
      data: { minimumOffer: amount }
    });

    if (auction.product.buyItNow && amount >= auction.product.buyItNow) {
      await prismaClient.auction.update({
        where: { id: auction.id },
        data: { status: 'ENDED' }
      });
      await prismaClient.product.update({
        where: { id: productId },
        data: { status: 'SOLD' }
      });
    }

    return bid;
  }

  async getBidsByProductId(productId) {
    const auction = await prismaClient.auction.findUnique({
      where: { productId },
      include: {
        bids: {
          include: {
            bidder: true,
          },
          orderBy: { amount: 'desc' },
        },
      },
    });
    if (!auction) throw new Error('Auction not found');
    return auction.bids;
  }
}

module.exports = new AuctionService();
