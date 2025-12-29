const prisma = require("../../../config/prisma");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const generateOtp = require("../../../utils/otp");
const axios = require("axios");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  service: "gmail",
  port: process.env.SMTP_PORT,
  secure: true,
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

    // ============================================
    // SECTION 1: PHONE/SMS OTP SENDING
    // ============================================
    if (phone) {
      console.log("in phone : ", phone);

      // OLD LOGIC - Commented out
      // const otpRecordCreated = await prisma.otp.upsert({
      //   where: { phone },
      //   update: { otp, email },
      //   create: { phone, email, otp },
      // });
      // console.log("otp record created : ", otpRecordCreated);
      // return { message: `OTP sent via SMS: ${otp}`, otp };

      // NEW LOGIC - Send SMS via dreams.sa API
      try {
        // Format phone number - ensure it's in the correct format (remove any + or spaces)
        const formattedPhone = phone.replace(/[\s\+]/g, "");
        
        // Create message with OTP and phone number
        const message = `Your verification code is ${otp} for phone number ${phone}. Valid for 5 minutes.`;

        const encodedMessage = encodeURIComponent(message);

        const url = `https://www.dreams.sa/index.php/api/sendsms/?user=moqtanayati&secret_key=edacd31f8233fb1050c588e8c1c003cd09388d9b60625284ce4797a1eba14b93&sender=Muqtanaiaty&to=${formattedPhone}&message=${encodedMessage}`;

        const response = await axios.get(url);

        console.log("Dreams SMS Response:", response.data);
        console.log("Dreams SMS Status Code:", response.status);

        // Check if SMS was sent successfully - status code should be 200
        if (response.status !== 200) {
          console.error("SMS failed with status code:", response.status);
          throw new Error(
            `SMS sending failed with status code: ${response.status}`
          );
        }

        // Only create OTP record after successful SMS
        const otpRecordCreated = await prisma.otp.upsert({
          where: { phone },
          update: { otp, email },
          create: { phone, email, otp },
        });
        console.log("otp record created : ", otpRecordCreated);

        return { message: "OTP sent via SMS." };

      } catch (error) {
        console.error("Dreams SMS Error:", error.message);
        throw new Error("Failed to send OTP via SMS.");
      }
    }

    // ============================================
    // SECTION 2: EMAIL OTP SENDING
    // ============================================
    else if (email) {
      console.log("in email : ", email);

      // OLD LOGIC - Commented out (Email sending via nodemailer)
      // try {
      //   await transporter.sendMail({
      //     from: `"Moqtanayati" <${process.env.SMTP_FROM}>`,
      //     to: email,
      //     subject: "Your Moqtanayati OTP Code",
      //     html: `
      //     <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      //       <h2 style="color: #4CAF50;">Hello${user ? `, ${user.name}` : ""}!</h2>
      //       <p>Your One-Time Password (OTP) is:</p>
      //       <p style="font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #4CAF50;">${otp}</p>
      //       <p>This code will expire in <b>5 minutes</b>. Please do not share it with anyone.</p>
      //       <hr/>
      //       <p style="font-size: 12px; color: #777;">If you did not request this, you can safely ignore this email.</p>
      //     </div>
      //   `,
      //     text: `Your OTP code is: ${otp}`,
      //   });
      //   const otpRecordCreated = await prisma.otp.create({
      //     data: { phone, email, otp },
      //   });
      //   console.log("otp record created : ", otpRecordCreated);
      //   return { message: `Your OTP code is: ${otp}`, otp };
      // } catch (error) {
      //   console.error("NodeMailer Error:", error);
      //   throw new Error("Failed to send OTP via email.");
      // }

      // CURRENT LOGIC - Return OTP directly (for development/testing)
      const otpRecordCreated = await prisma.otp.upsert({
        where: { email },
        update: { otp, phone },
        create: { phone, email, otp },
      });
      console.log("otp record created : ", otpRecordCreated);

      return { message: `Your OTP code is: ${otp}`, otp };
    }
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
