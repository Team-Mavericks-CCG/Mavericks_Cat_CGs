import { Card } from "../utils/card";

export interface BlackjackClientGameState {
  gameId: string;
  gameStatus: GameStatus;
  activePlayer: string | null;
  players: {
    id: string;
    name: string;
    hands: Hand[];
  }[];
  dealerHand: {
    cards: Card[];
    value: number;
  };
}

export enum GameStatus {
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  FINISHED = "FINISHED",
}

enum HandStatus {
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

interface Hand {
  cards: Card[];
  status: HandStatus;
  value: number; // to avoid recalculating
}
