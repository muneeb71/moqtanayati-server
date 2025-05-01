const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();

// Import all routes
const {
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
} = require('./modules/routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app; 