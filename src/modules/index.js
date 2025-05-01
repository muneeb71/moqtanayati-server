const { adminRoutes } = require('./admin');
const { productRoutes } = require('./product');
const { sellerRoutes } = require('./seller');
const { auctionRoutes } = require('./auction');
const { supportRoutes } = require('./support');
const { analyticsRoutes } = require('./analytics');
const { orderRoutes } = require('./order');
const {
  buyerRoutes,
  feedbackRoutes,
  preferencesRoutes,
  paymentRoutes,
  cartRoutes,
  notificationRoutes,
  addressRoutes,
  watchlistRoutes,
  chatRoutes
} = require('./buyer');

module.exports = {
  adminRoutes,
  productRoutes,
  sellerRoutes,
  auctionRoutes,
  supportRoutes,
  analyticsRoutes,
  orderRoutes,
  buyerRoutes,
  feedbackRoutes,
  preferencesRoutes,
  paymentRoutes,
  cartRoutes,
  notificationRoutes,
  addressRoutes,
  watchlistRoutes,
  chatRoutes
}; 