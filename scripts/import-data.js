const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function importData() {
  console.log("📥 Starting data import...");

  try {
    // Find the most recent export file
    const exportDir = path.join(__dirname, "..", "data-export");
    const files = fs
      .readdirSync(exportDir)
      .filter(
        (file) => file.startsWith("data-export-") && file.endsWith(".json")
      )
      .sort()
      .reverse();

    if (files.length === 0) {
      throw new Error("No export files found in data-export directory");
    }

    const latestFile = files[0];
    const filepath = path.join(exportDir, latestFile);
    console.log(`📂 Loading data from: ${latestFile}`);

    const exportData = JSON.parse(fs.readFileSync(filepath, "utf8"));

    // Clear existing data (in reverse order of dependencies)
    console.log("🧹 Clearing existing data...");

    await prisma.productQuestion.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.watchlist.deleteMany();
    await prisma.bid.deleteMany();
    await prisma.auction.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.message.deleteMany();
    await prisma.chat.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.address.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.auctionPreference.deleteMany();
    await prisma.sellerSurvey.deleteMany();
    await prisma.sellerDetail.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
    await prisma.productSubCategory.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.supportRequest.deleteMany();
    await prisma.adminReport.deleteMany();
    await prisma.otp.deleteMany();

    console.log("✅ Existing data cleared");

    // Import Product Categories
    if (
      exportData.productCategories &&
      exportData.productCategories.length > 0
    ) {
      console.log("📦 Importing Product Categories...");
      for (const category of exportData.productCategories) {
        await prisma.productCategory.create({
          data: {
            id: category.id,
            name: category.name,
            image: category.image,
            createdAt: new Date(category.createdAt),
          },
        });
      }
      console.log(
        `✅ Imported ${exportData.productCategories.length} Product Categories`
      );
    }

    // Import Product Sub Categories
    if (
      exportData.productSubCategories &&
      exportData.productSubCategories.length > 0
    ) {
      console.log("📦 Importing Product Sub Categories...");
      for (const subCategory of exportData.productSubCategories) {
        await prisma.productSubCategory.create({
          data: {
            id: subCategory.id,
            name: subCategory.name,
            image: subCategory.image,
            categoryId: subCategory.categoryId,
            createdAt: new Date(subCategory.createdAt),
          },
        });
      }
      console.log(
        `✅ Imported ${exportData.productSubCategories.length} Product Sub Categories`
      );
    }

    // Import Users
    if (exportData.users && exportData.users.length > 0) {
      console.log("👥 Importing Users...");
      for (const user of exportData.users) {
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password, // Keep existing hashed password
            name: user.name,
            avatar: user.avatar,
            phone: user.phone,
            address: user.address,
            role: user.role,
            accountStatus: user.accountStatus,
            verificationStatus: user.verificationStatus,
            registrationDate: new Date(user.registrationDate),
            lastActive: new Date(user.lastActive),
            businessName: user.businessName,
            description: user.description,
            nationalId: user.nationalId,
            latitude: user.latitude,
            longitude: user.longitude,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
            isVerified: user.isVerified,
            sellerType: user.sellerType,
            deviceToken: user.deviceToken,
          },
        });
      }
      console.log(`✅ Imported ${exportData.users.length} Users`);
    }

    // Import Stores
    if (exportData.stores && exportData.stores.length > 0) {
      console.log("🏪 Importing Stores...");
      for (const store of exportData.stores) {
        await prisma.store.create({
          data: {
            id: store.id,
            userId: store.userId,
            name: store.name,
            image: store.image,
            backgroundImage: store.backgroundImage,
            createdAt: new Date(store.createdAt),
            updatedAt: new Date(store.updatedAt),
            addressLocation: store.addressLocation,
            businessEmail: store.businessEmail,
            businessPhone: store.businessPhone,
            description: store.description,
            storeCategory: store.storeCategory,
          },
        });
      }
      console.log(`✅ Imported ${exportData.stores.length} Stores`);
    }

    // Import Products
    if (exportData.products && exportData.products.length > 0) {
      console.log("📱 Importing Products...");
      for (const product of exportData.products) {
        await prisma.product.create({
          data: {
            id: product.id,
            name: product.name,
            description: product.description,
            availableUnits: product.availableUnits,
            price: product.price,
            images: product.images,
            video: product.video,
            pricingFormat: product.pricingFormat,
            auctionDuration: product.auctionDuration,
            auctionLaunchDate: product.auctionLaunchDate
              ? new Date(product.auctionLaunchDate)
              : null,
            startingBid: product.startingBid,
            buyItNow: product.buyItNow,
            minimumOffer: product.minimumOffer,
            autoAccept: product.autoAccept,
            shippingMethod: product.shippingMethod,
            country: product.country,
            city: product.city,
            handlingTime: product.handlingTime,
            weight: product.weight,
            length: product.length,
            width: product.width,
            height: product.height,
            domesticReturns: product.domesticReturns,
            internationalReturns: product.internationalReturns,
            condition: product.condition,
            conditionRating: product.conditionRating,
            categories: product.categories,
            category: product.category,
            stock: product.stock,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),
            status: product.status,
            storeId: product.storeId,
            domesticShippingType: product.domesticShippingType,
            localPickup: product.localPickup,
            couponCode: product.couponCode,
            discountPercentage: product.discountPercentage,
            shippingWeight: product.shippingWeight,
            shippingHeight: product.shippingHeight,
            shippingLength: product.shippingLength,
            shippingWidth: product.shippingWidth,
            salePrice: product.salePrice,
          },
        });
      }
      console.log(`✅ Imported ${exportData.products.length} Products`);
    }

    // Import Auctions
    if (exportData.auctions && exportData.auctions.length > 0) {
      console.log("🔨 Importing Auctions...");
      for (const auction of exportData.auctions) {
        await prisma.auction.create({
          data: {
            id: auction.id,
            productId: auction.productId,
            sellerId: auction.sellerId,
            createdAt: new Date(auction.createdAt),
            updatedAt: new Date(auction.updatedAt),
            status: auction.status,
          },
        });
      }
      console.log(`✅ Imported ${exportData.auctions.length} Auctions`);
    }

    // Import Bids
    if (exportData.bids && exportData.bids.length > 0) {
      console.log("💰 Importing Bids...");
      for (const bid of exportData.bids) {
        await prisma.bid.create({
          data: {
            id: bid.id,
            auctionId: bid.auctionId,
            bidderId: bid.bidderId,
            amount: bid.amount,
            createdAt: new Date(bid.createdAt),
            status: bid.status,
          },
        });
      }
      console.log(`✅ Imported ${exportData.bids.length} Bids`);
    }

    // Import Carts
    if (exportData.carts && exportData.carts.length > 0) {
      console.log("🛒 Importing Carts...");
      for (const cart of exportData.carts) {
        await prisma.cart.create({
          data: {
            id: cart.id,
            userId: cart.userId,
            createdAt: new Date(cart.createdAt),
            updatedAt: new Date(cart.updatedAt),
          },
        });

        // Import Cart Items
        if (cart.items && cart.items.length > 0) {
          for (const item of cart.items) {
            await prisma.cartItem.create({
              data: {
                id: item.id,
                cartId: item.cartId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }
      }
      console.log(`✅ Imported ${exportData.carts.length} Carts`);
    }

    // Import Orders
    if (exportData.orders && exportData.orders.length > 0) {
      console.log("📦 Importing Orders...");
      for (const order of exportData.orders) {
        await prisma.order.create({
          data: {
            id: order.id,
            userId: order.userId,
            sellerId: order.sellerId,
            productId: order.productId,
            status: order.status,
            totalAmount: order.totalAmount,
            paymentStatus: order.paymentStatus,
            deliveryStatus: order.deliveryStatus,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
          },
        });

        // Import Order Items
        if (order.OrderItem && order.OrderItem.length > 0) {
          for (const item of order.OrderItem) {
            await prisma.orderItem.create({
              data: {
                id: item.id,
                orderId: item.orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt),
              },
            });
          }
        }

        // Import Payment
        if (order.payment) {
          await prisma.payment.create({
            data: {
              id: order.payment.id,
              orderId: order.payment.orderId,
              userId: order.payment.userId,
              amount: order.payment.amount,
              gateway: order.payment.gateway,
              status: order.payment.status,
              collection: order.payment.collection,
              confirmationDate: order.payment.confirmationDate
                ? new Date(order.payment.confirmationDate)
                : null,
              createdAt: new Date(order.payment.createdAt),
              updatedAt: new Date(order.payment.updatedAt),
            },
          });
        }

        // Import Reviews
        if (order.reviews && order.reviews.length > 0) {
          for (const review of order.reviews) {
            await prisma.review.create({
              data: {
                id: review.id,
                userId: review.userId,
                sellerId: review.sellerId,
                orderId: review.orderId,
                rating: review.rating,
                comment: review.comment,
                createdAt: new Date(review.createdAt),
                updatedAt: new Date(review.updatedAt),
                status: review.status,
              },
            });
          }
        }
      }
      console.log(`✅ Imported ${exportData.orders.length} Orders`);
    }

    // Import Chats and Messages
    if (exportData.chats && exportData.chats.length > 0) {
      console.log("💬 Importing Chats...");
      for (const chat of exportData.chats) {
        await prisma.chat.create({
          data: {
            id: chat.id,
            userAId: chat.userAId,
            userBId: chat.userBId,
            createdAt: new Date(chat.createdAt),
          },
        });

        // Import Messages
        if (chat.messages && chat.messages.length > 0) {
          for (const message of chat.messages) {
            await prisma.message.create({
              data: {
                id: message.id,
                chatId: message.chatId,
                senderId: message.senderId,
                content: message.content,
                createdAt: new Date(message.createdAt),
                read: message.read,
              },
            });
          }
        }
      }
      console.log(`✅ Imported ${exportData.chats.length} Chats`);
    }

    // Import Notifications
    if (exportData.notifications && exportData.notifications.length > 0) {
      console.log("🔔 Importing Notifications...");
      for (const notification of exportData.notifications) {
        await prisma.notification.create({
          data: {
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            read: notification.read,
            createdAt: new Date(notification.createdAt),
          },
        });
      }
      console.log(
        `✅ Imported ${exportData.notifications.length} Notifications`
      );
    }

    // Import Addresses
    if (exportData.addresses && exportData.addresses.length > 0) {
      console.log("📍 Importing Addresses...");
      for (const address of exportData.addresses) {
        await prisma.address.create({
          data: {
            id: address.id,
            userId: address.userId,
            label: address.label,
            address: address.address,
            city: address.city,
            country: address.country,
            postalCode: address.postalCode,
            isDefault: address.isDefault,
            createdAt: new Date(address.createdAt),
          },
        });
      }
      console.log(`✅ Imported ${exportData.addresses.length} Addresses`);
    }

    // Import Payment Methods
    if (exportData.paymentMethods && exportData.paymentMethods.length > 0) {
      console.log("💳 Importing Payment Methods...");
      for (const paymentMethod of exportData.paymentMethods) {
        await prisma.paymentMethod.create({
          data: {
            id: paymentMethod.id,
            userId: paymentMethod.userId,
            type: paymentMethod.type,
            cardNumber: paymentMethod.cardNumber,
            cardName: paymentMethod.cardName,
            expiry: paymentMethod.expiry,
            cvv: paymentMethod.cvv,
            provider: paymentMethod.provider,
            createdAt: new Date(paymentMethod.createdAt),
          },
        });
      }
      console.log(
        `✅ Imported ${exportData.paymentMethods.length} Payment Methods`
      );
    }

    // Import Favorites
    if (exportData.favorites && exportData.favorites.length > 0) {
      console.log("❤️ Importing Favorites...");
      for (const favorite of exportData.favorites) {
        await prisma.favorite.create({
          data: {
            id: favorite.id,
            userId: favorite.userId,
            productId: favorite.productId,
            createdAt: new Date(favorite.createdAt),
          },
        });
      }
      console.log(`✅ Imported ${exportData.favorites.length} Favorites`);
    }

    // Import Watchlists
    if (exportData.watchlists && exportData.watchlists.length > 0) {
      console.log("👀 Importing Watchlists...");
      for (const watchlist of exportData.watchlists) {
        await prisma.watchlist.create({
          data: {
            id: watchlist.id,
            userId: watchlist.userId,
            auctionId: watchlist.auctionId,
            createdAt: new Date(watchlist.createdAt),
          },
        });
      }
      console.log(`✅ Imported ${exportData.watchlists.length} Watchlists`);
    }

    // Import Product Questions
    if (exportData.productQuestions && exportData.productQuestions.length > 0) {
      console.log("❓ Importing Product Questions...");
      for (const question of exportData.productQuestions) {
        await prisma.productQuestion.create({
          data: {
            id: question.id,
            productId: question.productId,
            buyerId: question.buyerId,
            question: question.question,
            answer: question.answer,
            answeredBy: question.answeredBy,
            answeredAt: question.answeredAt
              ? new Date(question.answeredAt)
              : null,
            createdAt: new Date(question.createdAt),
            updatedAt: new Date(question.updatedAt),
          },
        });
      }
      console.log(
        `✅ Imported ${exportData.productQuestions.length} Product Questions`
      );
    }

    // Import Support Requests
    if (exportData.supportRequests && exportData.supportRequests.length > 0) {
      console.log("📋 Importing Support Requests...");
      for (const request of exportData.supportRequests) {
        await prisma.supportRequest.create({
          data: {
            id: request.id,
            name: request.name,
            email: request.email,
            category: request.category,
            description: request.description,
            attachment: request.attachment,
            createdAt: new Date(request.createdAt),
          },
        });
      }
      console.log(
        `✅ Imported ${exportData.supportRequests.length} Support Requests`
      );
    }

    // Import Admin Reports
    if (exportData.adminReports && exportData.adminReports.length > 0) {
      console.log("📊 Importing Admin Reports...");
      for (const report of exportData.adminReports) {
        await prisma.adminReport.create({
          data: {
            id: report.id,
            type: report.type,
            data: report.data,
            startDate: new Date(report.startDate),
            endDate: new Date(report.endDate),
            createdAt: new Date(report.createdAt),
            updatedAt: new Date(report.updatedAt),
          },
        });
      }
      console.log(
        `✅ Imported ${exportData.adminReports.length} Admin Reports`
      );
    }

    // Import OTPs
    if (exportData.otps && exportData.otps.length > 0) {
      console.log("🔐 Importing OTPs...");
      for (const otp of exportData.otps) {
        await prisma.otp.create({
          data: {
            id: otp.id,
            phone: otp.phone,
            otp: otp.otp,
            createdAt: new Date(otp.createdAt),
            email: otp.email,
            verified: otp.verified,
          },
        });
      }
      console.log(`✅ Imported ${exportData.otps.length} OTPs`);
    }

    console.log("✅ Data import completed successfully!");
  } catch (error) {
    console.error("❌ Error during data import:", error);
    throw error;
  }
}

importData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
