const chatService = require("./services/chat.service");

module.exports = (io) => {
  const chatHandler = (socket) => {
    // When a user opens a chat window, they join a "room" for that conversation
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

    // When a new message is sent from the client
    socket.on("send_message", async (data) => {
      console.log("🎯 Socket 'send_message' event received!");
      console.log("📦 Data received:", JSON.stringify(data, null, 2));

      const { senderId, conversationId, content, userBId } = data;

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
      });

      try {
        // 1. Use the existing service to save the message to the database
        console.log("💾 Saving message to database...");
        const newMessage = await chatService.sendMessage(
          senderId,
          userBId,
          content,
          conversationId
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

    // Handle typing indicators
    socket.on("typing", ({ conversationId, isTyping, userName }) => {
      // Broadcast to everyone in the room *except* the sender
      socket
        .to(conversationId)
        .emit("user_typing", { userId: socket.id, isTyping, userName });
    });

    // When a user closes a chat window
    socket.on("leave_conversation", ({ conversationId }) => {
      socket.leave(conversationId);
      console.log(
        `Socket ${socket.id} left conversation room: ${conversationId}`
      );
    });

    socket.on("mark_messages_read", async ({ conversationId, userId }) => {
      try {
        await chatService.markMessagesRead(conversationId, userId);
        io.to(conversationId).emit("messages_marked_read", {
          conversationId,
          userId,
        });
      } catch (error) {
        socket.emit("chat_error", { message: error.message });
      }
    });
  };

  io.on("connection", (socket) => {
    console.log(`✅ A user connected for chat: ${socket.id}`);
    console.log(`📊 Total connected sockets: ${io.engine.clientsCount}`);

    // Add a test event listener to see if socket is working
    socket.on("test_event", (data) => {
      console.log("🧪 Test event received:", data);
      socket.emit("test_response", { message: "Test successful!" });
    });

    chatHandler(socket);

    socket.on("disconnect", (reason) => {
      console.log(
        `❌ User disconnected from chat: ${socket.id}, reason: ${reason}`
      );
    });
  });
};
