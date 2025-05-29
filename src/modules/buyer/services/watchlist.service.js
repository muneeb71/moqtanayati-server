const prisma = require('../../../config/prisma').default;

class WatchlistService {
  async getWatchlist(userId) {
    return prisma.watchlist.findMany({ where: { userId }, include: { auction: true } });
  }

  async addToWatchlist(userId, auctionId) {
    return prisma.watchlist.create({ data: { userId, auctionId } });
  }

  async removeFromWatchlist(userId, auctionId) {
    await prisma.watchlist.deleteMany({ where: { userId, auctionId } });
  }
}

module.exports = new WatchlistService(); 