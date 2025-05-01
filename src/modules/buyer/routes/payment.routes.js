const express = require('express');
const paymentController = require('../controllers/payment.controller');
const router = express.Router();

router.get('/', paymentController.getPaymentMethods);
router.post('/', paymentController.addPaymentMethod);
router.delete('/:id', paymentController.removePaymentMethod);

module.exports = router; 