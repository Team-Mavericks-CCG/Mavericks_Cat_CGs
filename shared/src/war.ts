import { Card } from "./card.js";
import { GameStatus } from "./index.js";

export interface WarClientGameState {
  gameType: "War";
  gameStatus: GameStatus;\
  players: {
    id: string;
    name: string;
    hands: WarHand[];
  }[];
};

export enum WarAction {
  Play = "",
}

export enum WarHandStatus {
  // hand is dealt, not current turn
  WAITING = "waiting",
  // hand is active, player can hit or stand
  PLAYING = "playing",
  // player joined mid round
  INACTIVE = "inactive",
  WIN = "win",
  LOSE = "lose",
}

export interface WarHand {
  cards: Card[];
  status: WarHandStatus;
}
