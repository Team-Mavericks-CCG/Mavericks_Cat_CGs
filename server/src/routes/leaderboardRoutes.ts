import { Router } from "express";
import { saveGameStats } from "../controllers/leaderboardController.js";
import { verifyToken } from "../middleware/auth.js";

// routes are appended to the default /api/auth route
// e.g. /api/auth/login
const router = Router();

router.post("/save-stats", verifyToken, saveGameStats);

export default router;
