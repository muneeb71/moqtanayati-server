const express = require('express');
const router = express.Router();
const SellerController = require('../controllers/seller.controller');

router.post('/save-survey', SellerController.checkExisting);

module.exports = router;