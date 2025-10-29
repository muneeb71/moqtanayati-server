const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
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

    // Seed Product Categories
    console.log("📦 Seeding product categories...");
    const categories = [
      { name: "Electronics", image: "electronics.jpg" },
      { name: "Fashion", image: "fashion.jpg" },
      { name: "Home & Garden", image: "home-garden.jpg" },
      { name: "Sports", image: "sports.jpg" },
      { name: "Books", image: "books.jpg" },
      { name: "Toys", image: "toys.jpg" },
      { name: "Health & Beauty", image: "health-beauty.jpg" },
      { name: "Automotive", image: "automotive.jpg" },
      { name: "Jewelry", image: "jewelry.jpg" },
      { name: "Collectibles", image: "collectibles.jpg" },
    ];

    const createdCategories = [];
    for (const category of categories) {
      const created = await prisma.productCategory.create({
        data: category,
      });
      createdCategories.push(created);
    }

    // Seed Product Sub Categories
    console.log("📦 Seeding product sub categories...");
    const subCategories = [
      // Electronics
      {
        name: "Smartphones",
        categoryId: createdCategories[0].id,
        image: "smartphones.jpg",
      },
      {
        name: "Laptops",
        categoryId: createdCategories[0].id,
        image: "laptops.jpg",
      },
      {
        name: "Headphones",
        categoryId: createdCategories[0].id,
        image: "headphones.jpg",
      },
      {
        name: "Cameras",
        categoryId: createdCategories[0].id,
        image: "cameras.jpg",
      },

      // Fashion
      {
        name: "Men's Clothing",
        categoryId: createdCategories[1].id,
        image: "mens-clothing.jpg",
      },
      {
        name: "Women's Clothing",
        categoryId: createdCategories[1].id,
        image: "womens-clothing.jpg",
      },
      {
        name: "Shoes",
        categoryId: createdCategories[1].id,
        image: "shoes.jpg",
      },
      {
        name: "Accessories",
        categoryId: createdCategories[1].id,
        image: "accessories.jpg",
      },

      // Home & Garden
      {
        name: "Furniture",
        categoryId: createdCategories[2].id,
        image: "furniture.jpg",
      },
      {
        name: "Kitchen",
        categoryId: createdCategories[2].id,
        image: "kitchen.jpg",
      },
      {
        name: "Garden Tools",
        categoryId: createdCategories[2].id,
        image: "garden-tools.jpg",
      },
      {
        name: "Home Decor",
        categoryId: createdCategories[2].id,
        image: "home-decor.jpg",
      },
    ];

    const createdSubCategories = [];
    for (const subCategory of subCategories) {
      const created = await prisma.productSubCategory.create({
        data: subCategory,
      });
      createdSubCategories.push(created);
    }

    // Seed Users
    console.log("👥 Seeding users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = [
      {
        email: "admin@moqtanayati.com",
        password: hashedPassword,
        name: "Admin User",
        role: "ADMIN",
        accountStatus: "ACTIVE",
        verificationStatus: "APPROVED",
        isVerified: true,
        phone: "+966501234567",
        address: "Riyadh, Saudi Arabia",
        businessName: "Moqtanayati Admin",
        nationalId: "1234567890",
        latitude: 24.7136,
        longitude: 46.6753,
      },
      {
        email: "seller1@moqtanayati.com",
        password: hashedPassword,
        name: "Ahmed Al-Rashid",
        role: "SELLER",
        accountStatus: "ACTIVE",
        verificationStatus: "APPROVED",
        isVerified: true,
        sellerType: "BUSINESS",
        phone: "+966501234568",
        address: "Jeddah, Saudi Arabia",
        businessName: "Al-Rashid Electronics",
        nationalId: "1234567891",
        latitude: 21.4858,
        longitude: 39.1925,
      },
      {
        email: "seller2@moqtanayati.com",
        password: hashedPassword,
        name: "Fatima Al-Zahra",
        role: "SELLER",
        accountStatus: "ACTIVE",
        verificationStatus: "APPROVED",
        isVerified: true,
        sellerType: "INDIVIDUAL",
        phone: "+966501234569",
        address: "Dammam, Saudi Arabia",
        businessName: "Zahra Fashion",
        nationalId: "1234567892",
        latitude: 26.4207,
        longitude: 50.0888,
      },
      {
        email: "buyer1@moqtanayati.com",
        password: hashedPassword,
        name: "Mohammed Al-Sheikh",
        role: "BUYER",
        accountStatus: "ACTIVE",
        verificationStatus: "APPROVED",
        isVerified: true,
        phone: "+966501234570",
        address: "Riyadh, Saudi Arabia",
        nationalId: "1234567893",
        latitude: 24.7136,
        longitude: 46.6753,
      },
      {
        email: "buyer2@moqtanayati.com",
        password: hashedPassword,
        name: "Noura Al-Mansouri",
        role: "BUYER",
        accountStatus: "ACTIVE",
        verificationStatus: "APPROVED",
        isVerified: true,
        phone: "+966501234571",
        address: "Jeddah, Saudi Arabia",
        nationalId: "1234567894",
        latitude: 21.4858,
        longitude: 39.1925,
      },
    ];

    const createdUsers = [];
    for (const user of users) {
      const created = await prisma.user.create({
        data: user,
      });
      createdUsers.push(created);
    }

    // Seed Stores
    console.log("🏪 Seeding stores...");
    const stores = [
      {
        userId: createdUsers[1].id, // seller1
        name: "Al-Rashid Electronics Store",
        image: "store1.jpg",
        backgroundImage: "store1-bg.jpg",
        addressLocation: "King Fahd Road, Jeddah",
        businessEmail: "info@alrashid-electronics.com",
        businessPhone: "+966501234568",
        description: "Premium electronics and gadgets store",
        storeCategory: "Electronics",
      },
      {
        userId: createdUsers[2].id, // seller2
        name: "Zahra Fashion Boutique",
        image: "store2.jpg",
        backgroundImage: "store2-bg.jpg",
        addressLocation: "Prince Mohammed Street, Dammam",
        businessEmail: "contact@zahra-fashion.com",
        businessPhone: "+966501234569",
        description: "Trendy fashion and accessories",
        storeCategory: "Fashion",
      },
    ];

    const createdStores = [];
    for (const store of stores) {
      const created = await prisma.store.create({
        data: store,
      });
      createdStores.push(created);
    }

    // Seed Products
    console.log("📱 Seeding products...");
    const products = [
      {
        name: "iPhone 15 Pro Max",
        description:
          "Latest iPhone with advanced camera system and A17 Pro chip",
        availableUnits: 10,
        price: 4500.0,
        images: ["iphone15-1.jpg", "iphone15-2.jpg", "iphone15-3.jpg"],
        pricingFormat: "FIXED",
        shippingMethod: "EXPRESS",
        country: "Saudi Arabia",
        city: "Jeddah",
        handlingTime: "1-2 days",
        weight: 0.221,
        length: 15.9,
        width: 7.7,
        height: 0.8,
        domesticReturns: true,
        internationalReturns: false,
        condition: "NEW",
        conditionRating: 5,
        categories: ["Electronics", "Smartphones"],
        category: "Electronics",
        stock: 10,
        status: "ACTIVE",
        storeId: createdStores[0].id,
        domesticShippingType: "EXPRESS",
        localPickup: true,
        shippingWeight: 0.221,
        shippingHeight: 0.8,
        shippingLength: 15.9,
        shippingWidth: 7.7,
      },
      {
        name: "MacBook Pro M3",
        description: "Powerful laptop with M3 chip for professionals",
        availableUnits: 5,
        price: 8500.0,
        images: ["macbook-pro-1.jpg", "macbook-pro-2.jpg"],
        pricingFormat: "FIXED",
        shippingMethod: "STANDARD",
        country: "Saudi Arabia",
        city: "Jeddah",
        handlingTime: "2-3 days",
        weight: 1.6,
        length: 30.4,
        width: 21.5,
        height: 1.5,
        domesticReturns: true,
        internationalReturns: false,
        condition: "NEW",
        conditionRating: 5,
        categories: ["Electronics", "Laptops"],
        category: "Electronics",
        stock: 5,
        status: "ACTIVE",
        storeId: createdStores[0].id,
        domesticShippingType: "STANDARD",
        localPickup: true,
        shippingWeight: 1.6,
        shippingHeight: 1.5,
        shippingLength: 30.4,
        shippingWidth: 21.5,
      },
      {
        name: "Designer Handbag",
        description: "Luxury leather handbag from top fashion brand",
        availableUnits: 3,
        price: 1200.0,
        images: ["handbag-1.jpg", "handbag-2.jpg"],
        pricingFormat: "FIXED",
        shippingMethod: "EXPRESS",
        country: "Saudi Arabia",
        city: "Dammam",
        handlingTime: "1-2 days",
        weight: 0.8,
        length: 35,
        width: 25,
        height: 15,
        domesticReturns: true,
        internationalReturns: false,
        condition: "NEW",
        conditionRating: 5,
        categories: ["Fashion", "Accessories"],
        category: "Fashion",
        stock: 3,
        status: "ACTIVE",
        storeId: createdStores[1].id,
        domesticShippingType: "EXPRESS",
        localPickup: true,
        shippingWeight: 0.8,
        shippingHeight: 15,
        shippingLength: 35,
        shippingWidth: 25,
      },
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({
        data: product,
      });
      createdProducts.push(created);
    }

    // Seed Auctions
    console.log("🔨 Seeding auctions...");
    const auctions = [
      {
        productId: createdProducts[0].id,
        sellerId: createdUsers[1].id,
        status: "LIVE",
      },
      {
        productId: createdProducts[1].id,
        sellerId: createdUsers[1].id,
        status: "UPCOMING",
      },
    ];

    const createdAuctions = [];
    for (const auction of auctions) {
      const created = await prisma.auction.create({
        data: auction,
      });
      createdAuctions.push(created);
    }

    // Seed Addresses
    console.log("📍 Seeding addresses...");
    const addresses = [
      {
        userId: createdUsers[3].id, // buyer1
        label: "Home",
        address: "King Fahd Road, Riyadh 12345",
        city: "Riyadh",
        country: "Saudi Arabia",
        postalCode: "12345",
        isDefault: true,
      },
      {
        userId: createdUsers[4].id, // buyer2
        label: "Office",
        address: "Prince Mohammed Street, Jeddah 21432",
        city: "Jeddah",
        country: "Saudi Arabia",
        postalCode: "21432",
        isDefault: true,
      },
    ];

    for (const address of addresses) {
      await prisma.address.create({
        data: address,
      });
    }

    // Seed Notifications
    console.log("🔔 Seeding notifications...");
    const notifications = [
      {
        userId: createdUsers[3].id,
        type: "WELCOME",
        title: "Welcome to Moqtanayati!",
        message:
          "Thank you for joining our platform. Start exploring amazing products!",
        read: false,
      },
      {
        userId: createdUsers[4].id,
        type: "WELCOME",
        title: "Welcome to Moqtanayati!",
        message:
          "Thank you for joining our platform. Start exploring amazing products!",
        read: false,
      },
    ];

    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification,
      });
    }

    // Seed Seller Details
    console.log("👤 Seeding seller details...");
    const sellerDetails = [
      {
        userId: createdUsers[1].id,
        iban: "SA0380000000608010167519",
        cr: "4030000001",
        vat: "300000000000003",
      },
      {
        userId: createdUsers[2].id,
        iban: "SA0380000000608010167520",
        cr: "4030000002",
        vat: "300000000000004",
      },
    ];

    for (const sellerDetail of sellerDetails) {
      await prisma.sellerDetail.create({
        data: sellerDetail,
      });
    }

    // Seed Seller Surveys
    console.log("📋 Seeding seller surveys...");
    const sellerSurveys = [
      {
        userId: createdUsers[1].id,
        entity: "ESTABLISHED",
        hasProducts: true,
        hasExperience: true,
        goal: "PROFIT",
        productAndServices: ["ELECTRONICS"],
        homeSupplies: ["KITCHEN"],
        consent: true,
      },
      {
        userId: createdUsers[2].id,
        entity: "INDIVIDUAL",
        hasProducts: true,
        hasExperience: false,
        goal: "DISCOVER",
        productAndServices: ["FASHION"],
        homeSupplies: ["HOMEDECOR"],
        consent: true,
      },
    ];

    for (const sellerSurvey of sellerSurveys) {
      await prisma.sellerSurvey.create({
        data: sellerSurvey,
      });
    }

    // Seed Auction Preferences
    console.log("⚙️ Seeding auction preferences...");
    const auctionPreferences = [
      {
        userId: createdUsers[3].id,
        categories: ["Electronics", "Smartphones"],
        minPrice: 1000,
        maxPrice: 5000,
        alertEnding: true,
        alertNew: true,
      },
      {
        userId: createdUsers[4].id,
        categories: ["Fashion", "Accessories"],
        minPrice: 100,
        maxPrice: 2000,
        alertEnding: false,
        alertNew: true,
      },
    ];

    for (const preference of auctionPreferences) {
      await prisma.auctionPreference.create({
        data: preference,
      });
    }

    console.log("✅ Database seeding completed successfully!");
    console.log(`📊 Created:`);
    console.log(`   - ${createdCategories.length} Product Categories`);
    console.log(`   - ${createdSubCategories.length} Product Sub Categories`);
    console.log(`   - ${createdUsers.length} Users`);
    console.log(`   - ${createdStores.length} Stores`);
    console.log(`   - ${createdProducts.length} Products`);
    console.log(`   - ${createdAuctions.length} Auctions`);
    console.log(`   - ${addresses.length} Addresses`);
    console.log(`   - ${notifications.length} Notifications`);
    console.log(`   - ${sellerDetails.length} Seller Details`);
    console.log(`   - ${sellerSurveys.length} Seller Surveys`);
    console.log(`   - ${auctionPreferences.length} Auction Preferences`);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
