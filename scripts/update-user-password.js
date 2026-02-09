const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const EMAIL = "khadijaiqbal01234@gmail.com";

async function updatePassword() {
  const newPassword = process.argv[2];
  if (!newPassword || newPassword.length < 6) {
    console.error("Usage: node scripts/update-user-password.js <newPassword>");
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  console.log(`Updating password for: ${EMAIL}`);

  try {
    const user = await prisma.user.findUnique({
      where: { email: EMAIL },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      console.error("User not found.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: EMAIL },
      data: { password: hashedPassword },
    });

    console.log("Password updated successfully for:", user.email, "(", user.name, ")");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
