const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ProductService {
  async validateProductData(data, isAuction = false) {
    let requiredFields = [
      "name",
      "description",
      // "price",
      // "city",
      // "country",
      // "category",
    ];
    // if (isAuction) {
    //   requiredFields = [
    //     "auctionLaunchDate",
    //     "auctionDuration",
    //     "startingBid",
    //     "minimumOffer",
    //   ];
    // }

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }

  async createProduct(data) {
    await this.validateProductData(data, data.isAuction);
    const { isAuction, isDraft, ...restData } = data;
    const productData = {
      ...restData,
      isDraft: isDraft === "true",
      status: data.status || "DRAFT",
      stock: data.stock || 0,
      images: data.images || [],
      video: data.video || null,
    };
    const response = await prisma.product.create({
      data: productData,
    });

    console.log("RESPONSE", response);

    return response;
  }

  async updateProduct(id, data) {
    const updateData = {};

    Object.keys(data).forEach((key) => {
      // Skip isAuction field
      if (key === 'isAuction') return;
      
      if (data[key] !== undefined) {
        // Handle numeric fields based on schema types
        if (
          [
            "length",
            "width",
            "height",
            "weight",
            "price",
            "startingBid",
            "buyItNow",
            "minimumOffer",
            "autoAccept",
          ].includes(key)
        ) {
          // Convert to Float
          updateData[key] = parseFloat(data[key]);
        } else if (
          ["stock", "conditionRating", "auctionDuration"].includes(key)
        ) {
          // Convert to Int
          updateData[key] = parseInt(data[key], 10);
        } else if (key === "categories") {
          // Handle categories array
          try {
            updateData[key] = Array.isArray(data[key])
              ? data[key]
              : JSON.parse(data[key]);
          } catch (e) {
            updateData[key] = data[key];
          }
        } else if (key === "images") {
          // Ensure images is an array
          updateData[key] = Array.isArray(data[key]) ? data[key] : [data[key]];
        } else if (["isDraft", "domesticReturns", "internationalReturns", "localPickup", "disabled"].includes(key)) {
          // Handle all boolean fields
          updateData[key] = data[key] === "true" || data[key] === true;
        } else {
          updateData[key] = data[key];
        }
      }
    });

    console.log("DATA", updateData);

    return await prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async getProduct(id) {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  async getProducts(filters) {
    return await prisma.product.findMany({
      where: filters,
    });
  }

  async deleteProduct(id) {
    return await prisma.product.delete({
      where: { id },
    });
  }

  async updateProductStatus(id, status) {
    return await prisma.product.update({
      where: { id },
      data: { status },
    });
  }

  async updateStock(id, stock) {
    return await prisma.product.update({
      where: { id },
      data: { stock },
    });
  }

  async getProductById(id) {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  async getAllProductsByStoreId(storeId) {
    return await prisma.product.findMany({
      where: { storeId },
    });
  }

  async getDraftProducts(storeId) {
    return await prisma.product.findMany({
      where: { 
        isDraft: true,
        storeId: storeId 
      },
    });
  }
}

module.exports = new ProductService();
