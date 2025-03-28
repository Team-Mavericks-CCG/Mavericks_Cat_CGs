export interface CardValueOptions {
  aceHigh?: boolean;
}

export enum Suit {
  CLUBS = "Clubs",
  DIAMONDS = "Diamonds",
  HEARTS = "Hearts",
  SPADES = "Spades",
}

export enum Rank {
  ACE = "A",
  TWO = "2",
  THREE = "3",
  FOUR = "4",
  FIVE = "5",
  SIX = "6",
  SEVEN = "7",
  EIGHT = "8",
  NINE = "9",
  TEN = "10",
  JACK = "J",
  QUEEN = "Q",
  KING = "K",
}

export enum Color {
  RED = "red",
  BLACK = "black",
}

export class Card {
  suit: Suit;
  rank: Rank;
  color: Color;

  /**
   * Creates a new card instance
   * @param suit - The card suit from Suit enum
   * @param value - The card rank from Rank enum
   */
  constructor(suit: Suit, rank: Rank) {
    this.suit = suit;
    this.rank = rank;
    //specify color based on suit
    this.color =
      suit === Suit.CLUBS || suit === Suit.SPADES ? Color.BLACK : Color.RED;
  }

  /**
   * Gets the numeric value of the card
   * @param options - Options for value calculation (e.g., aceHigh)
   * @returns The numeric value of the card
   */
  getValue(options: CardValueOptions = {}): number {
    const { aceHigh = false } = options;

    if (this.rank === Rank.ACE) {
      return aceHigh ? 11 : 1;
    } else if (["J", "Q", "K"].includes(this.rank)) {
      return 10;
    } else {
      return parseInt(this.rank, 10);
    }
  }

  /**
   * Gets the color of the card
   * @returns The color of the card ("red" or "black")
   */
  getColor(): Color {
    return this.color;
  }

  /**
   * Returns a string representation of the card
   * @returns A string in the format "RANK of SUIT"
   */
  toString(): string {
    return `${this.rank} of ${this.suit}`;
  }

  /**
   * Creates a JSON representation of the card
   * @returns An object with suit, value, and color properties
   */
  toJSON(): Record<string, string> {
    return {
      suit: this.suit,
      value: this.rank,
      color: this.color,
    };
  }
}
