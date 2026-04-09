import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import feasibilityRoutes from "./routes/feasibilityRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import { handleChatEvents } from "./socket/chatHandler.js";

connectDB();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO for real-time mentorship chat
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/feasibility", feasibilityRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/chat", chatRoutes);

// Basic Health Check Route
app.get("/", (req, res) => {
  res.send("Startup Sensai API is running...");
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  handleChatEvents(io, socket);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
