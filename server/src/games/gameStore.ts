import { Game } from "./game.js";
import { Blackjack } from "./blackjack.js";
import { v4 } from "uuid";

// Define game types
export enum GameType {
  BLACKJACK = "Blackjack",
  // Add other game types as you create them
  POKER = "Poker",
  WAR = "War",
}

// Store game instance with its type
interface GameInfo {
  game: Game;
  type: GameType;
}

export const isValidGameType = (gameType: string): gameType is GameType => {
  return Object.values(GameType).includes(gameType as GameType);
};

// Invite code to game ID mapping
export const inviteCodeMap = new Map<string, string>();

// Store all active games with their IDs
const activeGames = new Map<string, GameInfo>();

// Store player-to-game mappings
const playerGameMap = new Map<string, string>();

export const gameStore = {
  // Generic game creation with type discrimination
  createGame<T extends Game>(
    gameType: GameType,
    createFn: (gameID: string) => T
  ): { gameID: string; game: T } {
    const gameID = v4();
    const game = createFn(gameID);
    activeGames.set(gameID, { game, type: gameType });
    return { gameID, game };
  },

  // Factory methods for specific game types
  createBlackjackGame(
    gameID: string,
    hostID: string,
    playerName: string
  ): Blackjack {
    return new Blackjack(gameID, hostID, playerName);
  },

  // Add similar methods for other game types
  // createPokerGame(...) { ... }

  // Get game with type safety
  getGame(gameID: string): Game | undefined {
    const gameInfo = activeGames.get(gameID);
    return gameInfo ? gameInfo.game : undefined;
  },

  // Get game with type information
  getGameWithType(gameID: string): { game: Game; type: GameType } | undefined {
    return activeGames.get(gameID);
  },

  // Get game type
  getGameType(gameID: string): GameType | undefined {
    return activeGames.get(gameID)?.type;
  },

  removeGame(gameID: string): boolean {
    return activeGames.delete(gameID);
  },

  // Get all active games
  getAllGames(): Map<string, GameInfo> {
    return activeGames;
  },

  // Clean up inactive games (call periodically)
  cleanupInactiveGames(maxAgeMs: number): void {
    const now = Date.now();
    for (const [gameID, gameInfo] of activeGames.entries()) {
      if (now - gameInfo.game.lastActivityTime > maxAgeMs) {
        activeGames.delete(gameID);
        // Also remove player mappings for this game
        for (const [playerID, mappedGameId] of playerGameMap.entries()) {
          if (mappedGameId === gameID) {
            playerGameMap.delete(playerID);
          }
        }
      }
    }
  },
};
