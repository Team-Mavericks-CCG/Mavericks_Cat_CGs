import { Request, Response } from "express";
import { gameStore, GameType } from "../games/gameStore.js";
import { Blackjack } from "../games/blackjack.js";

// Get information about active blackjack games
export const getBlackjackGames = (req: Request, res: Response): void => {
  try {
    // Get all active games
    const allGames = Array.from(gameStore.getAllGames().entries());

    // Filter to just blackjack games
    const blackjackGames = allGames
      .filter(([, gameInfo]) => gameInfo.type === GameType.BLACKJACK)
      .map(([gameId]) => ({
        gameId,
        playerCount: gameStore.getPlayerCount(gameId),
        joinable: gameStore.getPlayerCount(gameId) < 4, // Blackjack allows up to 4 players
      }));

    res.status(200).json(blackjackGames);
  } catch (error) {
    console.error("Error fetching blackjack games:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new blackjack game via REST API (less common approach)
export const createBlackjackGame = (req: Request, res: Response): void => {
  try {
    // Create new game with 4 player slots
    const { gameId } = gameStore.createBlackjackGame(4);

    // Return game ID for client to use in socket connection
    res.status(201).json({
      gameId,
      message: "Game created successfully",
    });
  } catch (error) {
    console.error("Error creating blackjack game:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get detailed information for a specific blackjack game
export const getBlackjackGameDetails = (req: Request, res: Response): void => {
  try {
    const { gameId } = req.params;

    // Get game from store
    const gameInfo = gameStore.getGameWithType(gameId);

    if (!gameInfo) {
      res.status(404).json({ message: "Game not found" });
      return;
    }

    if (gameInfo.type !== GameType.BLACKJACK) {
      res.status(400).json({ message: "Not a blackjack game" });
      return;
    }

    const game = gameInfo.game as Blackjack;

    // Get player info
    const players = gameStore.getGamePlayers(gameId);

    // Return game details
    res.status(200).json({
      gameId,
      playerCount: players.length,
      maxPlayers: 4,
      joinable: players.length < 4,
      status: game.getGameState().status,
    });
  } catch (error) {
    console.error(
      `Error getting blackjack game details for ${req.params.gameId}:`,
      error
    );
    res.status(500).json({ message: "Server error" });
  }
};
