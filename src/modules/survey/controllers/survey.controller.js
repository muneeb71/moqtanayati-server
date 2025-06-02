const surveyService = require("../services/survey.service");

class SurveyController {
  async save(req, res) {
    try {
      const result = await surveyService.saveSurvey(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SurveyController();
