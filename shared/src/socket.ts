import { ClientGameState } from "./index.js";

// Socket event types
export interface ServerToClientEvents {
  // Common events
  error: (message: string) => void;
  "game-started": (state: ClientGameState) => void;
  "game-state": (state: ClientGameState) => void;
  "lobby-created": (data: {
    gameID: string;
    inviteCode: string;
    players: Player[];
    playerID: string;
  }) => void;
  "join-success": (data: { gameID: string; playerID: string }) => void;
  "lobby-update": (data: { players: Player[] }) => void;
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

export interface ClientToServerEvents {
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

export interface Player {
  name: string;
  rank?: string;
  color?: string;
  image?: string;
  isReady?: boolean;
}
