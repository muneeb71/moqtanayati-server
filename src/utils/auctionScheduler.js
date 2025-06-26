const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuctionScheduler {
  constructor() {
    this.isRunning = false;
  }

  // Function to check and update auction statuses
  async checkAndUpdateAuctionStatuses() {
    if (this.isRunning) {
      console.log('Auction status check already running, skipping...');
      return;
    }

    this.isRunning = true;
    const now = new Date();
    
    console.log(`\n[${now.toISOString()}] Starting auction status check...`);
    
    try {
      // Get all auctions with their product details
      const auctions = await prisma.auction.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              auctionLaunchDate: true,
              auctionDuration: true
            }
          }
        }
      });

      console.log(`Found ${auctions.length} total auctions to check`);

      let updatedCount = 0;
      let liveCount = 0;
      let endedCount = 0;

      for (const auction of auctions) {
        const { product } = auction;
        
        if (!product.auctionLaunchDate) {
          console.log(`Auction ${auction.id} (${product.name}) has no launch date, skipping...`);
          continue;
        }

        const launchDate = new Date(product.auctionLaunchDate);
        const endDate = product.auctionDuration 
          ? new Date(launchDate.getTime() + (product.auctionDuration * 24 * 60 * 60 * 1000))
          : null;

        console.log(`\n Checking auction: ${auction.id}`);
        console.log(`   Product: ${product.name}`);
        console.log(`   Current Status: ${auction.status}`);
        console.log(`   Launch Date: ${launchDate.toISOString()}`);
        console.log(`   Current Time: ${now.toISOString()}`);
        console.log(`   Duration: ${product.auctionDuration} Days`);
        console.log(`   End Date: ${endDate ? endDate.toISOString() : 'Not set'}`);

        let newStatus = null;

        // Check if auction should be LIVE
        if (auction.status === 'UPCOMING' && now >= launchDate) {
          newStatus = 'LIVE';
          console.log(`Should be LIVE (launch date passed)`);
        }
        // Check if auction should be ENDED
        else if (auction.status === 'LIVE' && endDate && now >= endDate) {
          newStatus = 'ENDED';
          console.log(`Should be ENDED (duration expired)`);
        }
        // Check if auction should be ENDED (no duration set but launch date passed)
        else if (auction.status === 'LIVE' && !endDate && now >= launchDate) {
          newStatus = 'ENDED';
          console.log(`Should be ENDED (no duration set, launch date passed)`);
        }
        else {
          console.log(`No status change needed`);
        }

        // Update auction status if needed
        if (newStatus && newStatus !== auction.status) {
          try {
            await prisma.auction.update({
              where: { id: auction.id },
              data: { status: newStatus }
            });

            console.log(`Updated status from ${auction.status} to ${newStatus}`);
            updatedCount++;

            if (newStatus === 'LIVE') {
              liveCount++;
            } else if (newStatus === 'ENDED') {
              endedCount++;
            }
          } catch (error) {
            console.error(`Error updating auction ${auction.id}:`, error.message);
          }
        }
      }

      console.log(`\n Summary:`);
      console.log(`   Total auctions checked: ${auctions.length}`);
      console.log(`   Status updates: ${updatedCount}`);
      console.log(`   Made LIVE: ${liveCount}`);
      console.log(`   Made ENDED: ${endedCount}`);
      console.log(`   No changes: ${auctions.length - updatedCount}`);

    } catch (error) {
      console.error('Error in auction status check:', error);
    } finally {
      this.isRunning = false;
      console.log(`Auction status check completed at ${new Date().toISOString()}\n`);
    }
  }

  // Start the scheduler
  start() {
    console.log('🚀 Starting auction status scheduler...');
    
    // Run every minute
    cron.schedule('* * * * *', () => {
      this.checkAndUpdateAuctionStatuses();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('⏰ Auction status scheduler is now running every minute');
    
    // Run initial check
    this.checkAndUpdateAuctionStatuses();
  }

  // Stop the scheduler
  stop() {
    console.log('Stopping auction status scheduler...');
    cron.getTasks().forEach(task => task.stop());
  }

  // Manual trigger for testing
  async manualCheck() {
    console.log('Manual auction status check triggered');
    await this.checkAndUpdateAuctionStatuses();
  }
}

module.exports = new AuctionScheduler(); 