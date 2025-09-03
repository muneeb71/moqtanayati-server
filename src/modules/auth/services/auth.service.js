const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const generateOtp = require("../../../utils/otp");
const axios = require("axios");

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  service: "gmail",
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

class AuthService {
  async sendOtp({ phone, email, isNew }) {
    if (!phone && !email) {
      throw new Error("Phone or email is required.");
    }

    const otp = generateOtp();

    if (phone) {
      console.log("po : ", phone);
      await prisma.otp.deleteMany({ where: { phone } });

      if (isNew) {
        console.log("po 2 : ", isNew);
        const user = await prisma.user.findFirst({
          where: { phone },
        });
        console.log("user ", user);
        if (user) {
          throw new Error("Phone is already in use.");
        }
      }
    }
    if (email) {
      await prisma.otp.deleteMany({ where: { email } });
      if (isNew) {
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (user) {
          throw new Error("Email is already in use.");
        }
      }
    }

    const otpRecordCreated = await prisma.otp.create({
      data: { phone, email, otp },
    });
    console.log("otp record created : ", otpRecordCreated);

    if (phone) {
      console.log("in phone : ", phone);

      try {
        const message = `Your verification code is ${otp}.  
Valid for 5 minutes.  
- Moqtanayati
`;

        const encodedMessage = encodeURIComponent(message);

        const url = `https://www.dreams.sa/index.php/api/sendsms/?user=moqtanayati&secret_key=$2y$10$2nOQ/MW642TyngFWjvDRiedvwrsjVsmybeBLrcFzibM1dYt0eVQEW&sender=Mqtniaty&to=${phone}&message=${encodedMessage}`;

        const response = await axios.get(url);

        console.log("Dreams SMS Response:", response.data);

        return { message: "OTP sent via SMS." };
      } catch (error) {
        console.error("Dreams SMS Error:", error.message);
        throw new Error("Failed to send OTP via SMS.");
      }
    } else if (email) {
      console.log("in email : ", email);
      const user = await prisma.user.findUnique({
        where: { email },
      });

      console.log("user : ", user);
      try {
        await transporter.sendMail({
          from: `"Moqtanayati" <${process.env.SMTP_FROM}>`,
          to: email,
          subject: "Your Moqtanayati OTP Code",
          html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #4CAF50;">Hello${user ? `, ${user.name}` : ""}!</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <p style="font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #4CAF50;">${otp}</p>
          <p>This code will expire in <b>5 minutes</b>. Please do not share it with anyone.</p>
          <hr/>
          <p style="font-size: 12px; color: #777;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
          text: `Your OTP code is: ${otp}`,
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

    const user = await prisma.user.findUnique({
      where: { email: email, phone: phone },
    });

    if (user) {
      await prisma.user.update({
        where: { email: email, phone: phone },
        data: { isVerified: true },
      });
    }

    console.log("user : ", user);

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
    const isNew = false;
    return this.sendOtp({ phone, email, isNew });
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
