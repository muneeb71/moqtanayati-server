const { uploadFile } = require("../../../middlewares/gcp-upload.middleware");
const productService = require("../services/product.service");

class ProductController {
  async createProduct(req, res) {
    try {
      let images = [];
      let video = undefined;
      // if (req.files) {
      //   if (req.files.images) {
      //     const imageUploadPromises = req.files.images.map(file => uploadFile(file));
      //     images = await Promise.all(imageUploadPromises);
      //   }
      //   if (req.files.video && req.files.video[0]) {
      //     video = await uploadFile(req.files.video[0]);
      //   }
      // }

      // Temporary static images usage until gcp is setup
      images = [
        "/api/static/dummy-items/1.jpeg",
        "/api/static/dummy-items/2.jpeg",
        "/api/static/dummy-items/3.jpeg",
        "/api/static/dummy-items/4.jpeg",
        "/api/static/dummy-items/5.jpeg",
      ];
      video = "";

      const productData = { ...req.body, images, video };
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
      const product = await productService.createProduct(productData);
      res.status(201).json({ success: true, data: product });
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
      // Handle uploaded files
      let images = undefined;
      let video = undefined;
      // if (req.files) {
      //   if (req.files.images) {
      //     const imageUploadPromises = req.files.images.map(file => uploadFile(file));
      //     images = await Promise.all(imageUploadPromises);
      //   }
      //   if (req.files.video && req.files.video[0]) {
      //     video = await uploadFile(req.files.video[0]);
      //   }
      // }

      // Temporary static images usage until gcp is setup
      images = [
        "/api/static/dummy-items/1.jpeg",
        "/api/static/dummy-items/2.jpeg",
        "/api/static/dummy-items/3.jpeg",
        "/api/static/dummy-items/4.jpeg",
        "/api/static/dummy-items/5.jpeg",
      ];
      video = "";
      // Merge files with body
      const productData = { ...req.body };
      if (images) productData.images = images;
      if (video) productData.video = video;
      // Parse arrays if sent as JSON strings
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
}

module.exports = new ProductController();
