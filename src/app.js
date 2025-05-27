const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Import routes
import adminRoutes from './modules/admin/routes/admin.routes';
import productRoutes from './modules/product/routes/product.routes';
import sellerRoutes from './modules/seller/routes/seller.routes';
import auctionRoutes from './modules/auction/routes/auction.routes';
import supportRoutes from './modules/support/routes/support.routes';
import analyticsRoutes from './modules/analytics/routes/analytics.routes';
import orderRoutes from './modules/order/routes/order.routes';
import buyerRoutes from './modules/buyer/routes/buyer.routes';
import feedbackRoutes from './modules/feedback/routes/feedback.routes';
import preferencesRoutes from './modules/preferences/routes/preferences.routes';
import paymentRoutes from './modules/payment/routes/payment.routes';
import cartRoutes from './modules/cart/routes/cart.routes';
import notificationRoutes from './modules/notification/routes/notification.routes';
import addressRoutes from './modules/address/routes/address.routes';
import watchlistRoutes from './modules/watchlist/routes/watchlist.routes';
import chatRoutes from './modules/chat/routes/chat.routes';


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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
