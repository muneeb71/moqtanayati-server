const prisma = require("../../../config/prisma");
const nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const bcrypt = require("bcryptjs");
const generateOtp = require("../../../utils/otp");
const axios = require("axios");

let transporter;
try {
  if (!process.env.MAILTRAP_TOKEN) {
    console.warn("⚠️  MAILTRAP_TOKEN not found. Email sending will fail.");
  } else {
    transporter = nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
      })
    );
    console.log("✅ Mailtrap transporter initialized");
  }
} catch (error) {
  console.error("❌ Error initializing Mailtrap transporter:", error);
}

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

    if (phone) {
      console.log("in phone : ", phone);

      const otpRecordCreated = await prisma.otp.upsert({
        where: { phone },
        update: { otp, email },
        create: { phone, email, otp },
      });
      console.log("otp record created : ", otpRecordCreated);

      return { message: `OTP sent via SMS: ${otp}`, otp };

      //       try {
      //         const message = `Your verification code is ${otp}.
      // Valid for 5 minutes.
      // - Moqtanayati
      // `;

      //         const encodedMessage = encodeURIComponent(message);

      //         const url = `https://www.dreams.sa/index.php/api/sendsms/?user=moqtanayati&secret_key=edacd31f8233fb1050c588e8c1c003cd09388d9b60625284ce4797a1eba14b93&sender=Mqtniaty&to=${phone}&message=${encodedMessage}`;

      //         // const url = `https://www.dreams.sa/index.php/api/sendsms/?user=moqtanayati&secret_key=$2y$10$2nOQ/MW642TyngFWjvDRiedvwrsjVsmybeBLrcFzibM1dYt0eVQEW&sender=Mqtniaty&to=${phone}&message=${encodedMessage}`;

      //         const response = await axios.get(url);

      //         console.log("Dreams SMS Response:", response.data);

      //         // Check if SMS was sent successfully
      //         if (response.data && response.data < 0) {
      //           console.error("SMS failed with error code:", response.data);
      //           throw new Error(
      //             `SMS sending failed with error code: ${response.data}`
      //           );
      //         }

      //         // Only create OTP record after successful SMS
      //         const otpRecordCreated = await prisma.otp.create({
      //           data: { phone, email, otp },
      //         });
      //         console.log("otp record created : ", otpRecordCreated);

      //         return { message: "OTP sent via SMS." };

      //       } catch (error) {
      //         console.error("Dreams SMS Error:", error.message);
      //         throw new Error("Failed to send OTP via SMS.");
      //       }
    }
    
    if (email && !phone) {
      console.log("📧 Email OTP requested for:", email);

      if (!transporter) {
        console.error("❌ Email transporter not initialized!");
        throw new Error("Email transporter not initialized. Please check MAILTRAP_TOKEN.");
      }

      try {
        const sender = {
          address: process.env.MAILTRAP_FROM_EMAIL || "info@muqtanaiaty.com",
          name: process.env.MAILTRAP_FROM_NAME || "Moqtanayati",
        };

        console.log("📧 Sending OTP email to:", email);
        console.log("📧 From:", sender);
        console.log("📧 OTP:", otp);

        const mailResult = await transporter.sendMail({
          from: sender,
          to: email,
          subject: "Your Moqtanayati OTP Code",
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
              <h2 style="color: #4CAF50;">Hello!</h2>
              <p>Your One-Time Password (OTP) is:</p>
              <p style="font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #4CAF50;">${otp}</p>
              <p>This code will expire in <b>5 minutes</b>. Please do not share it with anyone.</p>
              <hr/>
              <p style="font-size: 12px; color: #777;">If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
          text: `Your OTP code is: ${otp}. This code will expire in 5 minutes.`,
          category: "OTP Verification",
        });

        console.log("✅ Email sent successfully:", JSON.stringify(mailResult, null, 2));

        const otpRecordCreated = await prisma.otp.upsert({
          where: { email },
          update: { otp, phone },
          create: { phone, email, otp },
        });
        console.log("✅ OTP record created:", otpRecordCreated);

        return { message: "OTP sent via email." };
      } catch (error) {
        console.error("❌ Mailtrap Error Details:", {
          message: error.message,
          stack: error.stack,
          response: error.response,
          code: error.code,
        });
        throw new Error(`Failed to send OTP via email: ${error.message}`);
      }
    }
    
    if (!phone && !email) {
      throw new Error("Either phone or email must be provided.");
    }
    
    throw new Error("Unexpected error: OTP generation failed.");
  }

  async verifyOtp({ phone, email, otp }) {
    if (!otp || (!phone && !email)) {
      throw new Error("OTP and phone or email are required.");
    }

    console.log("=== OTP Verification Debug ===");
    console.log("Phone:", phone);
    console.log("Email:", email);
    console.log("OTP:", otp);

    // Find OTP record - it might have both phone and email
    let otpRecord;
    if (phone) {
      console.log("Looking for OTP by phone...");
      otpRecord = await prisma.otp.findFirst({
        where: {
          phone: phone,
          otp: otp,
        },
      });
    } else if (email) {
      console.log("Looking for OTP by email...");
      otpRecord = await prisma.otp.findFirst({
        where: {
          email: email,
          otp: otp,
        },
      });
    }

    console.log("Found OTP record:", otpRecord);

    if (!otpRecord) {
      // Let's also check what OTP records exist for debugging
      const allOtpRecords = await prisma.otp.findMany({
        where: phone ? { phone: phone } : { email: email },
      });
      console.log("All OTP records for this identifier:", allOtpRecords);
      throw new Error("Invalid OTP.");
    }

    // Keep original identifiers before nulling out one side
    const originalEmail = otpRecord.email;
    const originalPhone = otpRecord.phone;

    // Null out the verified identifier on the OTP record
    console.log("Updating OTP record...");
    const updatedOtp = await prisma.otp.update({
      where: { id: otpRecord.id },
      data: phone ? { phone: null } : { email: null },
    });
    console.log("Updated OTP record:", updatedOtp);

    // If both identifiers are now null, delete the OTP row and (optionally) mark user verified
    if (!updatedOtp.phone && !updatedOtp.email) {
      console.log(
        "Both identifiers null, deleting OTP and marking user verified..."
      );
      await prisma.otp.delete({ where: { id: updatedOtp.id } });
      // If a user already exists for this email/phone, mark them verified; otherwise skip
      let candidateUser = null;
      if (originalEmail) {
        candidateUser = await prisma.user.findUnique({
          where: { email: originalEmail },
        });
      }
      if (!candidateUser && originalPhone) {
        candidateUser = await prisma.user.findFirst({
          where: { phone: originalPhone },
        });
      }
      if (candidateUser) {
        await prisma.user.update({
          where: { id: candidateUser.id },
          data: { isVerified: true },
        });
      }
    }

    console.log("OTP verification completed successfully");
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
