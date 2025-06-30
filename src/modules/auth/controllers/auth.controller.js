const authService = require('../services/auth.service');

class AuthController {
  async sendOtp(req, res) {
    try {
      const { phone, email } = req.body;
      if (!phone && !email) {
        return res.status(400).json({ success: false, message: 'Phone or email is required.' });
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
        return res.status(400).json({ success: false, message: 'Phone or email and OTP are required.' });
      }
      const result = await authService.verifyOtp({ phone, email, otp });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
