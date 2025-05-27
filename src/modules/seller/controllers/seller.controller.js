const userService = require('../services/seller.service');

class UserController {
  async register(req, res) {
    try {
      const result = await userService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const result = await userService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      await userService.forgotPassword(req.body);
      res.status(200).json({ success: true, message: 'Reset instructions sent.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async verifyOtp(req, res) {
    try {
      await userService.verifyOtp(req.body);
      res.status(200).json({ success: true, message: 'OTP verified.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      await userService.resetPassword(req.body);
      res.status(200).json({ success: true, message: 'Password reset successful.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();