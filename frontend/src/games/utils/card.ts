export interface CardRankOptions {
  aceHigh?: boolean;
  faceCardUniqueValues?: boolean;
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
  options: CardRankOptions;

  /**
   * Creates a new card instance
   * @param suit - The card suit from Suit enum
   * @param rank - The card rank from Rank enum
   */
  constructor(suit: Suit, rank: Rank, options: CardRankOptions = {}) {
    this.options = options;
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
  getValue(): number {
    const { aceHigh = false, faceCardUniqueValues = false } = this.options;

    // TODO: Should Ace be 14 when high to match faceCardUniqueValues?
    if (this.rank === Rank.ACE) {
      return aceHigh ? 11 : 1;
    } else if (faceCardUniqueValues && ["J", "Q", "K"].includes(this.rank)) {
      return 11 + ["J", "Q", "K"].indexOf(this.rank);
    } else if (["J", "Q", "K"].includes(this.rank)) {
      return 10;
    } else {
      return parseInt(this.rank, 10);
    }
  }

  getRank(): Rank {
    return this.rank;
  }

  /**
   * Gets the color of the card
   * @returns The color of the card ("red" or "black")
   */
  getColor(): Color {
    return this.color;
  }

  getSuit(): Suit {
    return this.suit;
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
      rank: this.rank,
      color: this.color,
    };
  }
}
