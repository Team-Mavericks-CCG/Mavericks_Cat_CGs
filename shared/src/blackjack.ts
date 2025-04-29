import { Card } from "./card.js";
import { GameStatus, GameType } from "./index.js";

export interface BlackjackClientGameState {
  gameType: GameType.BLACKJACK;
  gameStatus: GameStatus;
  activePlayer: string | null;
  players: {
    id: string;
    name: string;
    hands: BlackjackHand[];
  }[];
  dealerHand: {
    cards: Card[];
    value: number;
  };
}

export enum BlackjackAction {
  HIT = "hit",
  STAND = "stand",
  SPLIT = "split",
}

export enum BlackjackHandStatus {
  // hand is dealt, not current turn
  WAITING = "waiting",
  // hand is active, player can hit or stand
  PLAYING = "playing",
  // player joined mid round
  INACTIVE = "inactive",
  STOOD = "stood",
  BUSTED = "busted",
  WIN = "win",
  LOSE = "lose",
}

export interface BlackjackHand {
  cards: Card[];
  status: BlackjackHandStatus;
  value: number; // to avoid recalculating
}
