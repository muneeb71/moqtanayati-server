const express = require("express");
const router = express.Router();
const productQAController = require("../../product/controllers/product-qa.controller");
const { authMiddleware } = require("../../../middlewares/auth.middleware");
const sellerMiddleware = require("../../../middlewares/seller.middleware");

// Apply authentication and seller middleware to all routes
// router.use(authMiddleware);
// router.use(sellerMiddleware);

/**
 * @swagger
 * /api/sellers/questions/{questionId}/answer:
 *   post:
 *     summary: Answer a question about a product
 *     tags: [Seller - Product Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: The answer to the question
 *                 example: "The item is in excellent condition with no visible wear."
 *     responses:
 *       200:
 *         description: Question answered successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not the product owner
 */
router.post(
  "/questions/:questionId/answer",
  productQAController.answerQuestion
);

/**
 * @swagger
 * /api/sellers/questions/unanswered:
 *   get:
 *     summary: Get unanswered questions for seller's products
 *     tags: [Seller - Product Q&A]
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
 *         description: Unanswered questions retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/questions/unanswered", productQAController.getUnansweredQuestions);

/**
 * @swagger
 * /api/sellers/questions/answered:
 *   get:
 *     summary: Get answered questions for seller's products
 *     tags: [Seller - Product Q&A]
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
 *         description: Answered questions retrieved successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/questions/answered", productQAController.getAnsweredQuestions);

/**
 * @swagger
 * /api/sellers/questions/stats:
 *   get:
 *     summary: Get Q&A statistics for seller
 *     tags: [Seller - Product Q&A]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: QA statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalQuestions:
 *                   type: integer
 *                   description: Total number of questions
 *                 answeredQuestions:
 *                   type: integer
 *                   description: Number of answered questions
 *                 unansweredQuestions:
 *                   type: integer
 *                   description: Number of unanswered questions
 *                 answerRate:
 *                   type: number
 *                   description: Answer rate percentage
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/questions/stats", productQAController.getSellerQAStats);

module.exports = router;
