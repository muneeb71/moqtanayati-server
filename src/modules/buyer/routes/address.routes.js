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

const express = require('express');
const addressController = require('../controllers/address.controller');
const router = express.Router();

router.get('/', addressController.getAddresses);
router.post('/', addressController.addAddress);
router.delete('/:id', addressController.removeAddress);

module.exports = router;