const paymentService = require('../services/payment.service');

class PaymentController {
  async getPaymentMethods(req, res) {
    try {
      const userId = req.user.id;
      const methods = await paymentService.getPaymentMethods(userId);
      res.status(200).json({ success: true, data: methods });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addPaymentMethod(req, res) {
    try {
      const userId = req.user.id;
      const method = await paymentService.addPaymentMethod(userId, req.body);
      res.status(201).json({ success: true, data: method });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removePaymentMethod(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await paymentService.removePaymentMethod(userId, id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PaymentController(); 