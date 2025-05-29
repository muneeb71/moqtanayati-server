const orderService = require('../services/order.service');

class OrderController {
  async createOrder(req, res) {
    try {
      const order = await orderService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllOrders(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateOrder(req, res) {
    try {
      const order = await orderService.updateOrder(req.params.id, req.body);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteOrder(req, res) {
    try {
      await orderService.deleteOrder(req.params.id);
      res.status(200).json({ success: true, message: 'Order deleted successfully.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getActiveOrders(req, res) {
    try {
      const orders = await orderService.getActiveOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getCompletedOrders(req, res) {
    try {
      const orders = await orderService.getCompletedOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getCancelledOrders(req, res) {
    try {
      const orders = await orderService.getCancelledOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getReturnedOrders(req, res) {
    try {
      const orders = await orderService.getReturnedOrders();
      res.status(200).json({ success: true, data: orders });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOrderDetails(req, res) {
    try {
      const order = await orderService.getOrderDetails(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async handleCancelRequest(req, res) {
    try {
      const order = await orderService.handleCancelRequest(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async handleReturnRequest(req, res) {
    try {
      const order = await orderService.handleReturnRequest(req.params.id);
      res.status(200).json({ success: true, data: order });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OrderController();
