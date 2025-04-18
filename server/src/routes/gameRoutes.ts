import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { gameStore } from "../games/gameStore.js";
import {
  getBlackjackGames,
  createBlackjackGame,
  getBlackjackGameDetails,
} from "../controllers/blackjackController.js";

const router = Router();

// Get list of active games (requires authentication)
router.get("/active", auth, (req, res): void => {
  try {
    // Get all active game IDs and types
    const activeGames = Array.from(gameStore.getAllGames()).map(
      ([gameId, gameInfo]) => ({
        gameId,
        type: gameInfo.type,
        playerCount: gameInfo.game.getPlayerCount(),
      })
    );

    res.status(200).json(activeGames);
  } catch (error) {
    console.error("Error fetching active games:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Blackjack specific routes
router.get("/blackjack", auth, getBlackjackGames);
router.post("/blackjack", auth, createBlackjackGame);
router.get("/blackjack/:gameId", auth, getBlackjackGameDetails);

// Get specific game info (requires authentication)
router.get("/:gameId", auth, (req, res): void => {
  try {
    const { gameId } = req.params;
    const gameInfo = gameStore.getGameWithType(gameId);

    if (!gameInfo) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    res.status(200).json({
      gameId,
      type: gameInfo.type,
      playerCount: gameInfo.game.getPlayerCount(),
    });
  } catch (error) {
    console.error(`Error fetching game info for ${req.params.gameId}:`, error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
