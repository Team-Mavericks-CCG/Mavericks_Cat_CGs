// start solitaire game
import { Card, Rank } from "../utils/card";
import { Deck } from "../utils/deck";

class Tableau {
  cards: Card[];
  faceUp: boolean;

  constructor() {
    this.cards = [];
    this.faceUp = false; // Initially face down
  }

  addCard(card: Card) {
    this.cards.push(card);
    this.faceUp = true; // Face up when a card is added
  }

  removeCard(): Card | null {
    return this.cards.pop() ?? null;
  }
}

class Foundation {
  cards: Card[];

  constructor() {
    this.cards = [];
  }

  addCard(card: Card) {
    this.cards.push(card);
  }

  removeCard(): Card | null {
    return this.cards.pop() ?? null;
  }
}

class Stock {
  cards: Card[];

  constructor() {
    this.cards = [];
  }

  addCard(card: Card) {
    this.cards.push(card);
  }

  removeCard(): Card | null {
    return this.cards.pop() ?? null;
  }
}

export class SolitaireGame {
  tableau: Tableau[];
  foundation: Foundation[];
  stock: Stock;

  constructor() {
    const deck = new Deck({ cardOptions: { faceCardUniqueValues: true } });
    this.tableau = Array.from({ length: 7 }, () => new Tableau()); // Initialize tableau with 7 empty piles
    this.foundation = Array.from({ length: 4 }, () => new Foundation()); // Initialize foundation with 4 empty piles
    this.stock = new Stock(); // Initialize stock pile

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck.draw();
        if (card) {
          this.tableau[i].addCard(card);
        }
      }
    }

    while (deck.cards.length > 0) {
      const card = deck.draw();
      if (card) {
        this.stock.addCard(card);
      }
    }
  }
  // move card from tableau to foundation
  moveCard(source: Stock, target: Foundation): boolean;
  moveCard(source: Stock, target: Tableau): boolean;
  moveCard(source: Tableau, target: Tableau): boolean;
  moveCard(source: Tableau, target: Foundation): boolean {
    if (
      !this.isValidMove(
        source.cards[source.cards.length - 1],
        target.cards[target.cards.length - 1],
        target
      )
    ) {
      return false;
    }

    const card = source.removeCard();
    if (card) {
      target.addCard(card);
      return true;
    }
    return false;
  }

  isValidMove(
    sourceCard: Card,
    targetCard: Card | null,
    target: Foundation | Tableau
  ): boolean {
    if (!sourceCard) return false;
    if (!targetCard && target instanceof Foundation) {
      return sourceCard.getRank() === Rank.ACE; // Only Ace can be placed on an empty foundation pile
    }
    if (!targetCard && target instanceof Tableau) {
      return true; // Any card can be placed on an empty tableau pile
    }
    if (!targetCard) return false;
    // Check if the source card can be placed on the target card
    return (
      sourceCard.getColor() !== targetCard.getColor() &&
      sourceCard.getValue() === targetCard.getValue() - 1
    );
  }

  checkWin(): boolean {
    // Check if all foundation piles are complete (i.e., contain 13 cards each)
    return this.foundation.every((pile) => pile.cards.length === 13);
  }

  //TODO Softlock
}
