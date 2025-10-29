const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function exportData() {
  console.log("📤 Starting data export...");

  try {
    const exportData = {};

    // Export all data from each table
    console.log("📦 Exporting Product Categories...");
    exportData.productCategories = await prisma.productCategory.findMany();

    console.log("📦 Exporting Product Sub Categories...");
    exportData.productSubCategories =
      await prisma.productSubCategory.findMany();

    console.log("👥 Exporting Users...");
    exportData.users = await prisma.user.findMany({
      include: {
        store: true,
        addresses: true,
        sellerDetail: true,
        sellerSurvey: true,
        preferences: true,
      },
    });

    console.log("🏪 Exporting Stores...");
    exportData.stores = await prisma.store.findMany();

    console.log("📱 Exporting Products...");
    exportData.products = await prisma.product.findMany();

    console.log("🔨 Exporting Auctions...");
    exportData.auctions = await prisma.auction.findMany();

    console.log("💰 Exporting Bids...");
    exportData.bids = await prisma.bid.findMany();

    console.log("🛒 Exporting Carts...");
    exportData.carts = await prisma.cart.findMany({
      include: {
        items: true,
      },
    });

    console.log("📦 Exporting Orders...");
    exportData.orders = await prisma.order.findMany({
      include: {
        OrderItem: true,
        payment: true,
        reviews: true,
      },
    });

    console.log("💳 Exporting Payments...");
    exportData.payments = await prisma.payment.findMany();

    console.log("⭐ Exporting Reviews...");
    exportData.reviews = await prisma.review.findMany();

    console.log("💬 Exporting Chats...");
    exportData.chats = await prisma.chat.findMany({
      include: {
        messages: true,
      },
    });

    console.log("📨 Exporting Messages...");
    exportData.messages = await prisma.message.findMany();

    console.log("🔔 Exporting Notifications...");
    exportData.notifications = await prisma.notification.findMany();

    console.log("📍 Exporting Addresses...");
    exportData.addresses = await prisma.address.findMany();

    console.log("💳 Exporting Payment Methods...");
    exportData.paymentMethods = await prisma.paymentMethod.findMany();

    console.log("❤️ Exporting Favorites...");
    exportData.favorites = await prisma.favorite.findMany();

    console.log("👀 Exporting Watchlists...");
    exportData.watchlists = await prisma.watchlist.findMany();

    console.log("❓ Exporting Product Questions...");
    exportData.productQuestions = await prisma.productQuestion.findMany();

    console.log("📋 Exporting Support Requests...");
    exportData.supportRequests = await prisma.supportRequest.findMany();

    console.log("📊 Exporting Admin Reports...");
    exportData.adminReports = await prisma.adminReport.findMany();

    console.log("🔐 Exporting OTPs...");
    exportData.otps = await prisma.otp.findMany();

    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, "..", "data-export");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Save to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `data-export-${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log(`✅ Data exported successfully to: ${filepath}`);
    console.log(`📊 Export summary:`);
    console.log(
      `   - Product Categories: ${exportData.productCategories.length}`
    );
    console.log(
      `   - Product Sub Categories: ${exportData.productSubCategories.length}`
    );
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Stores: ${exportData.stores.length}`);
    console.log(`   - Products: ${exportData.products.length}`);
    console.log(`   - Auctions: ${exportData.auctions.length}`);
    console.log(`   - Bids: ${exportData.bids.length}`);
    console.log(`   - Carts: ${exportData.carts.length}`);
    console.log(`   - Orders: ${exportData.orders.length}`);
    console.log(`   - Payments: ${exportData.payments.length}`);
    console.log(`   - Reviews: ${exportData.reviews.length}`);
    console.log(`   - Chats: ${exportData.chats.length}`);
    console.log(`   - Messages: ${exportData.messages.length}`);
    console.log(`   - Notifications: ${exportData.notifications.length}`);
    console.log(`   - Addresses: ${exportData.addresses.length}`);
    console.log(`   - Payment Methods: ${exportData.paymentMethods.length}`);
    console.log(`   - Favorites: ${exportData.favorites.length}`);
    console.log(`   - Watchlists: ${exportData.watchlists.length}`);
    console.log(
      `   - Product Questions: ${exportData.productQuestions.length}`
    );
    console.log(`   - Support Requests: ${exportData.supportRequests.length}`);
    console.log(`   - Admin Reports: ${exportData.adminReports.length}`);
    console.log(`   - OTPs: ${exportData.otps.length}`);
  } catch (error) {
    console.error("❌ Error during data export:", error);
    throw error;
  }
}

exportData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
