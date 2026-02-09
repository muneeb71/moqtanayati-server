const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function getAllUsers() {
  console.log("👥 Fetching all users...\n");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        address: true,
        role: true,
        accountStatus: true,
        verificationStatus: true,
        isVerified: true,
        businessName: true,
        description: true,
        nationalId: true,
        sellerType: true,
        latitude: true,
        longitude: true,
        registrationDate: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true,
        store: { select: { id: true, name: true } },
        sellerDetail: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = users.length;
    console.log(`Found ${total} user(s).\n`);

    // Log to console (pretty)
    console.log(JSON.stringify(users, null, 2));

    // Optional: write to file (uncomment to enable)
    const outPath = path.join(__dirname, "..", "data-export", "users.json");
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(users, null, 2), "utf8");
    console.log(`\n✅ Also written to ${outPath}`);

    return users;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

getAllUsers();
