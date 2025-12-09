const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authMiddleware } = require("../../../middlewares/auth.middleware");
const adminOnly = require("../../../middlewares/admin.middleware");

router.get("/", authMiddleware, adminOnly, userController.getAllUsers);
router.get("/:id", authMiddleware, adminOnly, userController.getUserById);
router.get(
  "/buyer-detail/:id",
  authMiddleware,
  userController.getBuyerDetailById
);
router.put("/:id", authMiddleware, adminOnly, userController.editUser);
router.delete("/:id", authMiddleware, adminOnly, userController.deleteUser);

module.exports = router;
