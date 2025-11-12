const prisma = require("../../../config/prisma");

class WatchlistService {
  async getWatchlist(userId) {
    return prisma.watchlist.findMany({
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
    const watchlist = await prisma.watchlist.findFirst({
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
      const auction = await prisma.auction.findUnique({
        where: { productId },
      });

      if (!auction) {
        throw new Error("Auction not found for this product");
      }

      const existing = await prisma.watchlist.findFirst({
        where: {
          userId,
          auctionId: auction.id,
        },
      });

      if (existing) {
        throw new Error("Item already in watchlist");
      }

      const watchlistItem = await prisma.watchlist.create({
        data: {
          userId,
          auctionId: auction.id,
        },
      });

      // Fetch the full watchlist item with auction details
      const fullWatchlistItem = await prisma.watchlist.findUnique({
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

  async removeFromWatchlist(watchlistId) {
    const result = await prisma.watchlist.deleteMany({
      where: {
        id: watchlistId,
      },
    });

    console.log("result : ", result);

    if (result.count === 0) {
      return {
        success: false,
        message: "Watchlist item not found",
      };
    }

    return {
      success: true,
      message: "Watchlist item removed successfully",
    };
  }
}

module.exports = new WatchlistService();
