import { emitGameStateUpdate } from "../socket/socketManager.js";

// Update an existing function like dealCards:
export function dealCards(req: Request, res: Response): void {
  try {
    const { gameId } = req.body as GameActionRequest;
    const game = getGame(gameId);

    game.deal();
    game.updateActivity();

    const gameState = game.getGameState();

    // Emit the update to all clients in this game room
    emitGameStateUpdate(gameId, gameState);

    res.status(200).json({
      gameState: gameState,
    });
  } catch (error) {
    // Error handling...
  }
}

// Apply similar changes to hit(), stand(), newRound(), etc.
