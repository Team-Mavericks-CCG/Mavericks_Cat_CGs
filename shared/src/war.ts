import { Card } from "./card.js";
import { GameStatus, GameType } from "./index.js";

export interface WarClientGameState {
  gameType: GameType.WAR;
  gameStatus: GameStatus;
  isWar: boolean;
  warPileCount: number; // Number of cards in the war pile
  roundWinner: string | null; // ID of the player who won the last round
  winReason: string; // Explanation of why a player won (e.g. "K of Spades beats 10 of Hearts")
  // Current face-up cards played by each player
  currentCards: {
    [playerId: string]: Card;
  };
  players: {
    id: string;
    name: string;
    hand: WarHand;
  }[];
}

export enum WarAction {
  Play = "play",
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
