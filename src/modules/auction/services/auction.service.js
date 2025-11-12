const prisma = require("../../../config/prisma");
const auctionScheduler = require("../../../utils/auctionScheduler");

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

  async getAllAuctions({
    search = "",
    categories = "",
    location = "",
    condition = "",
    month = "",
    year = "",
  }) {
    const trimmedSearch =
      typeof search === "string" ? search.trim().replace(/^"|"$/g, "") : "";
    const trimmedLocation = typeof location === "string" ? location.trim() : "";
    const trimmedCondition =
      typeof condition === "string" ? condition.trim() : "";

    // Handle categories as array
    if (typeof categories === "string" && categories !== "") {
      categories = [categories];
    } else if (!Array.isArray(categories)) {
      categories = [];
    }

    const baseWhere = {};

    // === Auction Status from search if valid ===
    const validStatuses = ["PENDING", "ENDED", "UPCOMING", "LIVE"];
    if (validStatuses.includes(trimmedSearch.toUpperCase())) {
      baseWhere.status = trimmedSearch.toUpperCase();
    }

    // === Product-level filters ===
    const productFilters = {};

    if (categories.length > 0) {
      productFilters.categories = {
        hasSome: categories,
      };
    }

    if (trimmedCondition.length > 0) {
      productFilters.condition = {
        equals: trimmedCondition,
        mode: "insensitive",
      };
    }

    if (trimmedLocation.length > 0) {
      productFilters.country = {
        contains: trimmedLocation,
        mode: "insensitive",
      };
    }

    if (Object.keys(productFilters).length > 0) {
      baseWhere.product = {
        is: productFilters,
      };
    }

    // === Date Filter ===
    if (month || year) {
      const safeYear = year || "1970";
      const safeMonth = month || "01";

      const startDate = new Date(`${safeYear}-${safeMonth}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      baseWhere.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    // === Search Conditions ===
    const searchConditions = [];
    const isNumericSearch = !isNaN(Number(trimmedSearch));
    const numericSearchValue = Number(trimmedSearch);

    if (trimmedSearch) {
      searchConditions.push(
        {
          seller: {
            is: {
              name: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          },
        },
        {
          seller: {
            is: {
              email: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          },
        },
        {
          product: {
            is: {
              name: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          },
        }
      );

      if (isNumericSearch) {
        searchConditions.push(
          {
            product: {
              is: {
                startingBid: numericSearchValue,
              },
            },
          },
          {
            bids: {
              some: {
                amount: numericSearchValue,
              },
            },
          }
        );
      }

      if (validStatuses.includes(trimmedSearch.toUpperCase())) {
        searchConditions.push({ status: trimmedSearch.toUpperCase() });
      }
    }

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

    // === Final Prisma Query ===
    const auctions = await prisma.auction.findMany({
      where,
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

    return { auctions };
  }

  async getAuctionById(id) {
    console.log("ID:", JSON.stringify(id));
    try {
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
    } catch (error) {
      console.error("Error in getAuctionById:", error);
      throw error;
    }
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
    const auctions = await prisma.auction.findMany({
      where: {
        status: { in: ["ENDED"] }, // or ["ENDED", "CANCELLED"] if you want both
      },
    });
    return auctions; // Return empty array if none found
  }

  //   async getAuctionHistory() {
  //   return prisma.auction.findMany({
  //     where: { OR: [{ status: "ENDED" }, { status: "CANCELLED" }] },
  //   });
  // }

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

  async getSellerAuctions({
    sellerId,
    search = "",
    categories = "",
    location = "",
    condition = "",
    month = "",
    year = "",
  }) {
    const trimmedSearch =
      typeof search === "string" ? search.trim().replace(/^"|"$/g, "") : "";
    const trimmedLocation = typeof location === "string" ? location.trim() : "";
    const trimmedCondition =
      typeof condition === "string" ? condition.trim() : "";

    // Handle categories as array
    if (typeof categories === "string" && categories !== "") {
      categories = [categories];
    } else if (!Array.isArray(categories)) {
      categories = [];
    }

    const baseWhere = {};

    // === Auction Status from search if valid ===
    const validStatuses = ["PENDING", "ENDED", "UPCOMING", "LIVE"];
    if (validStatuses.includes(trimmedSearch.toUpperCase())) {
      baseWhere.status = trimmedSearch.toUpperCase();
    }

    // === Product-level filters ===
    const productFilters = {};

    if (categories.length > 0) {
      productFilters.categories = {
        hasSome: categories,
      };
    }

    if (trimmedCondition.length > 0) {
      productFilters.condition = {
        equals: trimmedCondition,
        mode: "insensitive",
      };
    }

    if (trimmedLocation.length > 0) {
      productFilters.country = {
        contains: trimmedLocation,
        mode: "insensitive",
      };
    }

    if (Object.keys(productFilters).length > 0) {
      baseWhere.product = {
        is: productFilters,
      };
    }

    // === Date Filter ===
    if (month || year) {
      const safeYear = year || "1970";
      const safeMonth = month || "01";

      const startDate = new Date(`${safeYear}-${safeMonth}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      baseWhere.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    // === Search Conditions ===
    const searchConditions = [];
    const isNumericSearch = !isNaN(Number(trimmedSearch));
    const numericSearchValue = Number(trimmedSearch);

    if (trimmedSearch) {
      searchConditions.push(
        {
          seller: {
            is: {
              name: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          },
        },
        {
          seller: {
            is: {
              email: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          },
        },
        {
          product: {
            is: {
              name: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          },
        }
      );

      if (isNumericSearch) {
        searchConditions.push(
          {
            product: {
              is: {
                startingBid: numericSearchValue,
              },
            },
          },
          {
            bids: {
              some: {
                amount: numericSearchValue,
              },
            },
          }
        );
      }

      if (validStatuses.includes(trimmedSearch.toUpperCase())) {
        searchConditions.push({ status: trimmedSearch.toUpperCase() });
      }
    }

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

    // === Final Prisma Query ===
    const auctions = await prisma.auction.findMany({
      where: {
        AND: [{ sellerId: sellerId }, where],
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

    return { auctions };
  }

  async placeBid({ userId, productId, amount }) {
    console.log("wp");

    if (!productId) {
      throw new Error("productId is required");
    }

    const auction = await prisma.auction.findUnique({
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
    if (previousHighestBid && previousHighestBid.bidderId !== userId) {
      console.log("previousHighestBid : ", previousHighestBid);
      await prisma.bid.update({
        where: { id: previousHighestBid.id },
        data: { status: "OUTBID" },
      });
    }

    const existingBid = auction.bids.find((bid) => bid.bidderId === userId);

    let bid;
    if (existingBid) {
      bid = await prisma.bid.update({
        where: { id: existingBid.id },
        data: { amount },
        include: { bidder: true },
      });
    } else {
      bid = await prisma.bid.create({
        data: {
          auctionId: auction.id,
          bidderId: userId,
          amount,
        },
        include: { bidder: true },
      });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { minimumOffer: amount },
    });

    if (auction.product.buyItNow && amount >= auction.product.buyItNow) {
      // Fetch updated auction with all bids including the one just placed
      const updatedAuction = await prisma.auction.findUnique({
        where: { id: auction.id },
        include: {
          bids: {
            where: { status: { not: "RETRACTED" } },
          },
        },
      });

      await prisma.auction.update({
        where: { id: auction.id },
        data: { status: "ENDED" },
      });
      await prisma.product.update({
        where: { id: productId },
        data: { status: "SOLD" },
      });

      // Determine winner immediately when Buy It Now is triggered
      // The bid just placed is the winning bid
      await prisma.$transaction(async (tx) => {
        // Mark this bid as WON
        await tx.bid.update({
          where: { id: bid.id },
          data: { status: "WON" },
        });

        // Mark all other non-retracted bids as OUTBID
        const otherBids = updatedAuction.bids.filter(
          (b) => b.id !== bid.id && b.status !== "RETRACTED"
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
      });

      // Trigger winner determination for notifications (async, don't wait)
      auctionScheduler.determineAuctionWinner(auction.id).catch((err) => {
        console.error("Error determining winner after Buy It Now:", err);
      });
    }

    return bid;
  }

  async getBidsByProductId(productId) {
    const auction = await prisma.auction.findUnique({
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
    return await prisma.bid.findMany({
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
    const bid = await prisma.bid.findFirst({
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

    await prisma.bid.update({
      where: { id: bid.id },
      data: { status: "RETRACTED" },
    });

    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { product: true },
    });
    if (!auction) throw new Error("Auction not found");
    const productId = auction.productId;

    let newMinimumOffer = auction.product.startingBid;

    const nextHighest = await prisma.bid.findFirst({
      where: {
        auctionId,
        status: { not: "RETRACTED" },
      },
      orderBy: { amount: "desc" },
    });
    if (wasHighest && nextHighest) {
      await prisma.bid.update({
        where: { id: nextHighest.id },
        data: { status: "HIGHEST" },
      });
      newMinimumOffer = nextHighest.amount;
    } else if (wasHighest && !nextHighest) {
      newMinimumOffer = auction.product.startingBid;
    } else if (nextHighest) {
      newMinimumOffer = nextHighest.amount;
    }

    await prisma.product.update({
      where: { id: productId },
      data: { minimumOffer: newMinimumOffer },
    });

    return { message: "Bid retracted successfully" };
  }

  // Bid Retraction Request Methods
  async createBidRetractionRequest({ bidderId, bidId, reason }) {
    if (!bidderId || !bidId || !reason) {
      throw new Error("bidderId, bidId, and reason are required");
    }

    // Verify the bid exists and belongs to the bidder
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        auction: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!bid) {
      throw new Error("Bid not found");
    }

    if (bid.bidderId !== bidderId) {
      throw new Error("You can only request retraction for your own bids");
    }

    // Check if there's already a pending request for this bid
    const existingRequest = await prisma.bidRetractionRequest.findFirst({
      where: {
        bidId,
        bidderId,
        status: "PENDING",
      },
    });

    if (existingRequest) {
      throw new Error(
        "A pending retraction request already exists for this bid"
      );
    }

    // Create the retraction request
    const retractionRequest = await prisma.bidRetractionRequest.create({
      data: {
        bidId,
        bidderId,
        sellerId: bid.auction.sellerId,
        reason,
        status: "PENDING",
      },
      include: {
        bid: true,
        bidder: {
          select: { id: true, name: true, email: true },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return retractionRequest;
  }

  async getBidRetractionRequests(sellerId, status = null) {
    const where = { sellerId };
    if (status) {
      where.status = status;
    }

    const requests = await prisma.bidRetractionRequest.findMany({
      where,
      include: {
        bid: {
          include: {
            auction: {
              include: {
                product: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        bidder: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }

  async getMyRetractionRequests(bidderId, status = null) {
    const where = { bidderId };
    if (status) {
      where.status = status;
    }

    const requests = await prisma.bidRetractionRequest.findMany({
      where,
      include: {
        bid: {
          include: {
            auction: {
              include: {
                product: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return requests;
  }

  async respondToRetractionRequest({ requestId, sellerId, action }) {
    if (!requestId || !sellerId || !action) {
      throw new Error("requestId, sellerId, and action are required");
    }

    if (!["ACCEPTED", "DENIED"].includes(action)) {
      throw new Error("Action must be either ACCEPTED or DENIED");
    }

    // Find the retraction request
    const request = await prisma.bidRetractionRequest.findUnique({
      where: { id: requestId },
      include: {
        bid: {
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

    if (!request) {
      throw new Error("Retraction request not found");
    }

    if (request.sellerId !== sellerId) {
      throw new Error("You are not authorized to respond to this request");
    }

    if (request.status !== "PENDING") {
      throw new Error("This request has already been processed");
    }

    // Use transaction to update request and bid status
    const result = await prisma.$transaction(async (tx) => {
      // Update the retraction request status
      const updatedRequest = await tx.bidRetractionRequest.update({
        where: { id: requestId },
        data: { status: action },
        include: {
          bid: true,
          bidder: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (action === "ACCEPTED") {
        // Update bid status to RETRACTED
        await tx.bid.update({
          where: { id: request.bidId },
          data: { status: "RETRACTED" },
        });

        // Update auction minimum offer if this was the highest bid
        const auction = request.bid.auction;
        const wasHighest = request.bid.status === "HIGHEST";

        if (wasHighest) {
          const nextHighest = await tx.bid.findFirst({
            where: {
              auctionId: auction.id,
              status: { not: "RETRACTED" },
            },
            orderBy: { amount: "desc" },
          });

          let newMinimumOffer = auction.product.startingBid;
          if (nextHighest) {
            await tx.bid.update({
              where: { id: nextHighest.id },
              data: { status: "HIGHEST" },
            });
            newMinimumOffer = nextHighest.amount;
          }

          await tx.product.update({
            where: { id: auction.productId },
            data: { minimumOffer: newMinimumOffer },
          });
        }
      }

      return updatedRequest;
    });

    return result;
  }

  async getRetractionRequestCount(sellerId) {
    const count = await prisma.bidRetractionRequest.count({
      where: {
        sellerId,
        status: "PENDING",
      },
    });

    return count;
  }
}

module.exports = new AuctionService();
