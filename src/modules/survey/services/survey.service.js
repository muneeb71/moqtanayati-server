const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../../../utils/otp");

const prisma = new PrismaClient();

class SurveyService {
  async saveSurvey(data) {
    const survey = await prisma.sellerSurvey.create({
      data: {},
    });
    if (existing) {
      return true;
    }

    return false;
  }

  async register(data) {
    const requiredFields = [
      "role",
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

    // Check for duplicate email or phone number
    const existing = await this.checkExisting(data);
    if (existing) {
      throw new Error("Email or phone number already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        role: data.role,
        name: data.name,
        businessName: data.businessName || null,
        sellerType: data.sellerType || null,
        email: data.email,
        phone: data.phone,
        address: data.address,
        nationalId: data.nationalId,
        password: hashedPassword,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        isVerified: false,
      },
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
}

module.exports = new SurveyService();
