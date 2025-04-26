import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "../../utils/api";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  ClientGameState,
  Player,
} from "shared";

// Socket manager class for frontend usage
class SocketManager {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  // Connection status
  private _isConnected = false;
  private _isAuthenticated = false;
  private _playerID: string | null = null;
  private _username: string | null = null;
  private _gameType: string | null = null;
  private _players: Player[] = [];
  private playerUpdateCallbacks: ((players: Player[]) => void)[] = [];
  private gameID: string | null = null;
  private _inviteCode: string | null = null;
  private _gameState: ClientGameState | null = null;
  private gameStateUpdateCallbacks: ((
    state: ClientGameState | null
  ) => void)[] = [];
  private _playerName: string | null = null;
  private _isHost = false;

  // Getters
  get isConnected(): boolean {
    return this._isConnected;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get playerID(): string | null {
    return this._playerID;
  }

  get username(): string | null {
    return this._username;
  }

  get players(): Player[] {
    return [...this._players];
  }

  get gameState(): ClientGameState | null {
    return this._gameState;
  }

  get gameType(): string | null {
    return this._gameType;
  }

  get inviteCode(): string | null {
    return this._inviteCode;
  }

  get playerName(): string | null {
    return this._playerName;
  }

  get isHost(): boolean {
    return this._isHost;
  }

  onPlayersUpdate(callback: (players: Player[]) => void): () => void {
    this.playerUpdateCallbacks.push(callback);

    // Call immediately with current data
    callback([...this._players]);

    // Return an unsubscribe function
    return () => {
      this.playerUpdateCallbacks = this.playerUpdateCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  onGameStateUpdate(
    callback: (state: ClientGameState | null) => void
  ): () => void {
    this.gameStateUpdateCallbacks.push(callback);

    // Call immediately with current data
    callback(this._gameState);

    // Return an unsubscribe function
    return () => {
      this.gameStateUpdateCallbacks = this.gameStateUpdateCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  handleLobbyConnection(
    playerName: string,
    gameType: string,
    inviteCode: string | null
  ): Promise<boolean> {
    if (inviteCode) {
      console.log("Joining lobby with invite code:", inviteCode);
      return this.joinLobby(playerName, inviteCode).then(() => true);
    }
    console.log("Creating lobby");
    return this.createLobby(playerName, gameType).then(() => true);
  }

  // TODO handle failed connections better
  connect(
    playerName: string,
    gameType: string,
    inviteCode: string | null,
    isHost = false
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        this._isConnected = true;
        resolve(this.inviteCode);
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

      this._playerName = playerName;
      this._gameType = gameType;
      this._isHost = isHost;

      // Set up event listeners
      this.socket.on("connect", () => {
        console.log("Socket connected");
        this._isConnected = true;
        this.handleLobbyConnection(playerName, gameType, inviteCode)
          .then(() => {
            resolve(this.inviteCode);
          })
          .catch((error: Error) => {
            console.error("Error handling lobby connection:", error);
            this._isConnected = false;
            this._isAuthenticated = false;
            reject(error);
          });
      });

      this.socket.on("lobby-update", (data) => {
        console.log("Received lobby update:", data);
        this._players = data.players.map((player) => ({
          name: player.name,
          rank: player.rank ?? `RANK #${Math.floor(Math.random() * 1000)}`,
          color: player.color ?? "blue",
          image: player.image ?? "🐱",
          isReady: player.isReady ?? false,
        }));

        this.playerUpdateCallbacks.forEach((callback) =>
          callback([...this._players])
        );
      });

      this.socket.on("game-state", (state: ClientGameState) => {
        console.log("Received game state:", state);
        this._gameState = state;

        this.gameStateUpdateCallbacks.forEach((callback) => {
          if (this._gameState) {
            callback({ ...this._gameState });
          }
        });
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
        this._isConnected = false;
        this._isAuthenticated = false;
        this._inviteCode = null;
        this.gameID = null;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this._isConnected = false;
        this._isAuthenticated = false;
        reject(error);
      });

      // Listen for errors
      this.socket.on("error", (message) => {
        console.error("Socket error:", message);
        reject(Error(message));
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
          this._username = user.username;
        }

        resolve(authenticated);
      });
    });
  }

  // Disconnect from the socket server
  disconnect(): void {
    if (this.socket) {
      localStorage.removeItem(this.playerID!);
      this.socket.disconnect();
      this.socket = null;
      this._isConnected = false;
      this._isAuthenticated = false;
      this._playerID = null;
      this._username = null;
      this.gameID = null;
      this._inviteCode = null;
      this._players = [];
      this._gameState = null;
    }
  }

  // TODO implement enum for gametype on front end
  private createLobby(playerName: string, gameType: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleError = (message: string) => {
        this.socket?.off("lobby-created", handleSuccess);
        reject(new Error(message));
      };

      const handleSuccess = (data: {
        gameID: string;
        inviteCode: string;
        players: { name: string }[];
        playerID: string;
      }) => {
        console.log("Lobby created:", data);
        this.gameID = data.gameID;
        this._inviteCode = data.inviteCode;
        this._playerID = data.playerID;
        this._players = data.players.map((player) => ({
          name: player.name,
          rank: `RANK #${Math.floor(Math.random() * 1000)}`,
          color: "pink",
          image: "🐱",
          isReady: false,
        }));

        this.socket?.off("error", handleError);
        resolve();
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

  private joinLobby(playerName: string, inviteCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleError = (message: string) => {
        this.socket?.off("join-success", handleSuccess);
        reject(new Error(message));
      };

      const handleSuccess = (data: { gameID: string; playerID: string }) => {
        console.log("Joined lobby:", data);
        this.gameID = data.gameID;
        this._inviteCode = inviteCode;
        this._playerID = data.playerID;
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

  startGame(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this._isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const handleError = () => {
        this.socket?.off("game-started", handleSuccess);
        reject(new Error("Failed to start game"));
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
      this.socket.emit("start-game", { gameID: this.gameID! });
    });
  }

  gameAction(action: string): Promise<void> {
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
      this.socket.emit("game-action", { gameID: this.gameID!, action });
    });
  }

  newRound(): Promise<void> {
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
      this.socket.emit("new-round", { gameID: this.gameID! });
    });
  }

  // Simplify by using Socket.io's built-in event system directly
  on<K extends keyof ServerToClientEvents>(
    event: K,
    handler: ServerToClientEvents[K]
  ): void {
    if (this.socket) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      this.socket.on(event, handler as any);
    }
  }

  off<K extends keyof ServerToClientEvents>(event: K): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketManager = new SocketManager();
