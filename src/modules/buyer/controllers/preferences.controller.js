const preferencesService = require('../services/preferences.service');

class PreferencesController {
  async getPreferences(req, res) {
    try {
      const userId = req.user.id;
      const prefs = await preferencesService.getPreferences(userId);
      res.status(200).json({ success: true, data: prefs });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updatePreferences(req, res) {
    try {
      const userId = req.user.id;
      const prefs = await preferencesService.updatePreferences(userId, req.body);
      res.status(200).json({ success: true, data: prefs });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PreferencesController(); 