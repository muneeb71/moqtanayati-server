const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authMiddleware } = require("../../../middlewares/auth.middleware");

function adminOnly(req, res, next) {
  if (req.user && req.user.role === "ADMIN") {
    return next();
  }
  return res
    .status(403)
    .json({ success: false, message: "Access denied. Admins only." });
}

router.get("/", authMiddleware, userController.getAllUsers);
router.get("/:id", authMiddleware, adminOnly, userController.getUserById);
router.get(
  "/buyer-detail/:id",
  authMiddleware,
  userController.getBuyerDetailById
);
router.put("/:id", authMiddleware, adminOnly, userController.editUser);
router.delete("/:id", authMiddleware, adminOnly, userController.deleteUser);

module.exports = router;
