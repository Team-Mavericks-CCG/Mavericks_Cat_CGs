// start solitaire game
import { Card, Rank, Suit } from "../utils/card";
import { Deck } from "../utils/deck";

export class SolitaireGame {
  tableau: Card[][];
  foundation: Card[][];
  stock: Card[];

  constructor() {
    const deck = new Deck();
    this.tableau = Array.from({ length: 7 }, () => []); // Initialize tableau with 7 empty piles
    this.foundation = Array.from({ length: 4 }, () => []); // Initialize foundation with 4 empty piles
    this.stock = []; // Initialize stock pile

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck.draw();
        if (card) {
          this.tableau[i].push(card);
        }
      }
    }

    while (deck.cards.length > 0) {
      const card = deck.draw();
      if (card) {
        this.stock.push(card);
      }
    }
  }

  isValidMove(sourceCard: Card, targetCard: Card): boolean {
    if (!sourceCard || !targetCard) return false;
    // Check if the source card can be placed on the target card
    return (
      sourceCard.getColor() !== targetCard.getColor() &&
      sourceCard.getRank() === targetCard.getRank() - 1
    );
  }

  moveCard(tableau: Card[][], sourceIndex: number, targetIndex: number) {
    const sourcePile = tableau[sourceIndex];
    const targetPile = tableau[targetIndex];

    if (sourcePile.length === 0) return; // No card to move

    const cardToMove = sourcePile.pop(); // Remove the top card from the source pile
    if (cardToMove) {
      targetPile.push(cardToMove); // Add the card to the target pile
    }
  }
}
