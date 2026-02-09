const express = require("express");
const router = express.Router();
const productQAController = require("../../product/controllers/product-qa.controller");

// Guest-allowed (no token): GET /products/:productId/questions

/**
 * @swagger
 * /api/buyers/products/{productId}/questions:
 *   post:
 *     summary: Ask a question about a product
 *     tags: [Buyer - Product Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question about the product
 *                 example: "What is the condition of this item?"
 *     responses:
 *       201:
 *         description: Question asked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/products/:productId/questions", productQAController.askQuestion);

/**
 * @swagger
 * /api/buyers/products/{productId}/questions:
 *   get:
 *     summary: Get all questions for a product
 *     tags: [Buyer - Product Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Product questions retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/products/:productId/questions",
  productQAController.getProductQuestions
);

/**
 * @swagger
 * /api/buyers/questions:
 *   get:
 *     summary: Get all questions asked by the buyer
 *     tags: [Buyer - Product Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Buyer questions retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/questions", productQAController.getBuyerQuestions);

/**
 * @swagger
 * /api/buyers/questions/{questionId}:
 *   delete:
 *     summary: Delete a question (only unanswered questions)
 *     tags: [Buyer - Product Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.delete("/questions/:questionId", productQAController.deleteQuestion);

module.exports = router;
