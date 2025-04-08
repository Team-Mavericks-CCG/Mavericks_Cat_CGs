import { Game } from "./game.js";
import { Blackjack } from "./blackjack.js";
import { v4 } from "uuid";

// Define game types
export enum GameType {
  BLACKJACK = "blackjack",
  // Add other game types as you create them
  POKER = "poker",
  SOLITAIRE = "solitaire",
}

// Store game instance with its type
interface GameInfo {
  game: Game;
  type: GameType;
}

// Store all active games with their IDs
const activeGames = new Map<string, GameInfo>();

// Store player-to-game mappings
const playerGameMap = new Map<string, string>();

export const gameStore = {
  // Generic game creation with type discrimination
  createGame<T extends Game>(
    gameType: GameType,
    createFn: () => T
  ): { gameId: string; game: T } {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const gameId = v4() as string;
    const game = createFn();
    activeGames.set(gameId, { game, type: gameType });
    return { gameId, game };
  },

  // Factory methods for specific game types
  createBlackjackGame(numPlayers: number): { gameId: string; game: Blackjack } {
    const result = this.createGame(
      GameType.BLACKJACK,
      () => new Blackjack(numPlayers)
    );
    // Set the game ID explicitly on the Blackjack instance
    result.game.setGameId(result.gameId);
    // Initialize the game state by dealing cards
    result.game.deal();
    return result;
  },

  // Add similar methods for other game types
  // createPokerGame(...) { ... }

  // Get game with type safety
  getGame(gameId: string): Game | undefined {
    const gameInfo = activeGames.get(gameId);
    return gameInfo ? gameInfo.game : undefined;
  },

  // Get game with type information
  getGameWithType(gameId: string): { game: Game; type: GameType } | undefined {
    return activeGames.get(gameId);
  },

  // Get game type
  getGameType(gameId: string): GameType | undefined {
    return activeGames.get(gameId)?.type;
  },

  removeGame(gameId: string): boolean {
    return activeGames.delete(gameId);
  },

  // Associate a player with a game
  addPlayerToGame(playerId: string, gameId: string): void {
    playerGameMap.set(playerId, gameId);
  },

  // Get a player's game with generic return type
  getPlayerGame(playerId: string): Game | undefined {
    const gameId = playerGameMap.get(playerId);
    if (!gameId) return undefined;
    return this.getGame(gameId);
  },

  // Remove a player from game mapping
  removePlayer(playerId: string): void {
    playerGameMap.delete(playerId);
  },

  // Get all active games
  getAllGames(): Map<string, GameInfo> {
    return activeGames;
  },

  // Get player count for a specific game
  getPlayerCount(gameId: string): number {
    let count = 0;
    for (const [, mappedGameId] of playerGameMap.entries()) {
      if (mappedGameId === gameId) {
        count++;
      }
    }
    return count;
  },

  // Get all players in a game
  getGamePlayers(gameId: string): string[] {
    const players: string[] = [];
    for (const [playerId, mappedGameId] of playerGameMap.entries()) {
      if (mappedGameId === gameId) {
        players.push(playerId);
      }
    }
    return players;
  },

  // Clean up inactive games (call periodically)
  cleanupInactiveGames(maxAgeMs: number): void {
    const now = Date.now();
    for (const [gameId, gameInfo] of activeGames.entries()) {
      if (now - gameInfo.game.lastActivityTime > maxAgeMs) {
        activeGames.delete(gameId);
        // Also remove player mappings for this game
        for (const [playerId, mappedGameId] of playerGameMap.entries()) {
          if (mappedGameId === gameId) {
            playerGameMap.delete(playerId);
          }
        }
      }
    }
  },
};
