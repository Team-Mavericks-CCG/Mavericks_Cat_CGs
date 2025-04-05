/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

// Define a more generic type for game state
type GameState = Record<string, unknown>;

// Define type for socket.io options
type SocketIOOptions = ConstructorParameters<typeof SocketIOServer>[1];

let io: SocketIOServer | null = null;

export function initSocketIO(server: HttpServer): void {
  const options: SocketIOOptions = {
    cors: {
      origin: process.env.CLIENT_URL ?? "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  };

  io = new SocketIOServer(server, options);

  // Safe to use non-null assertion here since we just assigned io
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  io!.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-game", (gameId: string) => {
      void socket.join(gameId);
      console.log(`Socket ${socket.id} joined game: ${gameId}`);
    });

    socket.on("leave-game", (gameId: string) => {
      void socket.leave(gameId);
      console.log(`Socket ${socket.id} left game: ${gameId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

// Emit game state updates to all clients in a game room
export function emitGameStateUpdate(
  gameId: string,
  gameState: GameState
): void {
  if (!io) {
    console.error(
      "Socket.IO not initialized when attempting to emit game state update"
    );
    return;
  }

  // Now safe to use io since we checked it's not null
  io.to(gameId).emit("game-state-update", { gameId, gameState });
}

// Check if socket.io is initialized
export function isSocketInitialized(): boolean {
  return io !== null;
}

// Utility function to notify a specific client
export function emitToClient(
  socketId: string,
  event: string,
  data: unknown
): void {
  if (!io) {
    console.error(
      "Socket.IO not initialized when attempting to emit to client"
    );
    return;
  }

  io.to(socketId).emit(event, data);
}
