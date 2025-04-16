import { Server, Socket } from "socket.io";
import { gameStore, GameType, isValidGameType } from "../games/gameStore.js";
import { Blackjack } from "../games/blackjack.js";
import jwt from "jsonwebtoken";
import Player from "../models/userModel.js";
import { Game, GameStatus } from "../games/game.js";
import crypto from "crypto";

interface ServerToClientEvents {
  // Common events
  error: (message: string) => void;
  "game-started": (state: unknown) => void;
  "game-state": (state: unknown) => void;
  "lobby-created": (data: { gameID: string; inviteCode: string }) => void;
  "join-success": (data: { gameID: string }) => void;
  "lobby-update": (data: { players: string[] }) => void;
  "lobby-list": (
    data: {
      gameID: string;
      type: string;
      playerCount: number;
      joinable: boolean;
    }[]
  ) => void;
  "game-over": (winner: string | null) => void;
}

interface ClientToServerEvents {
  "create-lobby": (data: { playerName: string; gameType: string }) => void;
  "join-lobby": (data: { inviteCode: string; playerName: string }) => void;
  "get-active-games": () => void;
  "start-game": (data: { gameID: string }) => void;
  "new-round": (data: { gameID: string }) => void;
  "leave-game": (data: { gameID: string }) => void;
  // generic action event for all games and actions, individual games can handle their own actions
  "game-action": (data: { gameID: string; action: string }) => void;

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
  playerID?: string;
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

// Invite code to game ID mapping
const inviteCodeMap = new Map<string, string>();

function generateInviteCode(): string {
  // Get current timestamp + random number
  const now = Date.now();
  const randomBytes = crypto.randomBytes(4).toString("hex");

  // Create a hash from timestamp + random data
  const combined = `${now.toString()}-${randomBytes}-${Math.random().toString()}`;
  const hash = crypto.createHash("sha256").update(combined).digest("hex");

  // Extract 6 characters from the hash (uppercase alphanumeric only)
  let code = "";
  const allowedChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omitting confusing chars

  // Pick characters from different parts of the hash for better distribution
  for (let i = 0; i < 6; i++) {
    const hexPair = hash.substring(i * 2, i * 2 + 2);
    const value = parseInt(hexPair, 16);
    const index = value % allowedChars.length;
    code += allowedChars.charAt(index);
  }

  return code;
}

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
    socket.data.playerID = socket.id;

    // Handle get active games request (anonymous users can see available games)
    socket.on("get-active-games", () => {
      try {
        // Get all active games
        const allGames = Array.from(gameStore.getAllGames().entries());

        // get max player count for this game type
        const gameTypeMaxPlayers = {
          [GameType.BLACKJACK]: Blackjack.MAX_PLAYERS,
          // Add other game types here
        };

        // Format for client
        const activeGames = allGames.map(([gameID, gameInfo]) => ({
          gameID,
          type: gameInfo.type,
          playerCount: gameInfo.game.getPlayerCount(),
          joinable:
            gameInfo.type === GameType.BLACKJACK
              ? gameInfo.game.getPlayerCount() <
                gameTypeMaxPlayers[gameInfo.type]
              : true, // Blackjack allows up to 4 players
        }));

        socket.emit("lobby-list", activeGames);
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

    // TODO: handle lobby separate from game
    socket.on("create-lobby", (data) => {
      try {
        // Set player name (works for both authenticated and anonymous users)
        socket.data.playerName = data.playerName;

        if (!data.gameType) {
          socket.emit("error", "Game type is required.");
          return;
        }

        if (!isValidGameType(data.gameType)) {
          socket.emit("error", "Unsupported game type.");
          return;
        }

        let gameID: string;
        let game: Game;
        switch (data.gameType) {
          case GameType.BLACKJACK: {
            // Create a Blackjack game
            const result = gameStore.createGame(
              GameType.BLACKJACK,
              (gameID: string) => gameStore.createBlackjackGame(gameID)
            );
            gameID = result.gameID;
            game = result.game;
            break;
          }
          // Add cases for other game types as needed
          default: {
            socket.emit("error", "Unsupported game type.");
            return;
          }
        }

        socket.data.currentGameId = gameID;
        let inviteCode = generateInviteCode();
        while (inviteCodeMap.has(inviteCode)) {
          inviteCode = generateInviteCode(); // Regenerate if already exists
        }
        inviteCodeMap.set(inviteCode, gameID);

        // Add the player to the game
        game.addPlayer(socket.id, data.playerName);

        playerSocketMap.set(socket.id, socket);

        // Join socket to a room with the game ID
        void socket.join(gameID);

        // Notify client of successful game creation
        socket.emit("lobby-created", { gameID, inviteCode });
      } catch (error) {
        console.error("Error creating game:", error);
        socket.emit("error", "Failed to create game. Please try again.");
      }
    });

    // TODO: handle join game
    socket.on("join-lobby", (data) => {
      try {
        console.log("Join lobby data:", data);
        const { inviteCode, playerName } = data;

        const gameID = inviteCodeMap.get(inviteCode);
        if (!gameID) {
          socket.emit("error", "Invalid invite code. Please check the code.");
          return;
        }

        // Check if game exists
        const gameInfo = gameStore.getGameWithType(gameID);
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
        socket.data.currentGameId = gameID;

        // Add the player to the game
        try {
          game.addPlayer(socket.id, playerName);
        } catch {
          socket.emit("error", "Game is full. Please try another game.");
          return;
        }

        playerSocketMap.set(socket.id, socket);

        // Join socket to the game room
        void socket.join(gameID);

        console.log(
          `Player ${playerName} joined game ${gameID} with socket ID ${socket.id}`
        );

        // print all the sockets in the room
        const socketsInRoom = io.sockets.adapter.rooms.get(gameID);
        console.log(
          `Sockets in room ${gameID}: ${Array.from(socketsInRoom ?? []).join(", ")}`
        );

        // Notify of successful join
        socket.emit("join-success", { gameID });

        // Send current game state to the new player
        socket.emit("game-state", game.getClientGameState());
        socket.emit("lobby-update", {
          players: Array.from(game.players.keys()),
        });

        // Update all other players
        socket.to(gameID).emit("game-state", game.getClientGameState());
      } catch (error) {
        console.error("Error joining game:", error);
        socket.emit("error", "Failed to join game. Please try again.");
      }
    });

    // TODO: handle starting game
    socket.on("start-game", (data) => {
      try {
        const { gameID } = data;

        const game = gameStore.getGame(gameID);
        if (game === undefined) {
          socket.emit("error", "Game not found.");
          return;
        }

        if (!(game instanceof Blackjack)) {
          socket.emit("error", "Game is not a Blackjack game.");
          return;
        }

        // Check if game is ready to start
        if (game.getStatus() !== GameStatus.READY) {
          socket.emit("error", "Game is not ready to start yet.");
          return;
        }

        // Deal cards to start the game
        game.deal();

        // Update all clients with new game state
        io.to(gameID).emit("game-started", game.getClientGameState());
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", "Failed to start game.");
      }
    });

    socket.on("game-action", (data) => {
      try {
        const { gameID, action } = data;
        const playerID = socket.id;

        const game = gameStore.getGame(gameID);
        if (game === undefined) {
          socket.emit("error", "Game not found.");
          return;
        }
        game.handleAction(playerID, action);
        io.to(gameID).emit("game-state", game.getClientGameState());
      } catch (error) {
        console.error("Error processing game action:", error);
        socket.emit("error", "Failed to process game action.");
      }
    });

    // TODO: implement new round
    socket.on("new-round", (data) => {
      try {
        const { gameID } = data;
        const game = gameStore.getGame(gameID);

        if (!game) {
          socket.emit("error", "Game not found.");
          return;
        }

        if (game.getStatus() !== GameStatus.FINISHED) {
          socket.emit("error", "Game is not finished yet.");
          return;
        }

        // Start a new round
        game.newGame();

        // Update all clients with new game state
        io.to(gameID).emit("game-state", game.getClientGameState());
      } catch (error) {
        console.error("Error starting new round:", error);
        socket.emit("error", "Failed to start new round.");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      const playerID = socket.id;
      const gameID = socket.data.currentGameId;

      if (gameID) {
        try {
          const game = gameStore.getGame(gameID);
          if (game) {
            // Remove player from the game
            game.removePlayer(playerID);

            // Notify remaining players
            socket.to(gameID).emit("game-state", game.getClientGameState());

            // If the game is now empty, remove it
            if (game.getPlayerCount() === 0) {
              gameStore.removeGame(gameID);
            }
          }
        } catch (error) {
          console.error("Error handling player disconnect:", error);
        }
      }

      // Remove from player-socket map
      playerSocketMap.delete(playerID);
    });
  });
}
