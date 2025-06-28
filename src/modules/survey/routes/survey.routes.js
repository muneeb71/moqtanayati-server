const express = require("express");
const router = express.Router();
const SurveyController = require("../controllers/survey.controller");

router.post("/save", SurveyController.save);

router.get("/:userId", SurveyController.getUserSurveyDetail);

module.exports = router;
