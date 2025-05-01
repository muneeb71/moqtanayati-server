const { UserRole } = require('@prisma/client');

const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying admin access'
    });
  }
};

module.exports = adminMiddleware; 