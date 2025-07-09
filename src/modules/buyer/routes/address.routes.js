/**
 * @swagger
 * /api/buyers/address:
 *   get:
 *     summary: Get all addresses for the buyer
 *     tags: [Buyer Address]
 *     responses:
 *       200:
 *         description: List of addresses
 *   post:
 *     summary: Add a new address for the buyer
 *     tags: [Buyer Address]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Address added
 */

const express = require("express");
const addressController = require("../controllers/address.controller");
const { authMiddleware } = require("../../../middlewares/auth.middleware");
const { auth } = require("firebase-admin");
const router = express.Router();

router.get("/", authMiddleware, addressController.getAddresses);
router.put("/", authMiddleware, addressController.addAddress);
router.delete("/:id", authMiddleware, addressController.removeAddress);

module.exports = router;
