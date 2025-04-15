// blackjack model
import { Card, Rank } from "../utils/card";
import { Deck } from "../utils/deck";

export interface BlackjackPlayer {
  hand: Card[];
  isStanding: boolean;
  isBusted: boolean;
  hasBlackjack: boolean;
}

export interface BlackjackDealer {
  hand: Card[];
  hiddenCard: Card | null;
}

export interface BlackjackState {
  player: BlackjackPlayer;
  dealer: BlackjackDealer;
  deck: Card[];
  score: number; // total player winnings
}

export interface SerializableBlackjackState {
  player: {
    hand: Record<string, string | boolean>[];
    isStanding: boolean;
    isBusted: boolean;
    hasBlackjack: boolean;
  };
  dealer: {
    hand: Record<string, string | boolean>[];
    hiddenCard: Record<string, string | boolean> | null;
  };
  deck: Record<string, string | boolean>[];
  score: number;
  history: SerializableBlackjackState[];
}

export class BlackjackGame {
  player: BlackjackPlayer = {
    hand: [],
    isStanding: false,
    isBusted: false,
    hasBlackjack: false,
  };
  
  dealer: BlackjackDealer = {
    hand: [],
    hiddenCard: null,
  };
  
  deck: Card[] = [];
  score = 0;
  history: BlackjackState[] = [];

  constructor(state?: BlackjackState) {
    if (state) {
      this.setGame(state);
    } else {
      this.deck = Deck.createShuffled({ cardOptions: { faceCardUniqueValues: true } }).cards;
      this.player = {
        hand: [],
        isStanding: false,
        isBusted: false,
        hasBlackjack: false,
      };
      this.dealer = {
        hand: [],
        hiddenCard: null,
      };
      this.score = 0;
      this.initializeGame();
    }
  }

  initializeGame() {
    this.player.hand = [this.drawCard(), this.drawCard()];
    this.dealer.hand = [this.drawCard()];
    this.dealer.hiddenCard = this.drawCard();

    this.player.hasBlackjack = this.getHandValue(this.player.hand) === 21;
  }

  drawCard(): Card {
    const card = this.deck.pop();
    if (!card) throw new Error("Deck is empty");
    return card;
  }

  hitPlayer() {
    if (this.player.isStanding || this.player.isBusted) return;

    this.player.hand.push(this.drawCard());
    const total = this.getHandValue(this.player.hand);

    if (total > 21) {
      this.player.isBusted = true;
    } else if (total === 21) {
      this.player.isStanding = true;
    }
  }

  standPlayer() {
    this.player.isStanding = true;
    this.revealDealerHand();
    this.playDealer();
    this.resolveGame();
  }

  revealDealerHand() {
    if (this.dealer.hiddenCard) {
      this.dealer.hand.push(this.dealer.hiddenCard);
      this.dealer.hiddenCard = null;
    }
  }

  playDealer() {
    while (this.getHandValue(this.dealer.hand) < 17) {
      this.dealer.hand.push(this.drawCard());
    }
  }

  resolveGame() {
    const playerValue = this.getHandValue(this.player.hand);
    const dealerValue = this.getHandValue(this.dealer.hand);

    if (this.player.isBusted) {
      this.score -= 1; // Player loses
    } else if (dealerValue > 21 || playerValue > dealerValue) {
      this.score += 1; // Player wins
    } else if (playerValue < dealerValue) {
      this.score -= 1; // Player loses
    }
    // else: tie, no score change
  }

  getHandValue(hand: Card[]): number {
    let value = 0;
    let aceCount = 0;
    for (const card of hand) {
      if (card.rank === Rank.ACE) {
        aceCount++;
        value += 11;
      } else if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank, 10);
      }
    }
    while (value > 21 && aceCount > 0) {
      value -= 10;
      aceCount--;
    }
    return value;
  }

  getState(): BlackjackState {
    return {
      player: { ...this.player },
      dealer: {
        hand: [...this.dealer.hand],
        hiddenCard: this.dealer.hiddenCard,
      },
      deck: [...this.deck],
      score: this.score,
    };
  }

  setGame(state: BlackjackState) {
    this.player = { ...state.player };
    this.dealer = {
      hand: [...state.dealer.hand],
      hiddenCard: state.dealer.hiddenCard,
    };
    this.deck = [...state.deck];
    this.score = state.score;
  }

  saveState(): void {
    this.history.push(this.getState());
  }
}
