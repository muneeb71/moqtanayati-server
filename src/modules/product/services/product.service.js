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

    console.log("data : ", productData);
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
    const categories = await prisma.productCategory.findMany();
    const result = await Promise.all(
      categories.map(async (cat) => {
        const subCategories = await prisma.productSubCategory.findMany({
          where: { categoryId: cat.id },
        });
        return {
          ...cat,
          subCategories,
        };
      })
    );
    return result;
  }

  async getAllProductSubCategories() {
    const response = await prisma.productSubCategory.findMany();
    return response;
  }

  async updateProduct(id, data) {
    const updateData = {};
    const isAuction = data.isAuction === true || data.isAuction === "true";

    Object.keys(data).forEach((key) => {
      if (key === "isAuction") return;

      // Skip empty / undefined / null values (do not overwrite existing data)
      if (data[key] === undefined || data[key] === null || data[key] === "")
        return;

      // FLOAT fields
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
          "shippingWeight",
          "shippingHeight",
          "shippingLength",
          "shippingWidth",
        ].includes(key)
      ) {
        updateData[key] = parseFloat(data[key]);

        // INT fields
      } else if (key === "discountPercentage") {
        updateData[key] = parseFloat(data[key]);
      } else if (
        [
          "stock",
          "conditionRating",
          "auctionDuration",
          "availableUnits",
        ].includes(key)
      ) {
        updateData[key] = parseInt(data[key], 10);

        // BOOLEAN fields
      } else if (
        [
          "domesticReturns",
          "internationalReturns",
          "localPickup",
          "disabled",
        ].includes(key)
      ) {
        updateData[key] = data[key] === "true" || data[key] === true;

        // ARRAY fields
      } else if (key === "categories") {
        try {
          updateData[key] = Array.isArray(data[key])
            ? data[key]
            : JSON.parse(data[key]);
        } catch (e) {
          updateData[key] = [data[key]];
        }

        // IMAGES: only update if provided and not empty
      } else if (key === "images") {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          updateData[key] = data[key];
        }

        // VIDEO: only update if provided and not empty
      } else if (key === "video") {
        if (typeof data[key] === "string" && data[key].trim() !== "") {
          updateData[key] = data[key];
        }

        // DEFAULT (string or other)
      } else {
        updateData[key] = data[key];
      }
    });

    // Use Prisma transaction
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        include: {
          store: { select: { userId: true } },
        },
      });

      if (!product) throw new Error("Product not found");

      const updatedProduct = await tx.product.update({
        where: { id },
        data: updateData,
      });

      // If auction enabled, create auction entry
      if (isAuction) {
        await tx.auction.create({
          data: {
            productId: id,
            sellerId: product.store.userId,
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
          { name: { contains: key, mode: "insensitive" } },
          { description: { contains: key, mode: "insensitive" } },
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
              has: categoryName,
            },
          },
          {
            categories: {
              has: normalizedCategoryName,
            },
          },
          {
            categories: {
              has: categoryName.toUpperCase(),
            },
          },
        ],
      },
      include: {
        store: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async filteredProducts({
    query,
    categories,
    condition,
    location,
    month,
    year,
  }) {
    const andFilters = [];
    if (query) {
      andFilters.push({
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
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
          { city: { contains: location, mode: "insensitive" } },
          { country: { contains: location, mode: "insensitive" } },
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
