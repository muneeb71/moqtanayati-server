const { PrismaClient } = require("@prisma/client");
const prisma = require("../../../config/prisma");

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
    return prismaClient.auction.findMany({
      include: {
        product: true,
        seller: true,
        bids: {
          include: {
            bidder: true,
          },
        },
      },
    });
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
          bids: true,
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
            bidder: true,
          },
        },
      },
    });

    return products;
  }

  async placeBid({ userId, productId, amount }) {
    console.log("wp");

    if (!productId) {
      throw new Error("productId is required");
    }

    const auction = await prismaClient.auction.findUnique({
      where: { productId },
      include: {
        bids: {
          include: { bidder: true },
        },
        product: true,
      },
    });

    if (auction?.status === "UPCOMING") {
      throw new Error("Auction is not live yet!");
    }

    if (!auction) throw new Error("Auction not found");

    if (auction.bids.some((bid) => bid.amount === amount)) {
      throw new Error("A bid with this amount already exists.");
    }

    const highestBid = auction.bids.length
      ? Math.max(...auction.bids.map((bid) => bid.amount))
      : 0;

    if (amount <= highestBid) {
      throw new Error("Bid must be higher than the current highest bid.");
    }

    const previousHighestBid = auction.bids.find(
      (bid) => bid.amount === highestBid
    );
    if (previousHighestBid) {
      await prismaClient.bid.update({
        where: { id: previousHighestBid.id },
        data: { status: "OUTBID" },
      });
    }

    const existingBid = auction.bids.find((bid) => bid.bidderId === userId);

    let bid;
    if (existingBid) {
      bid = await prismaClient.bid.update({
        where: { id: existingBid.id },
        data: { amount },
        include: { bidder: true },
      });
    } else {
      bid = await prismaClient.bid.create({
        data: {
          auctionId: auction.id,
          bidderId: userId,
          amount,
        },
        include: { bidder: true },
      });
    }

    await prismaClient.product.update({
      where: { id: productId },
      data: { minimumOffer: amount },
    });

    if (auction.product.buyItNow && amount >= auction.product.buyItNow) {
      await prismaClient.auction.update({
        where: { id: auction.id },
        data: { status: "ENDED" },
      });
      await prismaClient.product.update({
        where: { id: productId },
        data: { status: "SOLD" },
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
          orderBy: { amount: "desc" },
        },
      },
    });
    if (!auction) throw new Error("Auction not found");
    return auction.bids;
  }

  async getMyBids(userId) {
    return await prismaClient.bid.findMany({
      where: { bidderId: userId },
      include: {
        bidder: true,
        auction: {
          include: {
            product: true,
            seller: true,
            bids: {
              include: {
                bidder: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async withdrawBid(userId, auctionId) {
    const bid = await prismaClient.bid.findFirst({
      where: {
        auctionId,
        bidderId: userId,
      },
      orderBy: { amount: "desc" },
    });

    if (!bid) {
      throw new Error("Bid not found for this user in the auction");
    }

    const wasHighest = bid.status === "HIGHEST";

    await prismaClient.bid.update({
      where: { id: bid.id },
      data: { status: "RETRACTED" },
    });

    const auction = await prismaClient.auction.findUnique({
      where: { id: auctionId },
      include: { product: true },
    });
    if (!auction) throw new Error("Auction not found");
    const productId = auction.productId;

    let newMinimumOffer = auction.product.startingBid;

    const nextHighest = await prismaClient.bid.findFirst({
      where: {
        auctionId,
        status: { not: "RETRACTED" },
      },
      orderBy: { amount: "desc" },
    });
    if (wasHighest && nextHighest) {
      await prismaClient.bid.update({
        where: { id: nextHighest.id },
        data: { status: "HIGHEST" },
      });
      newMinimumOffer = nextHighest.amount;
    } else if (wasHighest && !nextHighest) {
      newMinimumOffer = auction.product.startingBid;
    } else if (nextHighest) {
      newMinimumOffer = nextHighest.amount;
    }

    await prismaClient.product.update({
      where: { id: productId },
      data: { minimumOffer: newMinimumOffer },
    });

    return { message: "Bid retracted successfully" };
  }
}

module.exports = new AuctionService();
