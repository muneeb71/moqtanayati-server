const productService = require('../services/product.service');

class ProductController {
  async createProduct(req, res) {
    try {
      // Handle uploaded files
      let images = [];
      let video = undefined;
      if (req.files) {
        if (req.files.images) {
          images = req.files.images.map(file => file.path.replace(/\\/g, '/'));
        }
        if (req.files.video && req.files.video[0]) {
          video = req.files.video[0].path.replace(/\\/g, '/');
        }
      }
      // Merge files with body
      const productData = { ...req.body, images, video };
      // Parse arrays if sent as JSON strings
      if (typeof productData.categories === 'string') {
        try { productData.categories = JSON.parse(productData.categories); } catch {}
      }
      if (typeof productData.images === 'string') {
        try { productData.images = JSON.parse(productData.images); } catch {}
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
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      // Handle uploaded files
      let images = undefined;
      let video = undefined;
      if (req.files) {
        if (req.files.images) {
          images = req.files.images.map(file => file.path.replace(/\\/g, '/'));
        }
        if (req.files.video && req.files.video[0]) {
          video = req.files.video[0].path.replace(/\\/g, '/');
        }
      }
      // Merge files with body
      const productData = { ...req.body };
      if (images) productData.images = images;
      if (video) productData.video = video;
      // Parse arrays if sent as JSON strings
      if (typeof productData.categories === 'string') {
        try { productData.categories = JSON.parse(productData.categories); } catch {}
      }
      if (typeof productData.images === 'string') {
        try { productData.images = JSON.parse(productData.images); } catch {}
      }
      const product = await productService.updateProduct(req.params.id, productData);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async disableProduct(req, res) {
    try {
      const product = await productService.disableProduct(req.params.id, req.body.disabled);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStock(req, res) {
    try {
      const product = await productService.updateStock(req.params.id, req.body.stock);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProductController(); 