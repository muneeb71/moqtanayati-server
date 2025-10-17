const express = require("express");
const cors = require("cors");
const morgan = "morgan";
const { createServer } = require("http");
const { Server } = require("socket.io");

const { swaggerUi, swaggerSpec } = require("./config/swagger");

const auctionScheduler = require("./utils/auctionScheduler");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:7000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

global.io = io;

// User room join/leave for realtime events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_user", (payload = {}) => {
    const userId = payload.userId || payload.id;
    if (!userId) return;
    const room = `user:${userId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("leave_user", (payload = {}) => {
    const userId = payload.userId || payload.id;
    if (!userId) return;
    const room = `user:${userId}`;
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Import routes
const adminRoutes = require("./modules/admin/routes/admin.routes");
const productRoutes = require("./modules/product/routes/product.routes");
const sellerRoutes = require("./modules/seller/routes/seller.routes");
const auctionRoutes = require("./modules/auction/routes/auction.routes");
const supportRoutes = require("./modules/support/routes/support.routes");
const analyticsRoutes = require("./modules/analytics/routes/analytics.routes");
const orderRoutes = require("./modules/order/routes/order.routes");
const addressRoutes = require("./modules/buyer/routes/address.routes");
const cartRoutes = require("./modules/buyer/routes/cart.routes");
const chatRoutes = require("./modules/chats/routes/chat.routes");
const feedbackRoutes = require("./modules/buyer/routes/feedback.routes");
const notificationRoutes = require("./modules/notification/routes/notification.routes");
const preferencesRoutes = require("./modules/buyer/routes/preferences.routes");
const paymentRoutes = require("./modules/buyer/routes/payment.routes");
const watchlistRoutes = require("./modules/buyer/routes/watchlist.routes");
const profileRoutes = require("./modules/seller/routes/profile.routes"); // Import seller profile routes
const surveyRoutes = require("./modules/survey/routes/survey.routes");
const userRoutes = require("./modules/users/routes/user.routes");
const authRoutes = require("./modules/auth/routes/auth.routes");
const reviewRoutes = require("./modules/buyer/routes/review.routes");

// // Socket handlers
//const initializeChatSockets = require("./modules/chats");

// Middleware
app.use(
  cors({
    origin: [
      "http://172.25.48.1:7000",
      "http://192.168.18.82:7000",
      "http://localhost:7000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(require(morgan)("dev"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/static", express.static("public/static"));
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/buyers/address", addressRoutes);
app.use("/api/buyers/cart", cartRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/buyers/feedback", feedbackRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/buyers/preferences", preferencesRoutes);
app.use("/api/buyers/payment", paymentRoutes);
app.use("/api/buyers/watchlist", watchlistRoutes);
app.use("/api/buyers/reviews", reviewRoutes);
app.use("/api/sellers/profile", profileRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/auth", authRoutes);

// Swagger API docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // Initialize sockets
//initializeChatSockets(io);

// Start auction scheduler
auctionScheduler.start();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
