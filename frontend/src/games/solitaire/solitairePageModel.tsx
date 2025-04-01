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

  constructor(initialState?: { stock: Card[]; waste: Card[] }) {
    if (initialState) {
      this.stock = cloneCards(initialState.stock);
      this.cards = cloneCards(initialState.waste);
    } else {
      this.stock = [];
      this.cards = [];
    }
  }

  addCard(card: Card) {
    this.stock.push(card);
  }

  removeCard(): Card | null {
    return this.cards.pop() ?? null;
  }
}

interface GameState {
  tableau: Card[][];
  foundation: Card[][];
  stock: {
    stock: Card[];
    waste: Card[];
  };
}

function cloneCards(cards: Card[]): Card[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return cards.map((card) => card.clone());
}

export class SolitaireGame {
  tableau: Column[];
  public foundation: Foundation[];
  stock: Stock;
  history: GameState[] = [];

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
        card.flip(); // Flip the card face down
        this.stock.addCard(card);
      }
    }
  }

  saveState(): void {
    const state: GameState = {
      tableau: this.tableau.map((column) => cloneCards(column.cards)),
      foundation: this.foundation.map((f) => cloneCards(f.cards)),
      stock: {
        stock: cloneCards(this.stock.stock),
        waste: cloneCards(this.stock.cards),
      },
    };

    this.history.push(state);
  }

  draw(): void {
    this.saveState();
    if (this.stock.stock.length > 0) {
      this.stock.cards.push(this.stock.stock.pop()!.flip());
    } else {
      for (const card of this.stock.cards) {
        this.stock.stock.push(card.flip());
      }

      this.stock.cards = [];

      this.stock.stock.reverse();

      // Draw the top card from the stock
      this.stock.cards.push(this.stock.stock.pop()!.flip());
    }
  }

  hasHistory(): boolean {
    return this.history.length > 0;
  }

  // move card from tableau to foundation
  moveCard(
    source: Column | Stock,
    target: Foundation | Column,
    sourceIndex: number
  ): boolean {
    console.log("Move card", source, target, sourceIndex);

    // if the source isn't a column only the top card can be moved
    if (
      sourceIndex !== source.cards.length - 1 &&
      !(source instanceof Column)
    ) {
      return false;
    }

    //get target card, null if empty target
    const targetCard =
      target.cards.length === 0 ? null : target.cards[target.cards.length - 1];

    const sourceCard = source.cards[sourceIndex];

    // check if the move is valid
    if (!this.isValidMove(sourceCard, targetCard, target)) {
      return false;
    }

    // save previous state for undo
    this.saveState();

    // not top card
    if (sourceIndex !== source.cards.length - 1) {
      // move all cards from sourceIndex to the end of the source column to target
      //remove the cards from source and add them to target
      const cardsToMove = source.cards.splice(
        sourceIndex,
        source.cards.length - sourceIndex
      );
      target.cards.push(...cardsToMove);
    }
    // top card
    else {
      // remove from source
      const card = source.removeCard()!;

      // add the card to target, if should never fail
      target.addCard(card);
    }

    // flip the last card face up if it's a column and the last card is face down
    if (
      source instanceof Column &&
      source.cards.length > 0 &&
      !source.cards[source.cards.length - 1].faceUp
    ) {
      source.cards[source.cards.length - 1].flip();
    }

    return true;
  }

  isValidMove(
    sourceCard: Card,
    targetCard: Card | null,
    target: Foundation | Column
  ): boolean {
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

  undo(): boolean {
    const previousState = this.history.pop();

    if (!previousState) return false; // No previous state to undo to

    this.tableau.forEach((column, index) => {
      column.cards = cloneCards(previousState.tableau[index]);
    });

    // Restore foundation piles with the cloned cards
    this.foundation.forEach((foundation, index) => {
      foundation.cards = cloneCards(previousState.foundation[index]);
    });

    this.stock = new Stock({
      stock: cloneCards(previousState.stock.stock),
      waste: cloneCards(previousState.stock.waste),
    });

    return true; // Undo successful
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
