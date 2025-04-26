import { Card } from "../utils/card.js";
import { Game } from "./game.js";
import { 
  Deck,
  GameStatus, 
  WarHand, 
  WarHandStatus, 
  WarAction,
  GameAction, 
  WarClientGameState 
} from "shared";

export class War extends Game {
  handleAction(playerId: string, action: string): unknown {
    throw new Error("Method not implemented.");
  }
  newGame(): void {
    throw new Error("Method not implemented.");
  }
  public static override MAX_PLAYERS = 2;

  private deck: Deck;
  private hands = new Map<string, WarHand>(); // Updated to use WarHand interface
  private currentCards: Record<string, Card> = {}; // Store the current cards played by each player
  private cpuID = "cpu";

  constructor(gameId: string, hostID: string, playerName: string) {
    super(gameId, hostID, playerName);

    this.deck = Deck.createShuffled({}, 1); // Create a new deck with 1 deck

    this.initializeHand(hostID);
  }

  startGame(): void {
    if (this.status !== GameStatus.READY) {
      throw new Error("Game is already started or in progress");
    }
    this.deal();
    this.updateActivity();
  }

  private draw(): Card {
    const card = this.deck.draw();
    // will never actually be empty
    // just for type safety
    if (!card) {
      throw new Error("Deck is empty, cannot draw a card");
    }
    return card;
  }

  private deal(): void {
    if (this.status !== GameStatus.READY) {
      throw new Error("Cannot deal now")
    }

    this.hands = new Map();
    for (const playerId of this.players.keys()) {
      this.hands.set(playerId, [
        {
          cards: [],  
          status: WarHandStatus.WAITING,
        },
      ]);
    }

    // Deal the entire deck to both players
    for (let i = 0; this.deck.getCount() > 0; i++) {
      // Alternate between players
      const playerId = Array.from(this.hands.keys())[i % this.hands.size];
      const hand = this.hands.get(playerId)?.[0]; // Directly access the first hand

      if (!hand) {
        throw new Error(`Player with ID ${playerId} does not have a valid hand`);
      }

      // Add a card to the player's hand
      hand.cards.push(this.draw());
    }
  }

  public play(playerID: string): void {
    if (this.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game is not in progress");
    }
  
    const hand = this.hands.get(playerID)?.[0]; // Access the player's hand
    if (!hand) {
      throw new Error(`Player with ID ${playerID} not found`);
    }

    if (hand.status !== WarHandStatus.PLAYING) {
      throw new Error("Cannot play now, hand is not playable");
    }

    hand.status = WarHandStatus.WAITING;
    // Take the top card from the player's hand
    const topCard = hand.cards.shift();
    if (!topCard) {
      throw new Error("No cards left to play");
    }
  
    // Put the card into play
    this.currentCards[playerID] = topCard;
  
    console.log(`Player ${playerID} played ${topCard.rank} of ${topCard.suit}`);
  
    // Check if all players have played their cards
    if (Object.keys(this.currentCards).length === this.hands.size) {
      this.resolvePlay();
    }
  }

  private resolvePlay(): void {
    const playerCards = Object.entries(this.currentCards).map(([playerId, card]) => ({ playerId, card }));
    const winningCard = playerCards.reduce((prev, curr) => (prev.card.rank > curr.card.rank ? prev : curr));
  
    // Check if the cards are equal (tie)
    const isTie = playerCards.every(({ card }) => card.rank === winningCard.card.rank);
  
    if (isTie) {
      console.log("It's a tie! Entering war...");
      this.handleWar(playerCards);
      return;
    }
  
    // Determine the winner and loser
    for (const { playerId, card } of playerCards) {
      const hand = this.hands.get(playerId)?.[0]; // Access the player's hand
      if (!hand) {
        throw new Error(`Player with ID ${playerId} not found`);
      }
  
      if (card === winningCard.card) {
        hand.status = WarHandStatus.WIN;
      } else {
        hand.status = WarHandStatus.LOSE;
      }
    }
  
    // Transfer cards from the loser to the winner
    const winner = playerCards.find(({ playerId }) => {
      const hand = this.hands.get(playerId)?.[0];
      return hand?.status === WarHandStatus.WIN;
    });
  
    const loser = playerCards.find(({ playerId }) => {
      const hand = this.hands.get(playerId)?.[0];
      return hand?.status === WarHandStatus.LOSE;
    });
  
    if (winner && loser) {
      const winnerHand = this.hands.get(winner.playerId)?.[0];
      const loserHand = this.hands.get(loser.playerId)?.[0];
  
      if (winnerHand && loserHand) {
        // Winner takes the cards
        winnerHand.cards.push(...loserHand.cards.splice(0, loserHand.cards.length));
        console.log(`Player ${winner.playerId} wins the round and takes all cards from Player ${loser.playerId}`);
      }
    }
  
    // Clear the current cards for the next round
    this.currentCards = {};
  
    // Set all players' hands to PLAYING for the next round
    for (const hands of this.hands.values()) {
      const hand = hands[0];
      hand.status = WarHandStatus.PLAYING;
    }
  }

  private handleWar(playerCards: { playerId: string; card: Card }[]): void {
    console.log("War! Each player places 3 cards face down and 1 card face up.");
  
    const warCards: { playerId: string; faceDown: Card[]; faceUp: Card | null }[] = [];
  
    for (const { playerId } of playerCards) {
      const hand = this.hands.get(playerId)?.[0];
      if (!hand || hand.cards.length < 4) {
        console.log(`Player ${playerId} does not have enough cards for war. They lose.`);
        this.endGame(playerId === playerCards[0].playerId ? playerCards[1].playerId : playerCards[0].playerId);
        return;
      }
  
      // Each player places 3 cards face down and 1 card face up
      const faceDown = [hand.cards.shift(), hand.cards.shift(), hand.cards.shift()].filter(Boolean) as Card[];
      const faceUp = hand.cards.shift() || null;
  
      warCards.push({ playerId, faceDown, faceUp });
    }
  
    // Compare the face-up cards
    const winningCard = warCards.reduce((prev, curr) => (prev.faceUp!.rank > curr.faceUp!.rank ? prev : curr));
  
    const isTie = warCards.every(({ faceUp }) => faceUp!.rank === winningCard.faceUp!.rank);
  
    if (isTie) {
      console.log("War continues! Another tie.");
      this.handleWar(warCards.map(({ playerId, faceUp }) => ({ playerId, card: faceUp! })));
      return;
    }
  
    // Winner takes all cards in play
    const winnerId = winningCard.playerId;
    const winnerHand = this.hands.get(winnerId)?.[0];
    if (!winnerHand) {
      throw new Error(`Winner with ID ${winnerId} not found`);
    }
  
    console.log(`Player ${winnerId} wins the war and takes all cards!`);
    for (const { faceDown, faceUp } of warCards) {
      winnerHand.cards.push(...faceDown);
      if (faceUp) winnerHand.cards.push(faceUp);
    }
  
    // Clear the current cards for the next round
    this.currentCards = {};
  
    // Set all players' hands to PLAYING for the next round
    for (const hands of this.hands.values()) {
      const hand = hands[0];
      hand.status = WarHandStatus.PLAYING;
    }
  }

  public initializeHand(playerID: string): void {
    if (!this.hands) {
      return;
    }
    if (this.hands.size >= War.MAX_PLAYERS) {
      throw new Error("Game is full");
    }

    this.hands.set(playerID, [
      {
        cards: [],
        status: WarHandStatus.INACTIVE,
      },
    ]);
  }

  public getClientGameState(): WarClientGameState {
    return {
      gameType: "War",
      gameStatus: this.status,
      players: Array.from(this.hands.entries()).map(([id, hands]) => ({
        id,
        name: this.players.get(id) ?? "Unknown",
        hands: hands.map((hand) => ({
          cards: hand.cards,
          status: hand.status,
        })),
      })),
    };
  }

  private endGame(winnerId: string): void {
    console.log(`Game over! Player ${winnerId} wins.`);
    this.status = GameStatus.ENDED;
  }
}