// start solitaire game
import { Card, Rank } from "../utils/card";
import { Deck } from "../utils/deck";

export class Column {
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

export class Foundation {
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

export class Stock {
  stock: Card[];
  // waste pile
  cards: Card[];

  constructor() {
    this.stock = [];
    this.cards = [];
  }

  addCard(card: Card) {
    this.stock.push(card);
  }

  draw(): void {
    if (this.stock.length > 0) {
      this.cards.push(this.stock.pop()!);
    } else {
      for (const card of this.cards) {
        this.stock.push(card);
      }
      this.cards = [];

      this.stock.reverse();
      // Draw the top card from the stock
      this.cards.push(this.stock.pop()!);
    }
  }

  removeCard(): Card | null {
    return this.cards.pop() ?? null;
  }
}

export class SolitaireGame {
  tableau: Column[];
  foundation: Foundation[];
  stock: Stock;

  constructor() {
    const deck = new Deck({ cardOptions: { faceCardUniqueValues: true } });
    this.tableau = Array.from({ length: 7 }, () => new Column()); // Initialize tableau with 7 empty piles
    this.foundation = Array.from({ length: 4 }, () => new Foundation()); // Initialize foundation with 4 empty piles
    this.stock = new Stock(); // Initialize stock pile

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck.draw();
        if (card) {
          if (j != i) {
            card.flip(); // Flip the card face down if it's not the last card in the pile
          }
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
  moveCard(source: Column | Stock, target: Foundation | Column): boolean {
    console.log(source);
    //get target card, null if empty target
    const targetCard =
      target.cards.length === 0 ? null : target.cards[target.cards.length - 1];

    // check if the move is valid
    if (
      !this.isValidMove(
        source.cards[source.cards.length - 1],
        targetCard,
        target
      )
    ) {
      return false;
    }

    // remove from source
    const card = source.removeCard()!;

    // add the card to target, if should never fail
    target.addCard(card);

    if (
      source instanceof Column &&
      source.cards.length > 0 &&
      !source.cards[source.cards.length - 1].faceUp
    ) {
      source.cards[source.cards.length - 1].flip(); // Flip the last card face up if it's a column
    }

    return true;
  }

  isValidMove(
    sourceCard: Card,
    targetCard: Card | null,
    target: Foundation | Column
  ): boolean {
    console.log("isValidMove", sourceCard, targetCard, target);
    if (!sourceCard) return false;

    // target card must be different color and one value higher
    if (targetCard && target instanceof Column) {
      return (
        sourceCard.getColor() !== targetCard.getColor() &&
        sourceCard.getValue() === targetCard.getValue() - 1
      );
    }

    if (targetCard && target instanceof Foundation) {
      return (
        sourceCard.getValue() === targetCard.getValue() + 1 &&
        sourceCard.getSuit() === targetCard.getSuit()
      );
    }

    if (target instanceof Foundation) {
      return sourceCard.getRank() === Rank.ACE; // Only Ace can be placed on an empty foundation pile
    }
    if (target instanceof Column) {
      return true; // Any card can be placed on an empty tableau pile
    }
    return false;
  }

  checkWin(): boolean {
    // Check if all foundation piles are complete (i.e., contain 13 cards each)
    return this.foundation.every((pile) => pile.cards.length === 13);
  }

  //TODO Softlock
  checkLose(): boolean {
    // Check if stock is empty and no valid moves left
    if (this.stock.cards.length === 0) {
      for (const tableau of this.tableau) {
        if (tableau.cards.length > 0) {
          const topCard = tableau.cards[tableau.cards.length - 1];
          for (const target of this.tableau) {
            // Check if any tableau other than current can accept the top card
            if (
              target !== tableau &&
              this.isValidMove(
                topCard,
                target.cards[target.cards.length - 1],
                target
              )
            ) {
              return false; // Valid move exists
            }
          }
          for (const foundation of this.foundation) {
            // Check if any foundation can accept the top card
            if (
              this.isValidMove(
                topCard,
                foundation.cards[foundation.cards.length - 1],
                foundation
              )
            ) {
              return false; // Valid move exists
            }
          }
        }
      }
      return true; // No valid moves left
    }

    return false; // Stock is not empty, so not a loss yet
  }
}
