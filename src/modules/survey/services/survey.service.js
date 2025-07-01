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
      "iban",
      "cr",
      "vat",
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

    let sellerDetail;
    const existingSellerDetail = await prisma.sellerDetail.findUnique({
      where: { userId: data.userId },
    });
    if (existingSellerDetail) {
      sellerDetail = await prisma.sellerDetail.update({
        where: { userId: data.userId },
        data: {
          iban: data.iban,
          cr: data.cr,
          vat: data.vat,
        },
      });
    } else {
      sellerDetail = await prisma.sellerDetail.create({
        data: {
          iban: data.iban,
          cr: data.cr,
          vat: data.vat,
          userId: data.userId,
        },
      });
    }

    // Ensure goal is uppercase and valid
    const validGoals = ["DISCOVER", "PROFIT", "NEWBUSINESS", "EXPLORE"];
    let goal =
      typeof data.goal === "string" ? data.goal.toUpperCase() : data.goal;
    if (!validGoals.includes(goal)) {
      throw new Error("Invalid goal value");
    }

    // Ensure consent is boolean
    let consent = data.consent;
    if (typeof consent === "string") {
      consent = consent.toLowerCase() === "true";
    } else {
      consent = !!consent;
    }

    const survey = await prisma.sellerSurvey.create({
      data: {
        userId: data.userId,
        entity: data.entity,
        hasProducts: data.hasProducts ?? false,
        hasExperience: data.hasExperience ?? false,
        goal: goal,
        productAndServices: data.productAndServices,
        homeSupplies: data.homeSupplies,
        consent: consent,
      },
    });

    const result = { survey: survey, seller: sellerDetail };

    return result;
  }

  async getUserSurveyDetail(userId) {
    const survey = await prisma.sellerSurvey.findUnique({
      where: { userId: userId },
    });
    if (!survey) throw new Error("User survey detail not found");
    return survey;
  }
}

module.exports = new SurveyService();
