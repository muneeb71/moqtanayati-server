const { PrismaClient } = require('@prisma/client');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const generateOtp = require('../../../utils/otp');
const { PrismaClient } = require("@prisma/client");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const generateOtp = require("../../../utils/otp");

const prisma = new PrismaClient();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: "nyomsnyom@gmail.com",
    pass: "hhai uplj asls schm",
  },
});

class AuthService {
  async sendOtp({ phone, email }) {
    if (!phone && !email) {
      throw new Error("Phone or email is required.");
    }
    const otp = generateOtp();
    // Delete any existing OTP for this phone or email
    if (phone) await prisma.otp.deleteMany({ where: { phone } });
    if (email) await prisma.otp.deleteMany({ where: { email } });
    // Create new OTP
    await prisma.otp.create({ data: { phone, email, otp } });
    if (phone) {
      try {
        await client.messages.create({
          body: `Your verification code is: ${otp}`,
          from: twilioPhoneNumber,
          to: phone,
        });
        return { message: "OTP sent via SMS." };
      } catch (error) {
        console.error("Twilio Error:", error);
        throw new Error("Failed to send OTP via SMS.");
      }
    } else if (email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: "Your Verification Code",
          text: `Your verification code is: ${otp}`,
        });
        return { message: "OTP sent via email." };
      } catch (error) {
        console.error("NodeMailer Error:", error);
        throw new Error("Failed to send OTP via email.");
      }
    }
  }

  async verifyOtp({ phone, email, otp }) {
    if (!otp || (!phone && !email)) {
      throw new Error("OTP and phone or email are required.");
    }
    let otpRecord;
    if (phone) {
      otpRecord = await prisma.otp.findUnique({ where: { phone } });
    } else if (email) {
      otpRecord = await prisma.otp.findUnique({ where: { email } });
    }
    if (!otpRecord || otpRecord.otp !== otp) {
      throw new Error("Invalid OTP.");
    }
    // OTP is valid, delete it
    if (phone) await prisma.otp.delete({ where: { phone } });
    if (email) await prisma.otp.delete({ where: { email } });
    return { message: "OTP verified successfully." };
  }

  async verifyForgotOtp({ phone, email, otp }) {
    if (!otp || (!phone && !email)) {
      throw new Error("OTP and phone or email are required.");
    }
    let otpRecord;
    if (phone) {
      otpRecord = await prisma.otp.findUnique({ where: { phone } });
    } else if (email) {
      otpRecord = await prisma.otp.findUnique({ where: { email } });
    }
    if (!otpRecord || otpRecord.otp !== otp) {
      throw new Error("Invalid OTP.");
    }
    // Set verified to true (do not delete)
    await prisma.otp.update({
      where: phone ? { phone } : { email },
      data: { verified: true },
    });
    return { message: "OTP verified for password reset." };
  }

  async forgotPassword({ phone, email }) {
    // Reuse sendOtp logic
    return this.sendOtp({ phone, email });
  }

  async resetPassword({ phone, email, newPassword, confirmPassword }) {
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }
    // Check for a verified OTP
    let otpRecord;
    if (phone) {
      otpRecord = await prisma.otp.findUnique({ where: { phone } });
    } else if (email) {
      otpRecord = await prisma.otp.findUnique({ where: { email } });
    }
    if (!otpRecord || !otpRecord.verified) {
      throw new Error("OTP not verified.");
    }
    // Find user
    let user;
    if (phone) {
      user = await prisma.user.findFirst({ where: { phone } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }
    if (!user) {
      throw new Error("User not found.");
    }
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    // Delete OTP
    if (phone) await prisma.otp.delete({ where: { phone } });
    if (email) await prisma.otp.delete({ where: { email } });
    return { message: "Password reset successfully." };
  }

  async changePassword({
    email,
    phone,
    currentPassword,
    newPassword,
    confirmPassword,
  }) {
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (phone) {
      user = await prisma.user.findUnique({ where: { phone } });
    }
    if (!user) {
      throw new Error("User not found.");
    }

    // Check current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password is incorrect.");
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully." };
  }
}

module.exports = new AuthService();
