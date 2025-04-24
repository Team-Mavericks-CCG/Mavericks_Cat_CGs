import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import { setupSocketServer } from "./socket/socketManager.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define socket event types in socketManager.ts

const app = express();
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(app);
const PORT = (process.env.PORT ?? 5000).toString();

// Create socket.io server with CORS configured
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Set up socket handling
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
setupSocketServer(io);

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO accepting connections`);
});
