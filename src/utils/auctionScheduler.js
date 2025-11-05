const cron = require("node-cron");
const prisma = require("../config/prisma");
const notificationService = require("../modules/notification/services/notification.service");

class AuctionScheduler {
  constructor() {
    this.isRunning = false;
    this.started = false;
  }

  async checkAndUpdateAuctionStatuses() {
    if (this.isRunning) {
      console.log("Auction status check already running, skipping...");
      return;
    }

    this.isRunning = true;
    const now = new Date();
    console.log(`\n[${now.toISOString()}] Starting auction status check...`);

    try {
      const auctions = await prisma.auction.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              auctionLaunchDate: true,
              auctionDuration: true,
              status: true,
            },
          },
        },
      });

      console.log(`Found ${auctions.length} total auctions to check`);

      let updatedCount = 0;
      let liveCount = 0;
      let endedCount = 0;

      for (const auction of auctions) {
        const { product } = auction;

        if (!product.auctionLaunchDate) {
          console.log(
            `Auction ${auction.id} (${product.name}) has no launch date, skipping...`
          );
          continue;
        }

        const launchDate = new Date(product.auctionLaunchDate);
        const endDate = product.auctionDuration
          ? new Date(
              launchDate.getTime() +
                product.auctionDuration * 24 * 60 * 60 * 1000
            )
          : null;

        console.log(`\n Checking auction: ${auction.id}`);
        console.log(`   Product: ${product.name}`);
        console.log(`   Product Status: ${product.status}`);
        console.log(`   Auction Status: ${auction.status}`);
        console.log(`   Launch Date: ${launchDate.toISOString()}`);
        console.log(`   Current Time: ${now.toISOString()}`);
        console.log(`   Duration: ${product.auctionDuration} Days`);
        console.log(
          `   End Date: ${endDate ? endDate.toISOString() : "Not set"}`
        );

        let newStatus = null;

        if (auction.status === "UPCOMING" && now >= launchDate) {
          newStatus = "LIVE";
          console.log(`Should be LIVE (launch date passed)`);
        } else if (auction.status === "LIVE" && endDate && now >= endDate) {
          newStatus = "ENDED";
          console.log(`Should be ENDED (duration expired)`);
        } else if (auction.status === "LIVE" && !endDate) {
          // Only end if no duration is set at all (indefinite auctions)
          // Don't end auctions that have a duration - they should run for the full duration
          console.log(`Auction has no end date set - keeping LIVE status`);
        } else {
          console.log(`No status change needed`);
        }

        if (newStatus && newStatus !== auction.status) {
          try {
            await prisma.auction.update({
              where: { id: auction.id },
              data: { status: newStatus },
            });

            console.log(
              `Updated status from ${auction.status} to ${newStatus}`
            );
            updatedCount++;

            if (newStatus === "LIVE") {
              liveCount++;
            } else if (newStatus === "ENDED") {
              endedCount++;
              // Handle winner determination when auction ends
              await this.determineAuctionWinner(auction.id);
            }
          } catch (error) {
            console.error(
              `Error updating auction ${auction.id}:`,
              error.message
            );
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
      console.error("Error in auction status check:", error);
    } finally {
      this.isRunning = false;
      console.log(
        `Auction status check completed at ${new Date().toISOString()}\n`
      );
    }
  }

  shouldRunOnThisInstance() {
    if (process.env.RUN_SCHEDULER === "false") return false;
    if (process.env.RUN_SCHEDULER === "true") return true;
    const pmId =
      process.env.pm_id || process.env.PM2_ID || process.env.INSTANCE_ID;
    return !pmId || pmId === "0";
  }

  start() {
    if (this.started) {
      return;
    }

    if (!this.shouldRunOnThisInstance()) {
      console.log(
        "Auction scheduler disabled on this instance. Set RUN_SCHEDULER=true to force enable."
      );
      this.started = true;
      return;
    }

    console.log("🚀 Starting auction status scheduler...");

    cron.schedule(
      "* * * * *",
      () => {
        this.checkAndUpdateAuctionStatuses();
      },
      {
        scheduled: true,
        timezone: "UTC",
      }
    );

    console.log("⏰ Auction status scheduler is now running every minute");

    this.checkAndUpdateAuctionStatuses();
    this.started = true;
  }

  stop() {
    console.log("Stopping auction status scheduler...");
    cron.getTasks().forEach((task) => task.stop());
    this.started = false;
  }

  async manualCheck() {
    console.log("Manual auction status check triggered");
    await this.checkAndUpdateAuctionStatuses();
  }

  async determineAuctionWinner(auctionId) {
    try {
      console.log(`\n Determining winner for auction: ${auctionId}`);

      // First check if winner already determined (fetch all bids including RETRACTED)
      const auctionCheck = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            include: {
              bidder: true,
            },
          },
        },
      });

      if (!auctionCheck) {
        console.error(`Auction ${auctionId} not found`);
        return;
      }

      // Check if winner already determined (avoid duplicate processing)
      const existingWinner = auctionCheck.bids.find(
        (bid) => bid.status === "WON"
      );
      if (existingWinner) {
        console.log(
          `Winner already determined for auction ${auctionId}: ${existingWinner.bidderId}`
        );
        return;
      }

      // Get auction with all non-retracted bids for winner determination
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            where: {
              status: { not: "RETRACTED" }, // Exclude retracted bids
            },
            include: {
              bidder: true,
            },
            orderBy: { amount: "desc" },
          },
          product: true,
          seller: true,
        },
      });

      // If no bids, mark product as unsold
      if (!auction.bids || auction.bids.length === 0) {
        console.log(
          `No bids found for auction ${auctionId}, marking product as unsold`
        );
        await prisma.product.update({
          where: { id: auction.productId },
          data: { status: "ACTIVE" }, // or "UNSOLD" depending on your schema
        });
        return;
      }

      // Get the highest bid (winner)
      const winningBid = auction.bids[0]; // Already sorted by amount desc
      const winnerId = winningBid.bidderId;
      const winnerAmount = winningBid.amount;

      console.log(`Winner found: ${winnerId} with bid amount: ${winnerAmount}`);

      // Update all bids in a transaction
      await prisma.$transaction(async (tx) => {
        // Mark winning bid as WON
        await tx.bid.update({
          where: { id: winningBid.id },
          data: { status: "WON" },
        });

        // Mark all other non-retracted bids as OUTBID
        const otherBids = auction.bids.filter(
          (bid) => bid.id !== winningBid.id
        );
        if (otherBids.length > 0) {
          await tx.bid.updateMany({
            where: {
              id: { in: otherBids.map((b) => b.id) },
              status: { not: "RETRACTED" },
            },
            data: { status: "OUTBID" },
          });
        }

        // Update product status to SOLD
        await tx.product.update({
          where: { id: auction.productId },
          data: { status: "SOLD" },
        });
      });

      console.log(
        `Winner determined: User ${winnerId} won auction ${auctionId}`
      );

      // Notify the winner
      try {
        const winner = await prisma.user.findUnique({
          where: { id: winnerId },
        });

        if (winner && winner.deviceToken) {
          const title = "Bid Won";
          const body = `Congratulations! You won the auction for ${auction.product.name} with a bid of ${winnerAmount}`;

          // Send push notification
          await notificationService.sendNotification(
            winner.deviceToken,
            title,
            body,
            {
              auctionId: auction.id,
              productId: auction.productId,
              type: "bids",
            }
          );

          // Save in-app notification
          await notificationService.create({
            userId: winnerId,
            title,
            body,
            type: "bids",
          });

          console.log(`Notification sent to winner: ${winnerId}`);
        }

        // Emit socket event to winner
        if (global.io) {
          const room = `user:${winnerId}`;
          global.io.to(room).emit("auction:won", {
            auctionId: auction.id,
            productId: auction.productId,
            productName: auction.product.name,
            winningAmount: winnerAmount,
          });
          console.log(`Socket event emitted to winner room: ${room}`);
        }
      } catch (notifError) {
        console.error(
          `Failed to notify winner for auction ${auctionId}:`,
          notifError.message
        );
      }

      // Notify other bidders (optional - they lost)
      try {
        const losers = auction.bids
          .filter(
            (bid) => bid.id !== winningBid.id && bid.status !== "RETRACTED"
          )
          .map((bid) => bid.bidderId);

        for (const loserId of losers) {
          const loser = await prisma.user.findUnique({
            where: { id: loserId },
          });

          if (loser && loser.deviceToken) {
            const title = "Bid Lost";
            const body = `You were outbid in the auction for ${auction.product.name}`;

            await notificationService.sendNotification(
              loser.deviceToken,
              title,
              body,
              {
                auctionId: auction.id,
                productId: auction.productId,
                type: "bids",
              }
            );

            await notificationService.create({
              userId: loserId,
              title,
              body,
              type: "bids",
            });
          }

          // Emit socket event to losers
          if (global.io) {
            const room = `user:${loserId}`;
            global.io.to(room).emit("auction:lost", {
              auctionId: auction.id,
              productId: auction.productId,
              productName: auction.product.name,
            });
          }
        }
      } catch (notifError) {
        console.error(
          `Failed to notify losers for auction ${auctionId}:`,
          notifError.message
        );
      }

      // Notify seller about the sale
      try {
        const seller = await prisma.user.findUnique({
          where: { id: auction.sellerId },
        });

        if (seller && seller.deviceToken) {
          const title = "Auction Ended";
          const body = `Your auction for ${auction.product.name} ended. Winning bid: ${winnerAmount}`;

          await notificationService.sendNotification(
            seller.deviceToken,
            title,
            body,
            {
              auctionId: auction.id,
              productId: auction.productId,
              type: "sales",
            }
          );

          await notificationService.create({
            userId: auction.sellerId,
            title,
            body,
            type: "sales",
          });

          // Emit socket event to seller
          if (global.io) {
            const room = `user:${auction.sellerId}`;
            global.io.to(room).emit("auction:ended", {
              auctionId: auction.id,
              productId: auction.productId,
              productName: auction.product.name,
              winningAmount: winnerAmount,
              winnerId: winnerId,
            });
          }
        }
      } catch (notifError) {
        console.error(
          `Failed to notify seller for auction ${auctionId}:`,
          notifError.message
        );
      }
    } catch (error) {
      console.error(
        `Error determining winner for auction ${auctionId}:`,
        error.message
      );
    }
  }
}

module.exports = new AuctionScheduler();
