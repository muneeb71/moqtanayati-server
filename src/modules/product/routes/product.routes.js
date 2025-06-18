const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const sellerOnly = require("../../../middlewares/seller.middleware");
const ProductController = require("../controllers/product.controller");
const multer = require("multer");

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Product created
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product data
 *   patch:
 *     summary: Update product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */

/**
 * @swagger
 * /api/products/drafts:
 *   get:
 *     summary: Get all draft products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of draft products
 */

/**
 * @swagger
 * /api/products/store/{storeId}/drafts:
 *   get:
 *     summary: Get all draft products for a specific store
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of draft products for the store
 */

/**
 * @swagger
 * /api/products/{productId}/favorite:
 *   post:
 *     summary: Add product to favorites
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product added to favorites
 *   delete:
 *     summary: Remove product from favorites
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from favorites
 */

/**
 * @swagger
 * /api/products/{productId}/favorite/count:
 *   get:
 *     summary: Get number of users who favorited the product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite count
 */

/**
 * @swagger
 * /api/products/favorites:
 *   get:
 *     summary: Get user's favorite products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of favorite products
 */

/**
 * @swagger
 * /api/products/{productId}/favorite/check:
 *   get:
 *     summary: Check if product is favorited by user
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite status
 */

const upload = multer();

router.use(auth, sellerOnly);

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  ProductController.createProduct
);
router.get("/", ProductController.getAllProducts);
router.get("/store/:storeId", ProductController.getAllProductsByStoreId);
router.get("/:id", ProductController.getProductById);
router.patch(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  ProductController.updateProduct
);
router.delete("/:id", ProductController.deleteProduct);
router.patch("/:id/status", ProductController.updateProductStatus);
router.patch("/:id/stock", ProductController.updateStock);
router.get("/drafts", ProductController.getDraftProducts);
router.get("/store/:storeId/drafts", ProductController.getDraftProducts);
router.post("/:productId/favorite", ProductController.addToFavorites);
router.delete("/:productId/favorite", ProductController.removeFromFavorites);
router.get("/:productId/favorite/count", ProductController.getFavoriteCount);
router.get("/favorites", ProductController.getUserFavorites);
router.get("/:productId/favorite/check", ProductController.isProductFavorited);

module.exports = router;
