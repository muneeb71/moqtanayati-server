const supportService = require('../services/support.service');

class SupportController {
  async submitSupportRequest(req, res) {
    try {
      let attachment = undefined;
      if (req.file) {
        attachment = req.file.path.replace(/\\/g, '/');
      }
      const supportData = { ...req.body };
      if (attachment) supportData.attachment = attachment;
      await supportService.submitSupportRequest(supportData);
      res.status(201).json({ success: true, message: 'Support request submitted.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SupportController(); 