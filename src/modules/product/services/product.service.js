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

  async getAllProducts() {
    const response = await prisma.product.findMany();
    return response;
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

  async createProductCategory(data) {
    const { ...restData } = data;
    const productData = {
      ...restData,
      name: data.name || 0,
      image: data.image || null,
    };

    const response = await prisma.productCategory.create({
      data: productData,
    });

    return response;
  }

  async getAllProductCategories() {
    const response = await prisma.productCategory.findMany();
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
              userId: true,
            },
          },
        },
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

  async getAllProductCategoryById(id) {
    return await prisma.productCategory.findUnique({
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
        store: {
          include: {
            user: {
              include: {
                reviews: true,
              },
            },
          },
        },
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

  async getAllProducts() {
    const products = await prisma.product.findMany({});
    return products;
  }

  async searchProducts(key) {
    return await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: key, mode: 'insensitive' } },
          { description: { contains: key, mode: 'insensitive' } },
          { categories: { has: key } },
          { categories: { hasSome: [key] } }, 
        ],
      },
    });
  }

  async getProductsByIds(productIds) {
    return await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { store: true },
    });
  }

  async getProductsByCategory(categoryName) {
    const normalizedCategoryName = categoryName.toLowerCase();
    return await prisma.product.findMany({
      where: {
        OR: [
          {
            categories: {
              has: categoryName
            }
          },
          {
            categories: {
              has: normalizedCategoryName
            }
          },
          {
            categories: {
              has: categoryName.toUpperCase()
            }
          }
        ]
      },
      include: {
        store: {
          include: {
            user: true
          }
        }
      }
    });
  }

  async filteredProducts({ query, categories, condition, location, month, year }) {
    const andFilters = [];
    if (query) {
      andFilters.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { categories: { has: query } },
          { categories: { hasSome: [query] } },
        ],
      });
    }
    if (categories && Array.isArray(categories) && categories.length > 0) {
      andFilters.push({ categories: { hasSome: categories } });
    }
    if (condition) {
      andFilters.push({ condition });
    }
    if (location) {
      andFilters.push({
        OR: [
          { city: { contains: location, mode: 'insensitive' } },
          { country: { contains: location, mode: 'insensitive' } },
        ],
      });
    }
    if (month || year) {
      let startDate, endDate;
      if (month && year) {
        startDate = new Date(`${year}-${month}-01`);
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (year) {
        startDate = new Date(`${year}-01-01`);
        endDate = new Date(`${parseInt(year) + 1}-01-01`);
      }
      if (startDate && endDate) {
        andFilters.push({ createdAt: { gte: startDate, lt: endDate } });
      }
    }
    const where = andFilters.length > 0 ? { AND: andFilters } : {};
    return await prisma.product.findMany({ where });
  }
}

module.exports = new ProductService();
