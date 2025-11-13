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
    origin: [
      "https://moqtanayati-client-q6oc.vercel.app",
      "http://localhost:7000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

global.io = io;

// User room join/leave for realtime events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // orders events
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

  // Chat events
  socket.on("join_conversation", ({ conversationId }) => {
    if (!conversationId) {
      console.error("No conversationId provided for join_conversation");
      socket.emit("chat_error", { message: "conversationId is required" });
      return;
    }
    socket.join(conversationId);
    console.log(
      `Socket ${socket.id} joined conversation room: ${conversationId}`
    );
    console.log(
      `Current rooms for socket ${socket.id}:`,
      Array.from(socket.rooms)
    );
  });

  socket.on("send_message", async (data) => {
    console.log("🎯 Socket 'send_message' event received!");
    console.log("📦 Data received:", JSON.stringify(data, null, 2));

    const { senderId, conversationId, content, userBId, productId } = data;

    if (!senderId || !conversationId || !content) {
      console.error("❌ Missing required fields:", {
        senderId,
        conversationId,
        content,
      });
      socket.emit("chat_error", { message: "Missing required fields" });
      return;
    }

    console.log("✅ All required fields present");
    console.log("🔍 Processing message:", {
      senderId,
      conversationId,
      content,
      userBId,
      productId,
    });

    try {
      // Import chat service
      const chatService = require("./modules/chats/services/chat.service");

      // 1. Use the existing service to save the message to the database
      console.log("💾 Saving message to database...");
      const newMessage = await chatService.sendMessage(
        senderId,
        userBId,
        content,
        conversationId,
        productId || null
      );
      console.log("✅ Message saved to database:", newMessage);

      // 2. Broadcast the new message to all clients in the conversation room
      console.log(`📡 Broadcasting message to room: ${conversationId}`);
      io.to(conversationId).emit("receive_message", newMessage);
      console.log(`✅ Message broadcasted to room: ${conversationId}`);
    } catch (error) {
      console.error("❌ Error in socket send_message:", error);
      // Send an error back to the sender if something goes wrong
      socket.emit("chat_error", { message: error.message });
    }
  });

  socket.on("typing", ({ conversationId, isTyping, userName }) => {
    // Broadcast to everyone in the room *except* the sender
    socket
      .to(conversationId)
      .emit("user_typing", { userId: socket.id, isTyping, userName });
  });

  socket.on("leave_conversation", ({ conversationId }) => {
    socket.leave(conversationId);
    console.log(
      `Socket ${socket.id} left conversation room: ${conversationId}`
    );
  });

  socket.on("mark_messages_read", async ({ conversationId, userId }) => {
    try {
      const chatService = require("./modules/chats/services/chat.service");
      await chatService.markMessagesRead(conversationId, userId);
      io.to(conversationId).emit("messages_marked_read", {
        conversationId,
        userId,
      });
    } catch (error) {
      socket.emit("chat_error", { message: error.message });
    }
  });

  // Get user's conversations
  socket.on("get_conversations", async (data) => {
    console.log("📋 Getting conversations for user:", data);
    const { userId } = data;

    if (!userId) {
      socket.emit("chat_error", { message: "userId is required" });
      return;
    }

    try {
      const chatService = require("./modules/chats/services/chat.service");
      const conversations = await chatService.getConversations(userId);
      console.log("✅ Conversations retrieved:", conversations.length);

      socket.emit("conversations_list", conversations);
    } catch (error) {
      console.error("❌ Error getting conversations:", error);
      socket.emit("chat_error", { message: error.message });
    }
  });

  // Create new chat
  socket.on("create_chat", async (data) => {
    console.log("💬 Creating new chat:", data);
    const { userAId, userBId } = data;

    if (!userAId || !userBId) {
      socket.emit("chat_error", {
        message: "userAId and userBId are required",
      });
      return;
    }

    try {
      const chatService = require("./modules/chats/services/chat.service");
      const chat = await chatService.createChat(userAId, userBId);
      console.log("✅ Chat created:", chat);

      // Notify both users about the new chat
      socket.emit("chat_created", chat);
      io.to(`user:${userBId}`).emit("new_chat_available", chat);
    } catch (error) {
      console.error("❌ Error creating chat:", error);
      socket.emit("chat_error", { message: error.message });
    }
  });

  // Test event for debugging
  socket.on("test_event", (data) => {
    console.log("🧪 Test event received:", data);
    socket.emit("test_response", { message: "Test successful!" });
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
const buyerQARoutes = require("./modules/buyer/routes/product-qa.routes");
const sellerQARoutes = require("./modules/seller/routes/product-qa.routes");
const { authMiddleware } = require("./middlewares/auth.middleware");

// Socket handlers - Chat events are now integrated above

// Middleware
app.use(
  cors({
    origin: [
      "http://172.25.48.1:7000",
      "http://192.168.18.82:7000",
      "http://localhost:7000",
      "https://moqtanayati-client-q6oc.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
app.use("/api/buyers", buyerQARoutes);
app.use("/api/sellers", sellerQARoutes);
app.use("/api/sellers/profile", profileRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/auth", authRoutes);

// Swagger API docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Chat sockets are now integrated in the main connection handler above

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
