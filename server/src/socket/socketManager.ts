import { Server, Socket } from "socket.io";
import { gameStore, GameType } from "../games/gameStore.js";
import { Blackjack } from "../games/blackjack.js";
import jwt from "jsonwebtoken";
import Player from "../models/userModel.js";

interface ServerToClientEvents {
  // Common events
  error: (message: string) => void;
  "game-state": (state: unknown) => void;
  "game-created": (data: { gameId: string }) => void;
  "join-success": (data: { gameId: string }) => void;
  "lobby-update": (
    data: {
      gameId: string;
      type: string;
      playerCount: number;
      joinable: boolean;
    }[]
  ) => void;

  // Blackjack specific events
  "blackjack-round-over": (winner: string | null) => void;
  "blackjack-game-over": (winner: string | null) => void;
}

interface ClientToServerEvents {
  // Common events
  "create-blackjack": (data: { playerName: string }) => void;
  "join-blackjack": (data: { gameId: string; playerName: string }) => void;
  "get-active-games": () => void;

  // Game specific events
  "start-blackjack": (data: { gameId: string }) => void;
  "blackjack-hit": (data: { gameId: string }) => void;
  "blackjack-stand": (data: { gameId: string }) => void;
  "blackjack-new-round": (data: { gameId: string }) => void;

  // Authentication (now optional)
  authenticate: (
    token: string,
    callback: (
      authenticated: boolean,
      user?: { id: number; username: string }
    ) => void
  ) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId?: number;
  username?: string;
  playerId?: string;
  currentGameId?: string;
  playerName?: string;
  isAuthenticated: boolean;
}

// Player-to-Socket mapping
const playerSocketMap = new Map<
  string,
  Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
>();

export function setupSocketServer(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) {
  // Run periodic cleanup of inactive games (every 15 minutes)
  const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes
  const MAX_INACTIVE_TIME = 60 * 60 * 1000; // 1 hour of inactivity

  setInterval(() => {
    gameStore.cleanupInactiveGames(MAX_INACTIVE_TIME);
  }, CLEANUP_INTERVAL);

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Initialize socket with unauthenticated status
    socket.data.isAuthenticated = false;
    socket.data.playerId = socket.id;

    // Handle get active games request (anonymous users can see available games)
    socket.on("get-active-games", () => {
      try {
        // Get all active games
        const allGames = Array.from(gameStore.getAllGames().entries());

        // Format for client
        const activeGames = allGames.map(([gameId, gameInfo]) => ({
          gameId,
          type: gameInfo.type,
          playerCount: gameStore.getPlayerCount(gameId),
          joinable:
            gameInfo.type === GameType.BLACKJACK
              ? gameStore.getPlayerCount(gameId) < 4
              : true, // Blackjack allows up to 4 players
        }));

        socket.emit("lobby-update", activeGames);
      } catch (error) {
        console.error("Error fetching active games:", error);
        socket.emit("error", "Failed to fetch active games");
      }
    });

    // Handle authentication (optional)
    socket.on("authenticate", async (token, callback) => {
      try {
        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
          id: number;
        };
        const user = await Player.findByPk(decoded.id);

        if (!user) {
          callback(false);
          return;
        }

        // Store user data in socket
        socket.data.userId = user.playerid;
        socket.data.username = user.username;
        socket.data.isAuthenticated = true;

        // Success
        callback(true, {
          id: user.playerid,
          username: user.username,
        });
      } catch (error) {
        console.error("Authentication error:", error);
        callback(false);
      }
    });

    // Handle Blackjack game creation
    socket.on("create-blackjack", (data) => {
      try {
        // Set player name (works for both authenticated and anonymous users)
        socket.data.playerName = data.playerName;

        // Create a new Blackjack game (initially for 4 players)
        const { gameId, game } = gameStore.createBlackjackGame(4);
        socket.data.currentGameId = gameId;

        // Add the player to the game
        game.addPlayer(socket.id, data.playerName);

        // Map player to game
        gameStore.addPlayerToGame(socket.id, gameId);
        playerSocketMap.set(socket.id, socket);

        // Join socket to a room with the game ID
        void socket.join(gameId);

        // Notify client of successful game creation
        socket.emit("game-created", { gameId });

        // Send initial game state
        socket.emit("game-state", game.getClientGameState());
      } catch (error) {
        console.error("Error creating game:", error);
        socket.emit("error", "Failed to create game. Please try again.");
      }
    });

    // Handle joining a Blackjack game
    socket.on("join-blackjack", (data) => {
      try {
        const { gameId, playerName } = data;

        // Check if game exists
        const gameInfo = gameStore.getGameWithType(gameId);
        if (!gameInfo) {
          socket.emit("error", "Game not found. Please check the game ID.");
          return;
        }

        // Check game type
        if (gameInfo.type !== GameType.BLACKJACK) {
          socket.emit(
            "error",
            "Invalid game type. This is not a Blackjack game."
          );
          return;
        }

        // Get the game
        const game = gameInfo.game as Blackjack;

        // Set player data
        socket.data.playerName = playerName;
        socket.data.currentGameId = gameId;

        // Add the player to the Blackjack game
        try {
          game.addPlayer(socket.id, playerName);
        } catch {
          socket.emit("error", "Game is full. Please try another game.");
          return;
        }

        // Map player to game
        gameStore.addPlayerToGame(socket.id, gameId);
        playerSocketMap.set(socket.id, socket);

        // Join socket to the game room
        void socket.join(gameId);

        // Notify of successful join
        socket.emit("join-success", { gameId });

        // Send current game state to the new player
        socket.emit("game-state", game.getClientGameState());

        // Update all other players
        socket.to(gameId).emit("game-state", game.getClientGameState());
      } catch (error) {
        console.error("Error joining game:", error);
        socket.emit("error", "Failed to join game. Please try again.");
      }
    });

    // Handle starting a Blackjack game
    socket.on("start-blackjack", (data) => {
      try {
        const { gameId } = data;

        const game = gameStore.getGame(gameId);
        if (game === undefined) {
          socket.emit("error", "Game not found.");
          return;
        }

        if (!(game instanceof Blackjack)) {
          socket.emit("error", "Game is not a Blackjack game.");
          return;
        }

        // Check if game is ready to start
        if (!game.isReadyToStart()) {
          socket.emit("error", "Game is not ready to start yet.");
          return;
        }

        // Deal cards to start the game
        game.deal();

        // Update all clients with new game state
        io.to(gameId).emit("game-state", game.getClientGameState());
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", "Failed to start game.");
      }
    });

    // Handle player hit action
    socket.on("blackjack-hit", (data) => {
      try {
        const { gameId } = data;
        const playerId = socket.id;

        const game = gameStore.getGame(gameId);
        if (game === undefined) {
          socket.emit("error", "Game not found.");
          return;
        }

        if (!(game instanceof Blackjack)) {
          socket.emit("error", "Game is not a Blackjack game.");
          return;
        }

        // Check if player can hit
        if (!game.canHit(playerId)) {
          socket.emit("error", "You cannot hit right now.");
          return;
        }

        // Find player index in the game
        const playerIndex = game.getPlayerIndex(playerId);

        // Execute hit action
        game.hit(playerIndex);

        // Update all clients with new game state
        io.to(gameId).emit("game-state", game.getClientGameState());

        // If game is complete, emit the round over event
        const clientState = game.getClientGameState();
        if (clientState.gameStatus === "roundOver") {
          io.to(gameId).emit("blackjack-round-over", clientState.winner);
        }
      } catch (error) {
        console.error("Error processing hit:", error);
        socket.emit(
          "error",
          "Failed to hit. " + (error instanceof Error ? error.message : "")
        );
      }
    });

    // Handle player stand action
    socket.on("blackjack-stand", (data) => {
      try {
        const { gameId } = data;
        const playerId = socket.id;

        const game = gameStore.getGame(gameId);
        if (!game) {
          socket.emit("error", "Game not found.");
          return;
        }

        if (!(game instanceof Blackjack)) {
          socket.emit("error", "Game is not a Blackjack game.");
          return;
        }

        // Check if player can stand
        if (!game.canStand(playerId)) {
          socket.emit("error", "You cannot stand right now.");
          return;
        }

        // Find player index in the game
        const playerIndex = game.getPlayerIndex(playerId);

        // Execute stand action
        game.stand(playerIndex);

        // Update all clients with new game state
        io.to(gameId).emit("game-state", game.getClientGameState());

        // If game is complete, emit the round over event
        const clientState = game.getClientGameState();
        if (clientState.gameStatus === "roundOver") {
          io.to(gameId).emit("blackjack-round-over", clientState.winner);
        }
      } catch (error) {
        console.error("Error processing stand:", error);
        socket.emit(
          "error",
          "Failed to stand. " + (error instanceof Error ? error.message : "")
        );
      }
    });

    // Handle new round request
    socket.on("blackjack-new-round", (data) => {
      try {
        const { gameId } = data;
        const game = gameStore.getGame(gameId);

        if (!game) {
          socket.emit("error", "Game not found.");
          return;
        }

        if (!(game instanceof Blackjack)) {
          socket.emit("error", "Game is not a Blackjack game.");
          return;
        }

        // Start a new round
        game.newRound();
        game.deal();

        // Update all clients with new game state
        io.to(gameId).emit("game-state", game.getClientGameState());
      } catch (error) {
        console.error("Error starting new round:", error);
        socket.emit("error", "Failed to start new round.");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      const playerId = socket.id;
      const gameId = socket.data.currentGameId;

      if (gameId) {
        try {
          const game = gameStore.getGame(gameId);
          if (game) {
            // Remove player from the game
            game.removePlayer(playerId);

            // Notify remaining players
            socket.to(gameId).emit("game-state", game.getClientGameState());

            // If the game is now empty, remove it
            if (game.getPlayerCount() === 0) {
              gameStore.removeGame(gameId);
            }
          }
        } catch (error) {
          console.error("Error handling player disconnect:", error);
        }

        // Clean up player-game association
        gameStore.removePlayer(playerId);
      }

      // Remove from player-socket map
      playerSocketMap.delete(playerId);
    });
  });
}
