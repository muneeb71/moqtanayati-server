const { UserRole } = require('@prisma/client');

const sellerMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== UserRole.SELLER) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Seller privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying seller access'
    });
  }
};

module.exports = sellerMiddleware;
