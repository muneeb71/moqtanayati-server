const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ProductService {
  async validateProductData(data, isAuction = false) {
    let requiredFields = ["name", "description"];

    const missingFields = requiredFields.filter((field) => !data[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }

  async createProduct(data) {
    await this.validateProductData(data, data.isAuction);
    const { isAuction, ...restData } = data;
    const productData = {
      ...restData,
      status: data.status || "DRAFT",
      stock: data.stock || 0,
      images: data.images || [],
      video: data.video || null,
    };
    const response = await prisma.product.create({
      data: productData,
    });

    return response;
  }

  async updateProduct(id, data) {
    const updateData = {};
    const isAuction = data.isAuction === true || data.isAuction === "true";

    Object.keys(data).forEach((key) => {
      if (key === "isAuction") return;

      if (data[key] !== undefined) {
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
          updateData[key] = parseFloat(data[key]);
        } else if (
          ["stock", "conditionRating", "auctionDuration"].includes(key)
        ) {
          updateData[key] = parseInt(data[key], 10);
        } else if (key === "categories") {
          try {
            updateData[key] = Array.isArray(data[key])
              ? data[key]
              : JSON.parse(data[key]);
          } catch (e) {
            updateData[key] = data[key];
          }
        } else if (key === "images") {
          updateData[key] = Array.isArray(data[key]) ? data[key] : [data[key]];
        } else if (
          [
            "domesticReturns",
            "internationalReturns",
            "localPickup",
            "disabled",
          ].includes(key)
        ) {
          updateData[key] = data[key] === "true" || data[key] === true;
        } else {
          updateData[key] = data[key];
        }
      }
    });

    // Use a transaction to ensure both product update and auction creation are atomic
    return await prisma.$transaction(async (tx) => {
      // First get the product with its store to get the seller's userId
      const product = await tx.product.findUnique({
        where: { id },
        include: {
          store: {
            select: {
              userId: true
            }
          }
        }
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Update the product
      const updatedProduct = await tx.product.update({
        where: { id },
        data: updateData,
      });

      // Create auction if isAuction is true
      if (isAuction) {
        await tx.auction.create({
          data: {
            productId: id,
            sellerId: product.store.userId, // Use the store's userId as the sellerId
            status: "UPCOMING",
          },
        });
      }

      return updatedProduct;
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
      include: {
        favorites: true,
      },
    });
  }

  async getAllProductsByStoreId(storeId) {
    const products = await prisma.product.findMany({
      where: { storeId },
    });

    return products;
  }

  async getDraftProducts(storeId) {
    return await prisma.product.findMany({
      where: {
        status: "DRAFT",
        storeId: storeId,
      },
    });
  }

  async addToFavorites(userId, productId) {
    return await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: true,
      },
    });
  }

  async removeFromFavorites(userId, productId) {
    return await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async getFavoriteCount(productId) {
    return await prisma.favorite.count({
      where: {
        productId,
      },
    });
  }

  async getUserFavorites(userId) {
    return await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
    });
  }

  async isProductFavorited(userId, productId) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return !!favorite;
  }
}

module.exports = new ProductService();
