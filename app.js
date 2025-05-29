const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const sellerRouter = require('./src/modules/seller/routes/seller.routes');
const productRouter = require('./src/modules/product/routes/product.routes');
// const authRouter = require('./src/modules/auth');
const orderRouter = require('./src/modules/order/routes/order.routes');
const { authMiddleware, sellerAuthMiddleware } = require('./src/middlewares/auth.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes
// app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/sellers', authMiddleware, sellerRouter);
app.use('/api/products', productRouter); // Public product routes
app.use('/api/seller/products', sellerAuthMiddleware, productRouter); // Protected seller product routes
app.use('/api/orders', authMiddleware, orderRouter); // Protected order routes
app.use('/api/seller/orders', sellerAuthMiddleware, orderRouter); // Protected seller order routes

// Error handling
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

module.exports = app;
