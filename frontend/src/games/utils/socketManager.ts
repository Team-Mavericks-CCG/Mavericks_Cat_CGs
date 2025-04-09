import { io, Socket } from "socket.io-client";

// Socket event types
interface ServerToClientEvents {
  error: (data: unknown) => void;
  "game-state": (state: unknown) => void;
  "game-created": (data: { gameId: string }) => void;
  "join-success": (data: { gameId: string }) => void;
  "blackjack-round-over": (winner: string | null) => void;
  "blackjack-game-over": (winner: string | null) => void;
}

interface ClientToServerEvents {
  "create-blackjack": (data: { playerName: string }) => void;
  "join-blackjack": (data: { gameId: string; playerName: string }) => void;
  "start-blackjack": (data: { gameId: string }) => void;
  "blackjack-hit": (data: { gameId: string }) => void;
  "blackjack-stand": (data: { gameId: string }) => void;
  "blackjack-new-round": (data: { gameId: string }) => void;
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
  "blackjack-round-over": (data: unknown) => void;
  "blackjack-game-over": (data: unknown) => void;
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
      const serverUrl = envUrl ?? "http://localhost:5000";

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
    }
  }

  // Create a new blackjack game
  createBlackjackGame(playerName: string): Promise<{ gameId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      // Set up a one-time event handler for game created
      this.socket.once("game-created", (data) => {
        resolve(data);
      });

      // Set up a one-time error handler
      this.socket.once("error", (message) => {
        reject(new Error(message as string));
      });

      // Create the game
      this.socket.emit("create-blackjack", { playerName });
    });
  }

  // Join an existing blackjack game
  joinBlackjackGame(gameId: string, playerName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      // Set up a one-time event handler for successful join
      this.socket.once("join-success", () => {
        resolve();
      });

      // Set up a one-time error handler
      this.socket.once("error", (message) => {
        reject(new Error(message as string));
      });

      // Join the game
      this.socket.emit("join-blackjack", { gameId, playerName });
    });
  }

  // Start a blackjack game
  startBlackjackGame(gameId: string): void {
    if (!this.socket || !this._isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("start-blackjack", { gameId });
  }

  // Blackjack actions
  blackjackHit(gameId: string): void {
    if (!this.socket || !this._isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("blackjack-hit", { gameId });
  }

  blackjackStand(gameId: string): void {
    if (!this.socket || !this._isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("blackjack-stand", { gameId });
  }

  blackjackNewRound(gameId: string): void {
    if (!this.socket || !this._isConnected) {
      console.error("Socket not connected");
      return;
    }

    this.socket.emit("blackjack-new-round", { gameId });
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
