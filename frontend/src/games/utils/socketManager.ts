import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "../../utils/api";

// Socket event types
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

// For event handler mapping
interface EventHandlerMap {
  "game-state": (data: unknown) => void;
  error: (data: unknown) => void;
  "join-success": (data: unknown) => void;
  "game-created": (data: unknown) => void;
  [key: string]: ((data: unknown) => void) | undefined;
}

// Socket manager class for frontend usage
class SocketManager {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private gameEventHandlers: Map<
    string,
    EventHandlerMap[keyof EventHandlerMap]
  > = new Map<string, EventHandlerMap[keyof EventHandlerMap]>();

  // Connection status
  private _isConnected = false;
  private _isAuthenticated = false;
  private _userId: number | null = null;
  private _username: string | null = null;
  private gameID: string | null = null;

  // Getters
  get isConnected(): boolean {
    return this._isConnected;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get userId(): number | null {
    return this._userId;
  }

  get username(): string | null {
    return this._username;
  }

  // Connect to the socket server
  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        this._isConnected = true;
        resolve(true);
        return;
      }

      // Get the server URL from env or use the default
      const envUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
      const serverUrl = envUrl ?? SERVER_URL;

      // Create socket connection
      this.socket = io(serverUrl, {
        autoConnect: true,
        reconnection: true,
        transports: ["websocket", "polling"],
      });

      // Set up event listeners
      this.socket.on("connect", () => {
        console.log("Socket connected");
        this._isConnected = true;
        resolve(true);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
        this._isConnected = false;
        this._isAuthenticated = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this._isConnected = false;
        this._isAuthenticated = false;
        resolve(false);
      });

      // Listen for game state updates
      this.socket.on("game-state", (gameState) => {
        this.handleGameState(gameState);
      });

      // Listen for errors
      this.socket.on("error", (message) => {
        console.error("Socket error:", message);
        const handler = this.gameEventHandlers.get("error");
        if (handler) {
          handler(message);
        }
      });
    });
  }

  // Authenticate using a JWT
  authenticate(token: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.socket || !this._isConnected) {
        resolve(false);
        return;
      }

      this.socket.emit("authenticate", token, (authenticated, user) => {
        this._isAuthenticated = authenticated;

        if (authenticated && user) {
          this._userId = user.id;
          this._username = user.username;
        }

        resolve(authenticated);
      });
    });
  }

  // Disconnect from the socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._isConnected = false;
      this._isAuthenticated = false;
      this._userId = null;
      this._username = null;
      this.gameID = null;
    }
  }

  // TODO implement enum for gametype on front end
  createLobby(
    playerName: string,
    gameType: string
  ): Promise<{ inviteCode: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleError = (message: string) => {
        this.socket?.off("lobby-created", handleSuccess);
        reject(new Error(message));
      };

      const handleSuccess = (data: { gameID: string; inviteCode: string }) => {
        this.gameID = data.gameID;
        this.socket?.off("error", handleError);
        resolve({ inviteCode: data.inviteCode });
      };

      // Set up a one-time event handler for game action
      this.socket.once("lobby-created", (data) => {
        handleSuccess(data);
      });

      // Set up a one-time error handler
      this.socket.once("error", handleError);

      // Create the lobby
      this.socket.emit("create-lobby", {
        playerName: playerName,
        gameType: gameType,
      });
    });
  }

  joinLobby(playerName: string, inviteCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleError = (message: string) => {
        this.socket?.off("join-success", handleSuccess);
        reject(new Error(message));
      };

      const handleSuccess = (data: { gameID: string }) => {
        this.gameID = data.gameID;
        this.socket?.off("error", handleError);
        resolve();
      };

      // Set up a one-time event handler for game action
      this.socket.once("join-success", (data) => {
        handleSuccess(data);
      });

      // Set up a one-time error handler
      this.socket.once("error", handleError);

      // Join the lobby
      this.socket.emit("join-lobby", { playerName, inviteCode });
    });
  }

  startGame(gameID: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleError = (message: string) => {
        this.socket?.off("game-started", handleSuccess);
        reject(new Error(message));
      };

      const handleSuccess = () => {
        this.socket?.off("error", handleError);
        resolve();
      };

      // Set up a one-time event handler for game action
      this.socket.once("game-started", handleSuccess);

      // Set up a one-time error handler
      this.socket.once("error", handleError);

      // Start the game
      this.socket.emit("start-game", { gameID });
    });
  }

  gameAction(gameID: string, action: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleError = (message: string) => {
        this.socket?.off("game-state", handleSuccess);
        reject(new Error(message));
      };

      const handleSuccess = () => {
        this.socket?.off("error", handleError);
        resolve();
      };

      // Set up a one-time event handler for game action
      this.socket.once("game-state", handleSuccess);

      // Set up a one-time error handler
      this.socket.once("error", handleError);

      // Emit the game action
      this.socket.emit("game-action", { gameID, action });
    });
  }

  // Register event handlers for game events
  on<K extends keyof EventHandlerMap>(
    event: K,
    handler: EventHandlerMap[K]
  ): void {
    this.gameEventHandlers.set(event as string, handler);

    // If the event is one of the predefined socket.io events, add a listener
    if (
      this.socket &&
      [
        "game-state",
        "error",
        "join-success",
        "game-created",
        "blackjack-round-over",
        "blackjack-game-over",
      ].includes(event as string)
    ) {
      // Need to cast here because TypeScript can't infer the correct overload
      if (handler) {
        this.socket.on(event as keyof ServerToClientEvents, handler);
      }
    }
  }

  // Remove event handler
  off(event: string): void {
    this.gameEventHandlers.delete(event);

    // If the event is one of the predefined socket.io events, remove the listener
    if (
      this.socket &&
      [
        "game-state",
        "error",
        "join-success",
        "game-created",
        "blackjack-round-over",
        "blackjack-game-over",
      ].includes(event)
    ) {
      this.socket.off(event as keyof ServerToClientEvents);
    }
  }

  // Handle game state updates and dispatch to specific handlers
  private handleGameState(gameState: unknown): void {
    // Call the general game state handler if registered
    const gameStateHandler = this.gameEventHandlers.get("game-state");
    if (gameStateHandler) {
      gameStateHandler(gameState);
    }
  }
}

export const socketManager = new SocketManager();
