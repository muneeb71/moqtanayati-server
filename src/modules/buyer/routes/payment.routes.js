const express = require('express');
const paymentController = require('../controllers/payment.controller');
const router = express.Router();

/**
 * @swagger
 * /api/buyers/payment:
 *   get:
 *     summary: Get all payments for the buyer
 *     tags: [Buyer Payment]
 *     responses:
 *       200:
 *         description: List of payments
 *   post:
 *     summary: Make a payment
 *     tags: [Buyer Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Payment made
 */

router.get('/', paymentController.getPaymentMethods);
router.post('/', paymentController.addPaymentMethod);
router.delete('/:id', paymentController.removePaymentMethod);

module.exports = router;