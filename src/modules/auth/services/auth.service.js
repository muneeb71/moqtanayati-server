const { PrismaClient } = require('@prisma/client');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const { generateOtp } = require('../../../utils/otp');

const prisma = new PrismaClient();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service:"gmail",
    port: 587,
    secure: false,
    auth: {
      user: 'nyomsnyom@gmail.com',
      pass: 'hhai uplj asls schm',
    },
});

class AuthService {
  async sendOtp({ phone, email }) {
    if (!phone && !email) {
      throw new Error('Phone or email is required.');
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
        return { message: 'OTP sent via SMS.' };
      } catch (error) {
        console.error('Twilio Error:', error);
        throw new Error('Failed to send OTP via SMS.');
      }
    } else if (email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Your Verification Code',
          text: `Your verification code is: ${otp}`,
        });
        return { message: 'OTP sent via email.' };
      } catch (error) {
        console.error('NodeMailer Error:', error);
        throw new Error('Failed to send OTP via email.');
      }
    }
  }

  async verifyOtp({ phone, email, otp }) {
    if (!otp || (!phone && !email)) {
      throw new Error('OTP and phone or email are required.');
    }
    let otpRecord;
    if (phone) {
      otpRecord = await prisma.otp.findUnique({ where: { phone } });
    } else if (email) {
      otpRecord = await prisma.otp.findUnique({ where: { email } });
    }
    if (!otpRecord || otpRecord.otp !== otp) {
      throw new Error('Invalid OTP.');
    }
    // OTP is valid, delete it
    if (phone) await prisma.otp.delete({ where: { phone } });
    if (email) await prisma.otp.delete({ where: { email } });
    return { message: 'OTP verified successfully.' };
  }
}

module.exports = new AuthService();
