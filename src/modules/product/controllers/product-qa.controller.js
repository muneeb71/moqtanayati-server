const productQAService = require("../services/product-qa.service");
const { successResponse, errorResponse } = require("../../../config/response");

class ProductQAController {
  // Ask a question about a product (Buyer)
  async askQuestion(req, res) {
    try {
      const { productId } = req.params;
      const { question, buyerId } = req.body;

      if (!question || question.trim() === "") {
        return errorResponse(res, "Question is required", 400);
      }

      console.log("ask question : ", productId, buyerId, question);

      const result = await productQAService.askQuestion(
        productId,
        buyerId,
        question
      );

      return successResponse(res, "Question asked successfully", result, 201);
    } catch (error) {
      console.error("Error asking question:", error);
      return errorResponse(res, error.message, 400);
    }
  }

  // Answer a question (Seller)
  async answerQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const { answer, sellerId } = req.body;

      if (!answer || answer.trim() === "") {
        return errorResponse(res, "Answer is required", 400);
      }

      const result = await productQAService.answerQuestion(
        questionId,
        sellerId,
        answer
      );

      return successResponse(res, "Question answered successfully", result);
    } catch (error) {
      console.error("Error answering question:", error);
      return errorResponse(res, error.message, 400);
    }
  }

  // Get all questions for a product (Public)
  async getProductQuestions(req, res) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await productQAService.getProductQuestions(
        productId,
        parseInt(page),
        parseInt(limit)
      );

      return successResponse(
        res,
        "Product questions retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Error getting product questions:", error);
      return errorResponse(res, error.message, 400);
    }
  }

  // Get unanswered questions for a seller's products
  async getUnansweredQuestions(req, res) {
    try {
      const sellerId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await productQAService.getUnansweredQuestions(
        sellerId,
        parseInt(page),
        parseInt(limit)
      );

      return successResponse(
        res,
        "Unanswered questions retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Error getting unanswered questions:", error);
      return errorResponse(res, error.message, 400);
    }
  }

  // Get all questions asked by a buyer
  async getBuyerQuestions(req, res) {
    try {
      const buyerId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await productQAService.getBuyerQuestions(
        buyerId,
        parseInt(page),
        parseInt(limit)
      );

      return successResponse(
        res,
        "Buyer questions retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Error getting buyer questions:", error);
      return errorResponse(res, error.message, 400);
    }
  }

  // Get answered questions for a seller's products
  async getAnsweredQuestions(req, res) {
    try {
      const sellerId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await productQAService.getAnsweredQuestions(
        sellerId,
        parseInt(page),
        parseInt(limit)
      );

      return successResponse(
        res,
        "Answered questions retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Error getting answered questions:", error);
      return errorResponse(res, error.message, 400);
    }
  }

  // Delete a question (only by the buyer who asked it)
  async deleteQuestion(req, res) {
    try {
      const { questionId } = req.params;
      const buyerId = req.user.id;

      await productQAService.deleteQuestion(questionId, buyerId);

      return successResponse(res, "Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      return errorResponse(res, error.message, 400);
    }
  }

  // Get question statistics for a seller
  async getSellerQAStats(req, res) {
    try {
      const sellerId = req.user.id;

      const result = await productQAService.getSellerQAStats(sellerId);

      return successResponse(
        res,
        "QA statistics retrieved successfully",
        result
      );
    } catch (error) {
      console.error("Error getting QA statistics:", error);
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new ProductQAController();
