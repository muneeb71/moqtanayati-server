const addressRoutes = require('./routes/address.routes');
const cartRoutes = require('./routes/cart.routes');
const chatRoutes = require('./routes/chat.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const watchlistRoutes = require('./routes/watchlist.routes');

module.exports = {
  buyerRoutes: [
    addressRoutes,
    cartRoutes,
    chatRoutes,
    feedbackRoutes,
    notificationRoutes,
    preferencesRoutes,
    paymentRoutes,
    watchlistRoutes,
  ]
};