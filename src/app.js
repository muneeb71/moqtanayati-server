const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();

// Import routes
const adminRoutes = require('./modules/admin/routes/admin.routes');
const productRoutes = require('./modules/product/routes/product.routes');
const sellerRoutes = require('./modules/seller/routes/seller.routes');
const auctionRoutes = require('./modules/auction/routes/auction.routes');
const supportRoutes = require('./modules/support/routes/support.routes');
const analyticsRoutes = require('./modules/analytics/routes/analytics.routes');
const orderRoutes = require('./modules/order/routes/order.routes');
const addressRoutes = require('./modules/buyer/routes/address.routes');
const cartRoutes = require('./modules/buyer/routes/cart.routes');
const chatRoutes = require('./modules/buyer/routes/chat.routes');
const feedbackRoutes = require('./modules/buyer/routes/feedback.routes');
const notificationRoutes = require('./modules/buyer/routes/notification.routes');
const preferencesRoutes = require('./modules/buyer/routes/preferences.routes');
const paymentRoutes = require('./modules/buyer/routes/payment.routes');
const watchlistRoutes = require('./modules/buyer/routes/watchlist.routes');
const profileRoutes = require('./modules/seller/routes/profile.routes'); // Import seller profile routes


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
app.use('/api/buyers/address', addressRoutes);
app.use('/api/buyers/cart', cartRoutes);
app.use('/api/buyers/chat', chatRoutes);
app.use('/api/buyers/feedback', feedbackRoutes);
app.use('/api/buyers/notification', notificationRoutes);
app.use('/api/buyers/preferences', preferencesRoutes);
app.use('/api/buyers/payment', paymentRoutes);
app.use('/api/buyers/watchlist', watchlistRoutes);
app.use('/api/sellers/profile', profileRoutes);


// Swagger API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
