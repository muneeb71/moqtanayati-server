const express = require('express');
const addressController = require('../controllers/address.controller');
const router = express.Router();

router.get('/', addressController.getAddresses);
router.post('/', addressController.addAddress);
router.delete('/:id', addressController.removeAddress);

module.exports = router; 