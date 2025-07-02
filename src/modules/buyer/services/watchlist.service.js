const prisma = require("../../../config/prisma").default;
const { PrismaClient } = require("@prisma/client");

const prismaClient = new PrismaClient();

class WatchlistService {
  async getWatchlist(userId) {
    return prismaClient.watchlist.findMany({
      where: { userId },
      include: {
        auction: {
          include: {
            product: true,
            seller: true,
            bids: true,
          },
        },
      },
    });
  }

  async getWatchlistById(userId, productId) {
    const watchlist = await prismaClient.watchlist.findFirst({
      where: {
        userId,
        auction: {
          productId,
        },
      },
    });

    if (!watchlist) {
      throw new Error("Watchlist item not found.");
    }

    return watchlist;
  }

  async addToWatchlist(userId, productId) {
    try {
      const auction = await prismaClient.auction.findUnique({
        where: { productId },
      });

      if (!auction) {
        throw new Error("Auction not found for this product");
      }

      const existing = await prismaClient.watchlist.findFirst({
        where: {
          userId,
          auctionId: auction.id,
        },
      });

      if (existing) {
        throw new Error("Item already in watchlist");
      }

      const watchlistItem = await prismaClient.watchlist.create({
        data: {
          userId,
          auctionId: auction.id,
        },
      });

      // Fetch the full watchlist item with auction details
      const fullWatchlistItem = await prismaClient.watchlist.findUnique({
        where: { id: watchlistItem.id },
        include: {
          auction: {
            include: {
              product: true,
              seller: true,
              bids: true,
            },
          },
        },
      });

      return fullWatchlistItem;
    } catch (error) {
      throw new Error(error.message || "Failed to add item to watchlist");
    }
  }

  async removeFromWatchlist(userId, productId) {
    await prismaClient.watchlist.deleteMany({ where: { userId, productId } });
  }
}

module.exports = new WatchlistService();
