import { Card } from "./card.js";
import {
  BlackjackAction,
  BlackjackClientGameState,
  BlackjackHandStatus,
} from "./blackjack.js";

export * from "./card.js";

export * from "./deck.js";

export * from "./blackjack.js";

export * from "./socket.js";

// --- Common Types ---
export enum GameStatus {
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

export interface Hand {
  cards: Card[];
  status: BlackjackHandStatus;
  value: number;
}

export interface PokerClientGameState {
  gameType: GameType.POKER; // Discriminator property
  gameStatus: GameStatus;
  activePlayer: string | null;
  // ... other Poker specific properties
  pot: number;
  communityCards: Card[];
  players: {
    id: string;
    name: string;
    chips: number;
    hand: Card[];
    currentBet: number;
    status: string; // e.g., 'folded', 'playing', 'all-in'
  }[];
}

export enum PokerAction {
  BET = "bet",
  CALL = "call",
  RAISE = "raise",
  FOLD = "fold",
  CHECK = "check",
  ALL_IN = "all_in",
}

// --- Add other game states (War, Solitaire, etc.) similarly ---
// export interface WarClientGameState { gameType: "War"; ... }

// --- Discriminated Union of All Client Game States ---
export type ClientGameState = BlackjackClientGameState | PokerClientGameState;
// | WarClientGameState // Add other game states here

export type GameAction = BlackjackAction | PokerAction;

// --- Player Type (if shared) ---
export interface PlayerInfo {
  id: string;
  name: string;
  // Add other shared player properties if needed
}

export enum GameType {
  BLACKJACK = "Blackjack",
  // Add other game types as you create them
  POKER = "Poker",
  WAR = "War",
}
