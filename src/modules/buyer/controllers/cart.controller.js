const cartService = require('../services/cart.service');

class CartController {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCart(userId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addOrUpdateItem(req, res) {
    console.log(req.body, req.user);
    
    try {
      const userId = req.user.userId;
      const item = await cartService.addOrUpdateItem(userId, req.body);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeItem(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      await cartService.removeItem(userId, itemId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateItem(req, res) {
    try {
      const userId = req.user.id;
      const { itemId } = req.params;
      const { quantity, price } = req.body;
      const item = await cartService.updateItem(userId, itemId, { quantity, price });
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CartController(); 