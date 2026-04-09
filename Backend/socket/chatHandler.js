export const handleChatEvents = (io, socket) => {
  // Join a session room
  socket.on("join_session", (sessionId) => {
    socket.join(sessionId);
    console.log(`${socket.id} joined session: ${sessionId}`);
  });

  // Send a message in a session room
  socket.on("send_message", ({ sessionId, senderId, message }) => {
    io.to(sessionId).emit("receive_message", {
      senderId,
      message,
      timestamp: new Date(),
    });
  });

  // Typing indicator
  socket.on("typing", ({ sessionId, userId }) => {
    socket.to(sessionId).emit("user_typing", { userId });
  });
};
