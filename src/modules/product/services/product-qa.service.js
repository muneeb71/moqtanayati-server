const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ProductQAService {
  // Ask a question about a product (Buyer)
  async askQuestion(productId, buyerId, question) {
    // Validate that the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Validate that the buyer is not the seller
    if (product.store.userId === buyerId) {
      throw new Error("Sellers cannot ask questions about their own products");
    }

    // Create the question
    const productQuestion = await prisma.productQuestion.create({
      data: {
        productId,
        buyerId,
        question,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return productQuestion;
  }

  // Answer a question (Seller)
  async answerQuestion(questionId, sellerId, answer) {
    // Get the question with product info
    const question = await prisma.productQuestion.findUnique({
      where: { id: questionId },
      include: {
        product: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    // Validate that the seller owns the product
    if (question.product.store.userId !== sellerId) {
      throw new Error("Only the product owner can answer this question");
    }

    // Check if already answered
    if (question.answer) {
      throw new Error("This question has already been answered");
    }

    // Update the question with the answer
    const updatedQuestion = await prisma.productQuestion.update({
      where: { id: questionId },
      data: {
        answer,
        answeredBy: sellerId,
        answeredAt: new Date(),
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedQuestion;
  }

  // Get all questions for a product (Public)
  async getProductQuestions(productId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const questions = await prisma.productQuestion.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const total = await prisma.productQuestion.count({
      where: { productId },
    });

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get unanswered questions for a seller's products
  async getUnansweredQuestions(sellerId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const questions = await prisma.productQuestion.findMany({
      where: {
        answer: null,
        product: {
          store: {
            userId: sellerId,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    });

    const total = await prisma.productQuestion.count({
      where: {
        answer: null,
        product: {
          store: {
            userId: sellerId,
          },
        },
      },
    });

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get all questions asked by a buyer
  async getBuyerQuestions(buyerId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const questions = await prisma.productQuestion.findMany({
      where: { buyerId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const total = await prisma.productQuestion.count({
      where: { buyerId },
    });

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get answered questions for a seller's products
  async getAnsweredQuestions(sellerId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const questions = await prisma.productQuestion.findMany({
      where: {
        answer: { not: null },
        product: {
          store: {
            userId: sellerId,
          },
        },
      },
      orderBy: { answeredAt: "desc" },
      skip,
      take: limit,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
    });

    const total = await prisma.productQuestion.count({
      where: {
        answer: { not: null },
        product: {
          store: {
            userId: sellerId,
          },
        },
      },
    });

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Delete a question (only by the buyer who asked it)
  async deleteQuestion(questionId, buyerId) {
    const question = await prisma.productQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    if (question.buyerId !== buyerId) {
      throw new Error("You can only delete your own questions");
    }

    if (question.answer) {
      throw new Error("Cannot delete answered questions");
    }

    return await prisma.productQuestion.delete({
      where: { id: questionId },
    });
  }

  // Get question statistics for a seller
  async getSellerQAStats(sellerId) {
    const totalQuestions = await prisma.productQuestion.count({
      where: {
        product: {
          store: {
            userId: sellerId,
          },
        },
      },
    });

    const answeredQuestions = await prisma.productQuestion.count({
      where: {
        answer: { not: null },
        product: {
          store: {
            userId: sellerId,
          },
        },
      },
    });

    const unansweredQuestions = totalQuestions - answeredQuestions;

    return {
      totalQuestions,
      answeredQuestions,
      unansweredQuestions,
      answerRate:
        totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
    };
  }
}

module.exports = new ProductQAService();
