const chatService = require('./services/chat.service');

module.exports = (io) => {
    const chatHandler = (socket) => {
        // When a user opens a chat window, they join a "room" for that conversation
        socket.on('join_conversation', ({ conversationId }) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
        });

        // When a new message is sent from the client
        socket.on('send_message', async (data) => {
            const { senderId, conversationId, content } = data;
            try {
                // 1. Use the existing service to save the message to the database
                const newMessage = await chatService.sendMessage(senderId, conversationId, content);

                // 2. Broadcast the new message to all clients in the conversation room
                io.to(conversationId).emit('receive_message', newMessage);

            } catch (error) {
                // Send an error back to the sender if something goes wrong
                socket.emit('chat_error', { message: error.message });
            }
        });

        // Handle typing indicators
        socket.on('typing', ({ conversationId, isTyping, userName }) => {
            // Broadcast to everyone in the room *except* the sender
            socket.to(conversationId).emit('user_typing', { userId: socket.id, isTyping, userName });
        });

        // When a user closes a chat window
        socket.on('leave_conversation', ({ conversationId }) => {
            socket.leave(conversationId);
            console.log(`Socket ${socket.id} left conversation room: ${conversationId}`);
        });

        socket.on('mark_messages_read', async ({ conversationId, userId }) => {
            try {
                await chatService.markMessagesRead(conversationId, userId);
                io.to(conversationId).emit('messages_marked_read', { conversationId, userId });
            } catch (error) {
                socket.emit('chat_error', { message: error.message });
            }
        });
    };

    io.on('connection', (socket) => {
        console.log(`A user connected for chat: ${socket.id}`);
        chatHandler(socket);

        socket.on('disconnect', () => {
            console.log(`User disconnected from chat: ${socket.id}`);
        });
    });
}; 