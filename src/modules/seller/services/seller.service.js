const prisma = require("../../../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOtp = require("../../../utils/otp");
const axios = require("axios");

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
      isVerified: data.isVerified || false,
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

  async login(email, password, deviceToken) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: email }, { name: email }],
      },
      include: { sellerSurvey: true, store: true },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Save deviceToken if provided
    if (deviceToken) {
      await prisma.user.update({
        where: { id: user.id },
        data: { deviceToken },
      });
    }

    console.log("token : ", user.deviceToken);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    return {
      user,
      token,
    };
  }

  async forgotPassword({ phone, email }) {
    if (!phone && !email) {
      throw new Error("Phone or email is required.");
    }

    let user;
    if (phone) {
      user = await prisma.user.findFirst({
        where: { phone },
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      throw new Error("User not found");
    }

    const userPhone = phone || user.phone;
    const userEmail = email || user.email;

    if (!userPhone) {
      throw new Error("Phone number is required for OTP delivery.");
    }

    const otp = generateOtp();

    if (userPhone) {
      await prisma.otp.deleteMany({ where: { phone: userPhone } });
    }
    if (userEmail) {
      await prisma.otp.deleteMany({ where: { email: userEmail } });
    }

    try {
      const formattedPhone = userPhone.replace(/[\s\+]/g, "");

      const message = `Your verification code is ${otp} for password reset. Valid for 5 minutes.`;

      const encodedMessage = encodeURIComponent(message);

      const url = `https://www.dreams.sa/index.php/api/sendsms/?user=moqtanayati&secret_key=edacd31f8233fb1050c588e8c1c003cd09388d9b60625284ce4797a1eba14b93&sender=Muqtanaiaty&to=${formattedPhone}&message=${encodedMessage}`;

      const response = await axios.get(url);

      console.log("Dreams SMS Response:", response.data);
      console.log("Dreams SMS Status Code:", response.status);

      if (response.status !== 200) {
        console.error("SMS failed with status code:", response.status);
        throw new Error(
          `SMS sending failed with status code: ${response.status}`
        );
      }

      const otpRecordCreated = await prisma.otp.upsert({
        where: { phone: userPhone },
        update: { otp, email: userEmail },
        create: { phone: userPhone, email: userEmail, otp },
      });
      console.log("OTP record created for seller:", otpRecordCreated);

      return { message: "OTP sent via SMS." };
    } catch (error) {
      console.error("Dreams SMS Error:", error.message);
      throw new Error("Failed to send OTP via SMS.");
    }
  }

  async verifyOTP({ phone, email, otp }) {
    if (!otp || (!phone && !email)) {
      throw new Error("OTP and phone or email are required.");
    }

    // Find OTP record
    let otpRecord;
    if (phone) {
      otpRecord = await prisma.otp.findFirst({
        where: {
          phone: phone,
          otp: otp,
        },
      });
    } else if (email) {
      otpRecord = await prisma.otp.findFirst({
        where: {
          email: email,
          otp: otp,
        },
      });
    }

    if (!otpRecord) {
      throw new Error("Invalid OTP.");
    }

    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    return { message: "OTP verified successfully" };
  }

  async resetPassword({ phone, email, otp, newPassword, confirmPassword }) {
    if (!newPassword) {
      throw new Error("New password is required.");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    if (!otp || (!phone && !email)) {
      throw new Error("OTP and phone or email are required.");
    }

    let otpRecord;
    if (phone) {
      otpRecord = await prisma.otp.findUnique({ where: { phone } });
    } else if (email) {
      otpRecord = await prisma.otp.findUnique({ where: { email } });
    }

    if (!otpRecord || !otpRecord.verified || otpRecord.otp !== otp) {
      throw new Error("OTP not verified or invalid.");
    }

    let user;
    if (phone) {
      user = await prisma.user.findFirst({ where: { phone } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      throw new Error("User not found.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    if (phone) {
      await prisma.otp.delete({ where: { phone } });
    } else if (email) {
      await prisma.otp.delete({ where: { email } });
    }

    return { message: "Password reset successfully" };
  }

  async getStoreOfAUser(id) {
    var user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    var store = await prisma.store.findFirst({
      where: { userId: id },
    });

    if (!store) {
      throw new Error("Store not found");
    }
    return store;
  }

  async getStore(id) {
    var store = await prisma.store.findFirst({
      where: { id },
    });

    if (!store) {
      throw new Error("Store not found");
    }
    return store;
  }

  async editStore(id, data) {
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new Error("Store not found");
    }

    await prisma.store.update({
      where: { id: store.id },
      data: {
        ...data,
      },
    });

    const updatedStore = await prisma.store.findUnique({
      where: { id: store.id },
    });

    return { message: "Store updated successfully", store: updatedStore };
  }

  async getStoreCategories() {
    console.log("========== GET STORE CATEGORIES START ==========");
    const categories = await prisma.store.findMany({
      select: {
        storeCategory: true,
      },
      where: {
        storeCategory: {
          not: null,
        },
      },
    });
    console.log("========== GET STORE CATEGORIES SUCCESS ==========");
    console.log("Categories:", categories);

    // Extract unique store categories
    const uniqueCategories = [
      ...new Set(categories.map((store) => store.storeCategory)),
    ];

    return uniqueCategories;
  }
}

module.exports = new UserService();
