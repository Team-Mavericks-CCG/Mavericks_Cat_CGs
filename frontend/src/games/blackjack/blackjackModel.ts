// Blackjack game model

import { Card } from "../utils/card";

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: string; 
  color: "red" | "black"; 
  faceUp: boolean;
}
  
  export interface Hand {
    cards: Card[];
    total: number;
    isBusted: boolean;
  }
  
  export interface SerializableBlackjackState {
    playerHand: Hand;
    dealerHand: Hand;
    gameOver: boolean;
    result: "win" | "lose" | "draw" | "in-progress";
  }
  
  export class BlackjackGame {
    deck: Card[] = [];
    playerHand: Hand = { cards: [], total: 0, isBusted: false };
    dealerHand: Hand = { cards: [], total: 0, isBusted: false };
    gameOver = false;
    result: "win" | "lose" | "draw" | "in-progress" = "in-progress";
  
    constructor() {
      this.initializeDeck();
      this.shuffleDeck();
    }
  
    // Initialize deck of 52 cards
    private initializeDeck() {
      const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
      const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  
      for (const suit of suits) {
        for (const rank of ranks) {
          this.deck.push({ 
            suit, 
            rank, 
            color: suit === "hearts" || suit === "diamonds" ? "red" : "black", 
            faceUp: false 
          });
        }
      }
    }
  
    // Shuffle the deck using Fisher-Yates shuffle
    private shuffleDeck() {
      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
    }
  
    // Draw a card from the deck
    private drawCard(): Card {
      return this.deck.pop()!;
    }
  
    // Calculate the total of a hand
    private calculateHandTotal(hand: Hand): number {
      let total = 0;
      let aceCount = 0;
  
      for (const card of hand.cards) {
        if (["J", "Q", "K"].includes(card.rank)) {
          total += 10;
        } else if (card.rank === "A") {
          total += 11;
          aceCount++;
        } else {
          total += parseInt(card.rank, 10);
        }
      }
  
      // Adjust for aces if necessary (if total exceeds 21, treat ace as 1)
      while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
      }
  
      return total;
    }
  
    // Deal initial cards
    public deal() {
      this.playerHand.cards = [this.drawCard(), this.drawCard()];
      this.dealerHand.cards = [this.drawCard(), this.drawCard()];
  
      this.playerHand.total = this.calculateHandTotal(this.playerHand);
      this.dealerHand.total = this.calculateHandTotal(this.dealerHand);
  
      this.gameOver = false;
      this.result = "in-progress";
    }
  
    // Player hits (draws another card)
    public playerHit() {
      if (this.gameOver) return;
      this.playerHand.cards.push(this.drawCard());
      this.playerHand.total = this.calculateHandTotal(this.playerHand);
  
      if (this.playerHand.total > 21) {
        this.playerHand.isBusted = true;
        this.gameOver = true;
        this.result = "lose";
      }
    }
  
    // Player stands (ends their turn)
    public playerStand() {
      if (this.gameOver) return;
      this.dealerPlay();
    }
  
    // Dealer's turn to play
    private dealerPlay() {
      while (this.dealerHand.total < 17) {
        this.dealerHand.cards.push(this.drawCard());
        this.dealerHand.total = this.calculateHandTotal(this.dealerHand);
      }
  
      if (this.dealerHand.total > 21) {
        this.dealerHand.isBusted = true;
        this.result = "win";
      } else if (this.dealerHand.total > this.playerHand.total) {
        this.result = "lose";
      } else if (this.dealerHand.total < this.playerHand.total) {
        this.result = "win";
      } else {
        this.result = "draw";
      }
  
      this.gameOver = true;
    }
  
    // Serialize game state to save
    public getSerializableState(): SerializableBlackjackState {
      return {
        playerHand: this.playerHand,
        dealerHand: this.dealerHand,
        gameOver: this.gameOver,
        result: this.result,
      };
    }
  
    // Load a saved game state
    public loadState(state: SerializableBlackjackState) {
      this.playerHand = state.playerHand;
      this.dealerHand = state.dealerHand;
      this.gameOver = state.gameOver;
      this.result = state.result;
    }
  }
  