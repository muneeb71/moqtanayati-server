const addressService = require('../services/address.service');

class AddressController {
  async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      const addresses = await addressService.getAddresses(userId);
      res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addAddress(req, res) {
    try {
      const userId = req.user.id;
      const address = await addressService.addAddress(userId, req.body);
      res.status(201).json({ success: true, data: address });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async removeAddress(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      await addressService.removeAddress(userId, id);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AddressController(); 