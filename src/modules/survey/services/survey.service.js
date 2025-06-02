const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class SurveyService {
  async saveSurvey(data) {
    const requiredFields = [
      "userId",
      "entity",
      "goal",
      "productAndServices",
      "homeSupplies",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const validProductAndServices = [
      "ACCESSORIES",
      "HOME",
      "ELECTRONICS",
      "FURNITURE",
      "MUSIC",
      "HEALTH",
      "JEWELLERY",
      "ANIMALS",
      "CARS",
      "FOOD",
      "GIFTS",
    ];

    const validHomeSupplies = [
      "KITCHEN",
      "HOMEDECOR",
      "FURNITURE",
      "LIGHTING",
      "CLEANING",
      "GARDEN",
      "BEDDING",
      "STORAGE",
      "TOOLSANDHARDWARE",
      "ORGANIZATION",
      "HOMESECURITY",
    ];

    if (
      !Array.isArray(data.productAndServices) ||
      data.productAndServices.some(
        (val) => !validProductAndServices.includes(val)
      )
    ) {
      throw new Error("Invalid productAndServices value(s)");
    }
    
    if (
      !Array.isArray(data.homeSupplies) ||
      data.homeSupplies.some((val) => !validHomeSupplies.includes(val))
    ) {
      throw new Error("Invalid homeSupplies value(s)");
    }

    const survey = await prisma.sellerSurvey.create({
      data: {
        userId: data.userId,
        entity: data.entity,
        hasProducts: data.hasProducts ?? false,
        hasExperience: data.hasExperience ?? false,
        goal: data.goal,
        productAndServices: data.productAndServices,
        homeSupplies: data.homeSupplies,
        consent: data.consent ?? false,
      },
    });

    return survey;
  }
}

module.exports = new SurveyService();
