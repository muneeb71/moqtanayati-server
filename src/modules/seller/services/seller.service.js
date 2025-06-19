const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../../../utils/otp");

const prisma = new PrismaClient();

class UserService {
  async checkExisting(data) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { phone: data.phone }],
      },
    });
    if (existing) {
      return true;
    }

    return false;
  }

  async register(data) {
    const requiredFields = [
      "role",
      "sellerType",
      "name",
      "email",
      "phone",
      "address",
      "nationalId",
      "password",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const existing = await this.checkExisting(data);
    if (existing) {
      throw new Error("Email or phone number already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userData = {
      role: data.role,
      name: data.name,
      businessName: data.businessName || null,
      sellerType: data.sellerType,
      email: data.email,
      phone: data.phone,
      address: data.address,
      nationalId: data.nationalId,
      password: hashedPassword,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      isVerified: false,
    };

    if (data.role === "SELLER") {
      userData.store = {
        create: {
          name: `${data.name}'s Store`,
          image: null,
          backgroundImage: null,
        },
      };
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(email, password) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: email }, { name: email }],
      },
      include: { sellerSurvey: true },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    return {
      user,
      token,
    };
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOTP: otp,
        resetOTPExpiry: otpExpiresAt,
      },
    });

    return { message: "OTP sent successfully" };
  }

  async verifyOTP(email, otp) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.resetOTP !== otp || new Date() > user.resetOTPExpiry) {
      throw new Error("Invalid or expired OTP");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOTP: null,
        resetOTPExpiry: null,
        isOTPVerified: true,
      },
    });

    return { message: "OTP verified successfully" };
  }

  async resetPassword(email, otp, newPassword) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.resetOTP !== otp || new Date() > user.resetOTPExpiry) {
      throw new Error("Invalid or expired OTP");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOTP: null,
        resetOTPExpiry: null,
      },
    });

    return { message: "Password reset successfully" };
  }

  async getStoreOfAUser(id) {
    var user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    var store = await prisma.store.findFirst();

    if (!store) {
      throw new Error("Store not found");
    }
    return store;
  }
}

module.exports = new UserService();
