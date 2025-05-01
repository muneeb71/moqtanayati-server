const profileService = require('../services/profile.service');

class ProfileController {
  async getProfile(req, res) {
    try {
      const profile = await profileService.getProfile(req.params.userId);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      let logo = undefined;
      if (req.file) {
        logo = req.file.path.replace(/\\/g, '/');
      }
      const profileData = { ...req.body };
      if (logo) profileData.logo = logo;
      const profile = await profileService.updateProfile(req.params.userId, profileData);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const profile = await profileService.updateStatus(req.params.userId, req.body.status);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProfileController(); 