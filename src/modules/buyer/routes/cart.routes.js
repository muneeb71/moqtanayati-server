const express = require('express');
const cartController = require('../controllers/cart.controller');
const router = express.Router();

router.get('/', cartController.getCart);
router.post('/', cartController.addOrUpdateItem);
router.delete('/:itemId', cartController.removeItem);

 