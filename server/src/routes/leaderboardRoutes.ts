import { Router } from "express";
import {
  saveGameStats,
  getGameStats,
} from "../controllers/leaderboardController.js";
import { verifyToken } from "../middleware/auth.js";

// routes are appended to the default /api/auth route
// e.g. /api/auth/login
const router = Router();

// Route for saving game stats
router.post("/save-stats", verifyToken, saveGameStats);

// Route for getting game stats
router.get("/get-stats", getGameStats);

export default router;
