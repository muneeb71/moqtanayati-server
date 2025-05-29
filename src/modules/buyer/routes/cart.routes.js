/**
 * @swagger
 * /api/buyers/cart:
 *   get:
 *     summary: Get the buyer's cart
 *     tags: [Buyer Cart]
 *     responses:
 *       200:
 *         description: Cart details
 *   post:
 *     summary: Add or update an item in the cart
 *     tags: [Buyer Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Item added/updated
 */

const express = require('express');
const cartController = require('../controllers/cart.controller');
const router = express.Router();

router.get('/', cartController.getCart);
router.post('/', cartController.addOrUpdateItem);
router.delete('/:itemId', cartController.removeItem);

module.exports = router;