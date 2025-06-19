/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique cart identifier
 *         userId:
 *           type: string
 *           description: User ID who owns the cart
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Cart creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Cart last update timestamp
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique cart item identifier
 *         cartId:
 *           type: string
 *           format: uuid
 *           description: Cart ID this item belongs to
 *         productId:
 *           type: string
 *           description: Product ID
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity of the product
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Price per unit
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Product identifier
 *         name:
 *           type: string
 *           description: Product name
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           format: float
 *           description: Product price
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of product image URLs
 *         stock:
 *           type: integer
 *           description: Available stock quantity
 *         status:
 *           type: string
 *           description: Product status (ACTIVE, INACTIVE, etc.)
 *     AddToCartRequest:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *         - price
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID to add to cart
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity of the product to add
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Price per unit
 *     UpdateCartItemRequest:
 *       type: object
 *       required:
 *         - quantity
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: New quantity for the cart item
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Updated price per unit (optional)
 *     CartResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Operation success status
 *         data:
 *           $ref: '#/components/schemas/Cart'
 *     CartItemResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Operation success status
 *         data:
 *           $ref: '#/components/schemas/CartItem'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 */

/**
 * @swagger
 * /api/buyers/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the current user's shopping cart with all items and product details
 *     tags: [Buyer Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 userId: "user123"
 *                 items:
 *                   - id: "item123"
 *                     cartId: "550e8400-e29b-41d4-a716-446655440000"
 *                     productId: "prod456"
 *                     quantity: 2
 *                     price: 29.99
 *                     product:
 *                       id: "prod456"
 *                       name: "Wireless Headphones"
 *                       description: "High-quality wireless headphones"
 *                       price: 29.99
 *                       images: ["https://example.com/image1.jpg"]
 *                       stock: 50
 *                       status: "ACTIVE"
 *                 createdAt: "2024-01-15T10:30:00Z"
 *                 updatedAt: "2024-01-15T14:45:00Z"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Add item to cart or update existing item
 *     description: Add a new product to the cart or update quantity/price if the product already exists
 *     tags: [Buyer Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *           example:
 *             productId: "prod456"
 *             quantity: 2
 *             price: 29.99
 *     responses:
 *       200:
 *         description: Item added/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "item123"
 *                 cartId: "550e8400-e29b-41d4-a716-446655440000"
 *                 productId: "prod456"
 *                 quantity: 2
 *                 price: 29.99
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid product ID or quantity must be greater than 0"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/buyers/cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the user's shopping cart
 *     tags: [Buyer Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the cart item to remove
 *         example: "item123"
 *     responses:
 *       200:
 *         description: Item removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *             example:
 *               success: true
 *       400:
 *         description: Bad request - Invalid item ID or cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Cart not found"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Cart item not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a specific item in the user's cart
 *     tags: [Buyer Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the cart item to update
 *         example: "item123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
 *           example:
 *             quantity: 3
 *             price: 29.99
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "item123"
 *                 cartId: "550e8400-e29b-41d4-a716-446655440000"
 *                 productId: "prod456"
 *                 quantity: 3
 *                 price: 29.99
 *       400:
 *         description: Bad request - Invalid quantity or cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Quantity must be greater than 0"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Cart item not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// "api/buyers/cart"
const express = require('express');
const cartController = require('../controllers/cart.controller');
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const router = express.Router();

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.addOrUpdateItem);
router.delete('/:itemId', cartController.removeItem);
router.patch('/:itemId', cartController.updateItem);

module.exports = router;