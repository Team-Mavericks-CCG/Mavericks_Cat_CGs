import { Card, Suit, Rank, CardRankOptions } from "./card.js";

export interface DeckOptions {
  cardOptions?: CardRankOptions;
  suits?: Suit[];
  ranks?: Rank[];
  jokers?: number;
}

export class Deck {
  cards: Card[];

  constructor(options: DeckOptions = {}) {
    const {
      suits = Object.values(Suit),
      ranks = Object.values(Rank),
      jokers = 0,
    } = options;

    this.cards = [];

    const cardOptions = options.cardOptions ?? {};
    // Generate standard deck
    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(suit, rank, cardOptions));
      }
    }

    // TODO: Add joker support
    if (jokers > 0) {
      throw new Error("Jokers are not supported yet");
      // add 2 jokers to the deck, 1 red and 1 black
    }
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  shuffle(): this {
    for (let i = this.cards.length - 1; i > 0; i--) {
      // Generate a random index j such that 0 ≤ j ≤ i
      const j = Math.floor(Math.random() * (i + 1));

      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    return this;
  }

  /**
   * Draw a card from the top of the deck
   */
  draw(): Card | null {
    if (this.isEmpty()) {
      return null;
    }

    return this.cards.pop() ?? null;
  }

  /**
   * Draw multiple cards from the top of the deck
   */
  drawMultiple(count: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.draw();
      if (card) {
        cards.push(card);
      } else {
        break;
      }
    }
    return cards;
  }

  /**
   * Add a card to the bottom of the deck
   */
  addToBottom(card: Card): this {
    this.cards.unshift(card);
    return this;
  }

  /**
   * Add a card to the top of the deck
   */
  addToTop(card: Card): this {
    this.cards.push(card);
    return this;
  }

  /**
   * Check if the deck is empty
   */
  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  /**
   * Get the number of cards in the deck
   */
  getCount(): number {
    return this.cards.length;
  }

  /**
   * Create a new shuffled deck
   */
  static createShuffled(options: DeckOptions = {}): Deck {
    return new Deck(options).shuffle();
  }
}
