// start solitaire game
import { Card, Rank, Suit } from "../utils/card";
import { Deck } from "../utils/deck";

// Update GameState interface to use serializable cards
export interface GameState {
  score: number;
  tableau: Card[][];
  foundation: Card[][];
  stock: {
    stock: Card[];
    waste: Card[];
  };
}

// Add serializable game state interface
export interface SerializableGameState {
  score: number;
  tableau: Record<string, string | boolean>[][];
  foundation: Record<string, string | boolean>[][];
  stock: {
    stock: Record<string, string | boolean>[];
    waste: Record<string, string | boolean>[];
  };
  history: SerializableGameState[];
}

export class Column {
  readonly type = "column";
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
  readonly type = "foundation";
  cards: Card[];
  suit: Suit;

  constructor(suit: Suit) {
    this.cards = [];
    this.suit = suit; // suit of the foundation pile
  }

  addCard(card: Card) {
    this.cards.push(card);
  }

  removeCard(): Card | null {
    return this.cards.pop() ?? null;
  }
}

export class Stock {
  readonly type = "stock";
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

export const almostWon: GameState = {
  score: 0,
  tableau: [
    [
      new Card(Rank.KING, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.QUEEN, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.JACK, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.TEN, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.NINE, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.EIGHT, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.SEVEN, Suit.SPADES, { faceCardUniqueValues: true }),
    ],
    [
      new Card(Rank.KING, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.QUEEN, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.JACK, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.TEN, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.NINE, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.EIGHT, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.SEVEN, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.SIX, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.FIVE, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.FOUR, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.THREE, Suit.CLUBS, { faceCardUniqueValues: true }),
    ],
    [
      new Card(Rank.KING, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.QUEEN, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.JACK, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.TEN, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.NINE, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.EIGHT, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.SEVEN, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.SIX, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.FIVE, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.FOUR, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.THREE, Suit.HEARTS, { faceCardUniqueValues: true }),
    ],
    [
      new Card(Rank.KING, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.QUEEN, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.JACK, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.TEN, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.NINE, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.EIGHT, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.SEVEN, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.SIX, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.FIVE, Suit.DIAMONDS, { faceCardUniqueValues: true }),
    ],
    [
      new Card(Rank.SIX, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.FIVE, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.FOUR, Suit.HEARTS, { faceCardUniqueValues: true }),
      new Card(Rank.THREE, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.TWO, Suit.HEARTS, { faceCardUniqueValues: true }),
    ],
    [],
    [],
  ],
  foundation: [
    [
      new Card(Rank.ACE, Suit.SPADES, { faceCardUniqueValues: true }),
      new Card(Rank.TWO, Suit.SPADES, { faceCardUniqueValues: true }),
    ],
    [
      new Card(Rank.ACE, Suit.CLUBS, { faceCardUniqueValues: true }),
      new Card(Rank.TWO, Suit.CLUBS, { faceCardUniqueValues: true }),
    ],
    [new Card(Rank.ACE, Suit.HEARTS, { faceCardUniqueValues: true })],
    [
      new Card(Rank.ACE, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.TWO, Suit.DIAMONDS, { faceCardUniqueValues: true }),
      new Card(Rank.THREE, Suit.DIAMONDS, { faceCardUniqueValues: true }),
    ],
  ],
  stock: {
    stock: [],
    waste: [new Card(Rank.FOUR, Suit.CLUBS, { faceCardUniqueValues: true })],
  },
};

function cloneCards(cards: Card[]): Card[] {
  return cards.map((card) => card.clone());
}

export class SolitaireGame {
  score: number;
  tableau: Column[];
  public foundation: Foundation[];
  stock: Stock;
  history: GameState[] = [];

  constructor(gameState?: GameState) {
    this.score = 0;
    this.tableau = Array.from({ length: 7 }, () => new Column()); // Initialize tableau with 7 empty piles
    this.foundation = [
      new Foundation(Suit.SPADES),
      new Foundation(Suit.CLUBS),
      new Foundation(Suit.HEARTS),
      new Foundation(Suit.DIAMONDS),
    ]; // Initialize foundation piles for each suit
    this.stock = new Stock(); // Initialize stock pile

    if (gameState) {
      this.setGame(gameState);
    } else {
      this.initializeGame();
    }
  }

  initializeGame() {
    const deck = Deck.createShuffled({
      cardOptions: { faceCardUniqueValues: true },
    });
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

  copyGame(): SolitaireGame {
    const newGame = new SolitaireGame(this.getState());

    newGame.tableau = this.tableau.map((column) => {
      const newColumn = new Column();
      newColumn.cards = cloneCards(column.cards);
      return newColumn;
    });

    newGame.foundation = this.foundation.map((foundation) => {
      const newFoundation = new Foundation(foundation.suit);
      newFoundation.cards = cloneCards(foundation.cards);
      return newFoundation;
    });

    newGame.stock = new Stock({
      stock: cloneCards(this.stock.stock),
      waste: cloneCards(this.stock.cards),
    });

    newGame.history = [...this.history]; // Copy history

    return newGame;
  }

  setGame(gameState: GameState): void {
    this.score = gameState.score;
    // restore each pile with cloned cards (deep copy)
    this.tableau.forEach((column, index) => {
      column.cards = cloneCards(gameState.tableau[index]);
    });

    this.foundation.forEach((foundation, index) => {
      foundation.cards = cloneCards(gameState.foundation[index]);
    });

    this.stock = new Stock({
      stock: cloneCards(gameState.stock.stock),
      waste: cloneCards(gameState.stock.waste),
    });

    this.history = [...this.history]; // Copy history
  }

  getState(): GameState {
    return {
      score: this.score,
      tableau: this.tableau.map((column) => cloneCards(column.cards)),
      foundation: this.foundation.map((f) => cloneCards(f.cards)),
      stock: {
        stock: cloneCards(this.stock.stock),
        waste: cloneCards(this.stock.cards),
      },
    };
  }

  saveState(): void {
    const state = this.getState();
    this.history.push(state);
  }

  draw(): void {
    this.saveState();
    // if the stock pile has cards, draw from the stock pile
    if (this.stock.stock.length > 0) {
      this.stock.cards.push(this.stock.stock.pop()!.flip());
    }
    // if the stock pile is empty, move cards from waste pile to stock pile
    // and draw the top card from the waste pile
    else {
      this.updateScore(-50);
      for (const card of this.stock.cards) {
        this.stock.stock.push(card.flip());
      }

      this.stock.cards = [];

      // reverse the order of the cards in the stock pile to maintain the order
      // when moving them back to the stock pile
      this.stock.stock.reverse();

      // Draw the top card from the stock
      this.stock.cards.push(this.stock.stock.pop()!.flip());
    }
  }

  hasHistory(): boolean {
    return this.history.length > 0;
  }

  updateScore(points: number): void {
    if (this.score + points < 0) {
      this.score = 0;
      return;
    }
    this.score += points;
  }

  // move card from tableau to foundation
  moveCard(
    source: Column | Stock,
    target: Foundation | Column,
    sourceIndex: number,
    saveState = true
  ): boolean {
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
    if (saveState) {
      this.saveState();
    }

    if (target instanceof Foundation) {
      // moving to foundation earns points
      this.updateScore(5);
    }

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
      this.updateScore(15);
    }

    return true;
  }

  isValidMove(
    sourceCard: Card,
    targetCard: Card | null,
    target: Foundation | Column
  ): boolean {
    if (!sourceCard) return false;

    // target card must be different color and one value higher to play on tableau
    if (targetCard && target instanceof Column) {
      return (
        sourceCard.getColor() !== targetCard.getColor() &&
        sourceCard.getValue() === targetCard.getValue() - 1
      );
    }

    // Can't move to a foundation of a different suit
    if (target instanceof Foundation && sourceCard.suit !== target.suit) {
      return false;
    }

    // target card must be same color and one value lower to play on foundation
    if (targetCard && target instanceof Foundation) {
      return (
        sourceCard.getValue() === targetCard.getValue() + 1 &&
        sourceCard.getSuit() === targetCard.getSuit()
      );
    }

    // Only Ace can be placed on an empty foundation pile
    if (target instanceof Foundation) {
      return sourceCard.getRank() === Rank.ACE;
    }
    // Any card can be placed on an empty tableau pile (our rules)
    // standard rules are king only
    if (target instanceof Column) {
      return true;
    }
    return false;
  }

  undo(): boolean {
    const previousState = this.history.pop();

    if (!previousState) {
      return false; // No previous state to undo to
    }

    this.setGame(previousState);

    // Undo costs 50 points
    this.updateScore(-50);
    return true;
  }

  checkWin(): boolean {
    // can't have any cards in the stock or waste pile
    // if the stock pile has cards, the game is not won yet
    if (this.stock.stock.length > 0 || this.stock.cards.length > 0) {
      return false;
    }

    // Check if all foundation piles are complete (i.e., contain 13 cards each)
    if (this.foundation.every((pile) => pile.cards.length === 13)) {
      return true; // All foundation piles are complete
    }

    // if any tableau card is face down, the game is not won yet
    if (
      this.tableau.some((column) => column.cards.some((card) => !card.faceUp))
    ) {
      return false; // Not all tableau cards are face up
    }

    // create simulation game to check if the game can be won
    // by simple foundation moves
    const game = this.copyGame();
    // don't need history for simulation
    game.history = [];

    // iterates up to 12 times (stacks can be 12 high in the tableau)
    // we don't know how many times exactly
    let madeProgress = true;

    const MAX_ITERATIONS = 12; // Maximum iterations to prevent infinite loop
    let iterations = 0;
    while (madeProgress && iterations < MAX_ITERATIONS) {
      iterations++;
      madeProgress = false; // no progress made at the start of the iteration

      for (const tableau of game.tableau) {
        // don't check empty tableaus
        if (tableau.cards.length === 0) continue;

        // Check if any tableau can move to foundation
        const foundation = game.foundation.find(
          (foundation) =>
            foundation.suit === tableau.cards[tableau.cards.length - 1].suit
        );
        // Check if any foundation can accept the top card
        const success = game.moveCard(
          tableau,
          foundation!,
          tableau.cards.length - 1,
          false // Don't save state for simulation
        );
        if (success) {
          madeProgress = true;
        }
      }
    }

    // no more moves possible from tableau to foundation
    // Check if all foundation piles are complete (i.e., contain 13 cards each)
    if (game.foundation.every((pile) => pile.cards.length === 13)) {
      return true; // All foundation piles are complete
    }
    // Cards left in the tableau and no more moves to foundation possible
    return false;
  }

  resetGame(): void {
    this.score = 0;
    this.tableau = Array.from({ length: 7 }, () => new Column());
    this.foundation = [
      new Foundation(Suit.SPADES),
      new Foundation(Suit.CLUBS),
      new Foundation(Suit.HEARTS),
      new Foundation(Suit.DIAMONDS),
    ];
    this.stock = new Stock();
    this.history = [];

    this.initializeGame();
  }

  // Convert array of Cards to array of SerializableCards
  private cardsToSerializable(
    cards: Card[]
  ): Record<string, string | boolean>[] {
    return cards.map((card) => card.toJSON());
  }

  // Convert array of SerializableCards to array of Cards
  private serializableToCards(
    serialCards: Record<string, string | boolean>[]
  ): Card[] {
    console.log(serialCards);
    return serialCards.map(
      (serialCard) =>
        new Card(
          serialCard.rank as Rank,
          serialCard.suit as Suit,
          {
            faceCardUniqueValues: true,
          },
          serialCard.faceUp as boolean
        )
    );
  }

  // Get serializable state for localStorage
  getSerializableState(): SerializableGameState {
    // Convert current game state
    const serialState: SerializableGameState = {
      score: this.score,
      tableau: this.tableau.map((column) =>
        this.cardsToSerializable(column.cards)
      ),
      foundation: this.foundation.map((foundation) =>
        this.cardsToSerializable(foundation.cards)
      ),
      stock: {
        stock: this.cardsToSerializable(this.stock.stock),
        waste: this.cardsToSerializable(this.stock.cards),
      },
      history: [], // Skip history for now to avoid recursive serialization
    };

    // Optionally serialize history if needed
    serialState.history = this.history.map((state) => ({
      score: state.score,
      tableau: state.tableau.map((cardArray) =>
        this.cardsToSerializable(cardArray)
      ),
      foundation: state.foundation.map((cardArray) =>
        this.cardsToSerializable(cardArray)
      ),
      stock: {
        stock: this.cardsToSerializable(state.stock.stock),
        waste: this.cardsToSerializable(state.stock.waste),
      },
      history: [], // Don't include nested history to avoid deep recursion
    }));

    return serialState;
  }

  // Load state from serialized data
  loadState(serialState: SerializableGameState): void {
    this.score = serialState.score;

    // Restore tableau
    this.tableau.forEach((column, index) => {
      if (index < serialState.tableau.length) {
        column.cards = this.serializableToCards(serialState.tableau[index]);
      } else {
        column.cards = [];
      }
    });

    // Restore foundation
    this.foundation.forEach((foundation, index) => {
      if (index < serialState.foundation.length) {
        foundation.cards = this.serializableToCards(
          serialState.foundation[index]
        );
      } else {
        foundation.cards = [];
      }
    });

    // Restore stock and waste
    this.stock.stock = this.serializableToCards(serialState.stock.stock);
    this.stock.cards = this.serializableToCards(serialState.stock.waste);

    // Restore history if included
    this.history = serialState.history.map((historyState) => ({
      score: historyState.score,
      tableau: historyState.tableau.map((cardArray) =>
        this.serializableToCards(cardArray)
      ),
      foundation: historyState.foundation.map((cardArray) =>
        this.serializableToCards(cardArray)
      ),
      stock: {
        stock: this.serializableToCards(historyState.stock.stock),
        waste: this.serializableToCards(historyState.stock.waste),
      },
    }));
  }

  // Reset the game
  reset(): void {
    this.resetGame();
  }
}
