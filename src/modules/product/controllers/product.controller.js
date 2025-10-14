const { uploadFile } = require("../../../middlewares/gcp-upload.middleware");
const productService = require("../services/product.service");
const { bucket } = require("../../../config/firebase");

class ProductController {
  async createProduct(req, res) {
    try {
      const payload = req.body;
      const storeId = req.storeId;

      console.log("Store ID:", storeId);
      let images = [];
      let video;

      // Upload video (if provided)
      if (req.files?.video && req.files.video.length > 0) {
        const videoFile = req.files.video[0];
        const videoName = `moqtanayati/${storeId}/product/video_${Date.now()}_${
          videoFile.originalname
        }`;
        const file = bucket.file(videoName);

        await file.save(videoFile.buffer, {
          contentType: videoFile.mimetype,
          resumable: false,
        });

        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });

        video = url;
      }

      // Upload images (if provided)
      if (req.files?.images && req.files.images.length > 0) {
        for (const img of req.files.images) {
          const imageName = `moqtanayati/${storeId}/product/${Date.now()}_${
            img.originalname
          }`;
          const file = bucket.file(imageName);

          await file.save(img.buffer, {
            contentType: img.mimetype,
            resumable: false,
          });

          const [url] = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          });

          images.push(url);
        }
      }

      // Merge with body
      const productData = { ...payload, images, video };

      // Parse JSON fields if sent as strings
      if (typeof productData.categories === "string") {
        try {
          productData.categories = JSON.parse(productData.categories);
        } catch {}
      }

      if (typeof productData.images === "string") {
        try {
          productData.images = JSON.parse(productData.images);
        } catch {}
      }

      if (typeof productData.video === "string") {
        try {
          productData.video = JSON.parse(productData.video);
        } catch {}
      }

      // Save to DB
      const product = await productService.createProduct(productData);

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createProductCategory(req, res) {
    try {
      let image = undefined;

      image = "";

      const productCategoryData = { ...req.body, image };

      if (typeof productCategoryData.image === "string") {
        try {
          productCategoryData.image = JSON.parse(productCategoryData.image);
        } catch {}
      }
      const product = await productService.createProductCategory(
        productCategoryData
      );
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllProductCategories(req, res) {
    try {
      const categories = await productService.getAllProductCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllProductSubCategories(req, res) {
    try {
      const categories = await productService.getAllProductSubCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllProductCategoryById(req, res) {
    try {
      const category = await productService.getAllProductCategoryById(
        req.params.id
      );
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Product Category not found" });
      }
      res.status(200).json({ success: true, data: category });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const payload = req.body;
      const storeId = req.storeId;

      console.log("Store ID:", storeId);
      let images = [];
      let video;

      // Upload video (if provided)
      if (req.files?.video && req.files.video.length > 0) {
        const videoFile = req.files.video[0];
        const videoName = `moqtanayati/${storeId}/product/video_${Date.now()}_${
          videoFile.originalname
        }`;
        const file = bucket.file(videoName);

        await file.save(videoFile.buffer, {
          contentType: videoFile.mimetype,
          resumable: false,
        });

        const [url] = await file.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });

        video = url;
      }

      // Upload images (if provided)
      if (req.files?.images && req.files.images.length > 0) {
        for (const img of req.files.images) {
          const imageName = `moqtanayati/${storeId}/product/${Date.now()}_${
            img.originalname
          }`;
          const file = bucket.file(imageName);

          await file.save(img.buffer, {
            contentType: img.mimetype,
            resumable: false,
          });

          const [url] = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          });

          images.push(url);
        }
      }

      // Merge with body
      const productData = { ...payload, images, video };

      // Parse JSON fields if sent as strings
      if (typeof productData.categories === "string") {
        try {
          productData.categories = JSON.parse(productData.categories);
        } catch {}
      }

      if (typeof productData.images === "string") {
        try {
          productData.images = JSON.parse(productData.images);
        } catch {}
      }

      if (typeof productData.video === "string") {
        try {
          productData.video = JSON.parse(productData.video);
        } catch {}
      }

      const product = await productService.updateProduct(
        req.params.id,
        productData
      );
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res
        .status(200)
        .json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async disableProduct(req, res) {
    try {
      const product = await productService.disableProduct(
        req.params.id,
        req.body.disabled
      );
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStock(req, res) {
    try {
      const product = await productService.updateStock(
        req.params.id,
        req.body.stock
      );
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateProductStatus(req, res) {
    try {
      const product = await productService.updateProductStatus(
        req.params.id,
        req.body.status
      );
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllProductsByStoreId(req, res) {
    try {
      const products = await productService.getAllProductsByStoreId(
        req.params.storeId
      );

      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getDraftProducts(req, res) {
    try {
      const products = await productService.getDraftProducts(
        req.params.storeId
      );
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addToFavorites(req, res) {
    try {
      const favorite = await productService.addToFavorites(
        req.user.id,
        req.params.productId
      );
      res.status(200).json({ success: true, data: favorite });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeFromFavorites(req, res) {
    try {
      await productService.removeFromFavorites(
        req.user.id,
        req.params.productId
      );
      res
        .status(200)
        .json({ success: true, message: "Product removed from favorites" });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getFavoriteCount(req, res) {
    try {
      const count = await productService.getFavoriteCount(req.params.productId);
      res.status(200).json({ success: true, data: { count } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserFavorites(req, res) {
    try {
      const favorites = await productService.getUserFavorites(req.user.id);
      res.status(200).json({ success: true, data: favorites });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async isProductFavorited(req, res) {
    try {
      const isFavorited = await productService.isProductFavorited(
        req.user.id,
        req.params.productId
      );
      res.status(200).json({ success: true, data: { isFavorited } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async search(req, res) {
    try {
      const key = req.params.key;
      const products = await productService.searchProducts(key);
      console.log(products);

      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getCategoryItems(req, res) {
    try {
      const categoryName = req.params.name.replace(/-/g, " ");
      const products = await productService.getProductsByCategory(categoryName);
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async filteredProducts(req, res) {
    try {
      const { query, categories, condition, location, month, year } = req.body;
      const products = await productService.filteredProducts({
        query,
        categories,
        condition,
        location,
        month,
        year,
      });
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProductController();
