const express = require('express');
const router = express.Router();
const { auth } = require('../../../middlewares/auth.middleware');
const { sellerOnly } = require('../../../middlewares/seller.middleware');
const ProductController = require('../controllers/product.controller');
const upload = require('../../../middlewares/upload.middleware');

router.use(auth, sellerOnly);

router.post('/', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), ProductController.createProduct);
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProduct);
router.patch('/:id', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.patch('/:id/status', ProductController.updateProductStatus);
router.patch('/:id/stock', ProductController.updateStock);

module.exports = router; 