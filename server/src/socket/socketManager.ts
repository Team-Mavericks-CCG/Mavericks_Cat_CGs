import { Server, Socket } from "socket.io";
import {
  gameStore,
  isValidGameType,
  inviteCodeMap,
} from "../games/gameStore.js";
import { Blackjack } from "../games/blackjack.js";
import jwt from "jsonwebtoken";
import PlayerModel from "../models/userModel.js";
import { Game } from "../games/game.js";
import crypto from "crypto";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  Player,
  GameStatus,
  GameType,
} from "shared";
import { v4 as uuidv4 } from "uuid";

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId?: number;
  username?: string;
  playerID: string;
  gameID: string;
  playerName?: string;
  isAuthenticated: boolean;
}

// playerID-to-Socket mapping
const playerSocketMap = new Map<
  string,
  Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
>();

// map socket ID to player socket
const socketPlayerMap = new Map<
  string,
  Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
>();

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
// function for getting players in a game
function getPlayersInGame(game: Game): { players: Player[] } {
  return {
    players: Array.from(game.players.values()).map((playerName) => ({
      name: playerName,
    })),
  };
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

    socket.on("register-session", (data) => {
      // no sessionID means new session, not trying to reconnect
      // if sessionID isnt in the map, also new session
      if (!data.sessionID || !playerSocketMap.has(data.sessionID)) {
        if (data.sessionID) {
          console.log(
            `Session ID ${data.sessionID} not found in [${Array.from(playerSocketMap.keys()).join(", ")}]. Creating new session.`
          );
        }
        socket.data.playerID = uuidv4();
        socketPlayerMap.set(socket.id, socket);
        playerSocketMap.set(socket.data.playerID, socket);
        socket.emit("session-registered", socket.data.playerID);
        return;
      }

      // reconnection
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const oldSocket = playerSocketMap.get(data.sessionID)!;

      socket.data = { ...oldSocket.data };
      console.log(
        `Reconnecting socket: ${socket.id} with playerID ${socket.data.playerID}`
      );

      socketPlayerMap.delete(data.sessionID);
      socketPlayerMap.set(socket.id, socket);
      playerSocketMap.set(socket.data.playerID, socket);

      socket.emit("session-registered", null);

      const game = gameStore.getGame(socket.data.gameID);
      if (!game) {
        return;
      }

      game.markPlayerReconnected(socket.data.playerID);

      void socket.join(socket.data.gameID);

      socket.emit("lobby-update", getPlayersInGame(game));
      socket.emit("game-state", game.getClientGameState());
    });

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
        const user = await PlayerModel.findByPk(decoded.id);

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
              (gameID: string) =>
                gameStore.createBlackjackGame(
                  gameID,
                  socket.data.playerID,
                  data.playerName
                )
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

        socket.data.gameID = gameID;
        let inviteCode = generateInviteCode();
        while (inviteCodeMap.has(inviteCode)) {
          inviteCode = generateInviteCode(); // Regenerate if already exists
        }
        inviteCodeMap.set(inviteCode, gameID);

        // Join socket to a room with the game ID
        void socket.join(gameID);

        // Notify client of successful game creation
        const players = getPlayersInGame(game);
        socket.emit("lobby-created", {
          gameID,
          inviteCode,
          players: players.players,
          playerID: socket.data.playerID,
        });
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

        // Get the game
        const game = gameInfo.game;

        // Set player data
        socket.data.playerName = playerName;
        socket.data.gameID = gameID;

        // Add the player to the game
        try {
          game.addPlayer(socket.data.playerID, playerName);
        } catch {
          socket.emit("error", "Game is full. Please try another game.");
          return;
        }

        // Join socket to the game room
        void socket.join(gameID);

        console.log(
          `Player ${playerName} joined game ${gameID} with socket ID ${socket.data.playerID}`
        );

        // print all the sockets in the room
        const socketsInRoom = io.sockets.adapter.rooms.get(gameID);
        console.log(
          `Sockets in room ${gameID}: ${Array.from(socketsInRoom ?? []).join(", ")}`
        );

        // Notify of successful join
        socket.emit("join-success", {
          gameID,
          playerID: socket.data.playerID,
          gameType: gameInfo.type,
        });

        console.log(
          `Sending lobby update to ${socket.data.playerID} for game ${gameID}`
        );
        io.to(gameID).emit("lobby-update", getPlayersInGame(game));

        // Update all other players
        io.to(gameID).emit("game-state", game.getClientGameState());
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

        if (game.getHost() != socket.data.playerID) {
          socket.emit("error", "Only the host can start the game.");
          return;
        }

        // Check if game is ready to start
        if (game.getStatus() !== GameStatus.READY) {
          socket.emit("error", "Game is not ready to start yet.");
          return;
        }

        game.startGame();

        // Update all clients with new game state
        io.to(gameID).emit("game-started");
        io.to(gameID).emit("game-state", game.getClientGameState());
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", "Failed to start game.");
      }
    });

    socket.on("game-action", (data) => {
      try {
        const { gameID, action } = data;
        const playerID = socket.data.playerID;

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

    // handle leave function
    function handleLeave() {
      console.log(
        `Socket disconnected: ${socket.id} with playerID ${socket.data.playerID}`
      );

      const playerID = socket.data.playerID;
      const gameID = socket.data.gameID;

      playerSocketMap.delete(playerID);
      socketPlayerMap.delete(socket.id);

      if (gameID) {
        try {
          const game = gameStore.getGame(gameID);
          if (game) {
            // Remove player from the game
            game.removePlayer(playerID);

            // Notify remaining players
            socket.to(gameID).emit("game-state", game.getClientGameState());
            socket.to(gameID).emit("lobby-update", getPlayersInGame(game));

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
    }

    socket.on("leave", handleLeave);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(
        `Socket disconnected: ${socket.id} with playerID ${socket.data.playerID}`
      );

      const playerID = socket.data.playerID;
      const gameID = socket.data.gameID;

      // Remove socket from mapping
      socketPlayerMap.delete(socket.id);

      if (gameID && playerID) {
        try {
          const game = gameStore.getGame(gameID);
          if (game) {
            game.markPlayerDisconnected(playerID);
          }
        } catch (error) {
          console.error("Error handling player disconnect:", error);
        }
      }
    });
  });
}
