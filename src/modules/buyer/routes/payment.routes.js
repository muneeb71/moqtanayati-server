const express = require("express");
const paymentController = require("../controllers/payment.controller");
const { authMiddleware } = require("../../../middlewares/auth.middleware");
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

router.get("/", authMiddleware, paymentController.getPaymentMethods);
router.post("/", authMiddleware, paymentController.addPaymentMethod);
router.delete("/:id", authMiddleware, paymentController.removePaymentMethod);

module.exports = router;
