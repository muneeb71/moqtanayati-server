const authService = require("../services/auth.service");

class AuthController {
  async sendOtp(req, res) {
    try {
      const { phone, email } = req.body;
      if (!phone && !email) {
        return res
          .status(400)
          .json({ success: false, message: "Phone or email is required." });
      }
      const result = await authService.sendOtp({ phone, email });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { phone, email, otp } = req.body;
      if ((!phone && !email) || !otp) {
        return res.status(400).json({
          success: false,
          message: "Phone or email and OTP are required.",
        });
      }
      const result = await authService.verifyOtp({ phone, email, otp });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async verifyForgotOtp(req, res) {
    try {
      const { phone, email, otp } = req.body;
      if ((!phone && !email) || !otp) {
        return res.status(400).json({
          success: false,
          message: "Phone or email and OTP are required.",
        });
      }
      const result = await authService.verifyForgotOtp({ phone, email, otp });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { phone, email } = req.body;
      if (!phone && !email) {
        return res
          .status(400)
          .json({ success: false, message: "Phone or email is required." });
      }
      const result = await authService.forgotPassword({ phone, email });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { phone, email, newPassword, confirmPassword } = req.body;
      if ((!phone && !email) || !newPassword || !confirmPassword) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }
      const result = await authService.resetPassword({
        phone,
        email,
        newPassword,
        confirmPassword,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { email, phone, currentPassword, newPassword, confirmPassword } =
        req.body;
      if (
        (!email && !phone) ||
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required." });
      }
      const result = await authService.changePassword({
        email,
        phone,
        currentPassword,
        newPassword,
        confirmPassword,
      });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
