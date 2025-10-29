const { UserRole } = require("@prisma/client");

const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      console.error("Admin access denied", { user: req.user });
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
    next();
  } catch (error) {
    console.error("Error verifying admin access", error);
    res.status(500).json({
      success: false,
      message: "Error verifying admin access",
    });
  }
};

module.exports = adminMiddleware;
