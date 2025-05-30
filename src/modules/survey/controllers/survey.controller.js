const userService = require("../services/seller.service");

class SurveyController {
  async save(req, res) {
    try {
      const result = await userService.checkExisting(req.body);
      res
        .status(200)
        .json({
          success: true,
          data: {
            isRegistered: result,
            message: result
              ? "Email or phone already exists"
              : "Email and Phone is unique",
          },
        });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

module.exports = new SurveyController();
