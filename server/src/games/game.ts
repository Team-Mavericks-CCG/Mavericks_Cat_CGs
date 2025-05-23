import { ClientGameState, GameStatus } from "shared";
import { setTimeout, clearTimeout } from "timers";

export abstract class Game {
  // default max players for all games, can be overridden in subclasses
  public static MAX_PLAYERS = 4;
  // for deleting games after inactivity
  lastActivityTime: number;
  // for referencing players
  players: Map<string, string>;
  // The player ID of the player whose turn it is
  // null if it's not a turn-based game or no turn is active
  activePlayer: string | null = null;
  protected gameId: string;
  protected hostID: string;
  protected status: GameStatus = GameStatus.READY;
  protected disconnectedPlayers: Map<string, NodeJS.Timeout> = new Map<
    string,
    NodeJS.Timeout
  >();
  protected disconnectTimeout = 1 * 60 * 1000; // 1 minute

  constructor(gameId: string, hostID: string, playerName: string) {
    this.hostID = hostID;
    this.lastActivityTime = Date.now();
    this.gameId = gameId;
    this.players = new Map<string, string>();
    this.addPlayer(hostID, playerName);
  }

  // Common implementation for all games
  updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  getGameId(): string {
    return this.gameId;
  }

  setGameId(gameId: string): void {
    this.gameId = gameId;
  }

  getHost(): string {
    return this.hostID;
  }

  getPlayerCount(): number {
    return this.players.size;
  }

  removePlayer(playerId: string): void {
    if (!this.players.has(playerId)) {
      throw new Error("Player not found in the game.");
    }

    if (this.disconnectedPlayers.has(playerId)) {
      this.clearDisconnectionTimer(playerId);
    }

    this.players.delete(playerId);

    if (playerId === this.hostID) {
      this.hostID = Array.from(this.players.keys())[0]; // Set a new host if the current host leaves
    }
  }

  addPlayer(playerId: string, playerName: string): void {
    console.log(
      `Adding player ${playerId} (${playerName}) to game ${this.gameId}`
    );
    if (this.players.has(playerId)) {
      console.log(
        `Player ${playerId} (${playerName}) already exists in game ${this.gameId}`
      );
      throw new Error("Player already exists in the game.");
    }
    this.players.set(playerId, playerName);
  }

  markPlayerDisconnected(playerId: string): void {
    if (!this.players.has(playerId)) {
      throw new Error("Player not found in the game.");
    }
    const timer = setTimeout(() => {
      console.log(
        `Player ${playerId} has been disconnected for too long. Removing from game.`
      );

      try {
        this.removePlayer(playerId);
        this.disconnectedPlayers.delete(playerId);
      } catch (error) {
        console.error(
          `Error auto-removing disconnected player ${playerId}:`,
          error
        );
      }
    }, this.disconnectTimeout);
    this.disconnectedPlayers.set(playerId, timer);

    console.log(
      `Player ${playerId} disconnected. Will be removed in ${(this.disconnectTimeout / 1000).toString()} seconds if not reconnected.`
    );
  }

  markPlayerReconnected(playerId: string): void {
    if (!this.players.has(playerId)) {
      throw new Error("Player not found in the game.");
    }
    const timer = this.disconnectedPlayers.get(playerId);
    if (timer) {
      this.clearDisconnectionTimer(playerId);
      console.log(`Player ${playerId} reconnected. Timer cleared.`);
    } else {
      console.log(`Player ${playerId} was not marked as disconnected.`);
    }
  }

  private clearDisconnectionTimer(playerId: string): void {
    const timer = this.disconnectedPlayers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectedPlayers.delete(playerId);
    }
  }

  // Get the player ID of the next active player
  getNextPlayer(reverse = false): { wrapped: boolean } {
    const playerKeys = Array.from(this.players.keys());
    if (!this.activePlayer) {
      this.activePlayer = playerKeys[0]; // Set the first player as active if no active player
      return { wrapped: false };
    }
    const currentIndex = playerKeys.indexOf(this.activePlayer);
    const nextIndex =
      (reverse ? currentIndex - 1 : currentIndex + 1) % playerKeys.length;
    this.activePlayer = playerKeys[nextIndex]; // Update active player
    return { wrapped: nextIndex === 0 };
  }

  getStatus(): GameStatus {
    return this.status;
  }

  // Abstract methods that must be implemented by subclasses
  abstract getClientGameState(): ClientGameState;
  abstract handleAction(playerId: string, action: string): unknown;
  abstract startGame(): void;
  abstract newGame(): void;
}
