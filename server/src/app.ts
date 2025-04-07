import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initSocketIO } from "./socket/socketManager.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = createServer(app);
const PORT = (process.env.PORT ?? 5000).toString();

initSocketIO(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes, default route is /api/auth
app.use("/api/auth", authRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
