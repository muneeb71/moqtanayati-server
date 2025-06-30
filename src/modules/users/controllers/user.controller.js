const userService = require('../services/user.service');

class UserController {
  async getAllUsers(req, res) {
    console.log("hit");
    
    const userRole = req.user.role;
    console.log(userRole);
    
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async editUser(req, res) {
    try {
      const user = await userService.editUser(req.params.id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController(); 