import { Card } from "../utils/card.js";
import { Game } from "./game.js";
import {
  Deck,
  GameStatus,
  WarHand,
  WarHandStatus,
  WarAction,
  WarClientGameState,
  GameType,
  GameAction,
} from "shared";

export class War extends Game {
  public static override MAX_PLAYERS = 2;

  private deck: Deck;
  private hands = new Map<string, WarHand>(); // Updated to use WarHand interface
  private currentCards = new Map<string, Card>(); // Store the current cards played by each player
  private cpuID = "cpu";
  private isWar = false;
  private warPile: Card[] = []; // Single war pile to hold all cards in the current war
  private roundWinner: string | null = null;
  private winReason = "";

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
    this.status = GameStatus.IN_PROGRESS;

    // Set all hands to PLAYING
    for (const hand of this.hands.values()) {
      hand.status = WarHandStatus.PLAYING;
    }

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
      throw new Error("Cannot deal now");
    }

    this.hands = new Map<string, WarHand>();
    for (const playerId of this.players.keys()) {
      this.initializeHand(playerId);
    }

    if (this.hands.size < 2) {
      // add a cpu player if there is only one player
      this.players.set(this.cpuID, "CPU Opponent");
      this.initializeHand(this.cpuID);
    }

    // get hands to add cards to
    const hands = Array.from(this.hands.values());

    // Deal the entire deck to both players
    for (let i = 0; this.deck.getCount() > 0; i++) {
      // Alternate between players
      const hand = hands[i % 2];

      // Add a card to the player's hand
      hand.cards.push(this.draw());
    }
  }

  public play(playerID: string): void {
    if (this.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game is not in progress");
    }

    const hand = this.hands.get(playerID); // Access the player's hand

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
      // Player has run out of cards
      this.endGame(this.getOtherPlayerId(playerID));
      return;
    }

    // Plue card into play
    this.currentCards.set(playerID, topCard);

    // If the other player is a cpu, play their turn as well
    if (this.hands.has(this.cpuID) && playerID != this.cpuID) {
      this.play(this.cpuID);
    }

    // Check if all players have played their cards
    if (this.currentCards.size === this.hands.size) {
      this.resolvePlay();
    }
  }

  private getOtherPlayerId(playerId: string): string {
    // In a 2-player game, get the ID of the other player
    for (const id of this.players.keys()) {
      if (id !== playerId) {
        return id;
      }
    }
    return this.cpuID; // Fallback to CPU if no other player found
  }

  private resolvePlay(): void {
    // Get the current cards played by each player
    const player1Id = Array.from(this.players.keys())[0];
    const player2Id = this.getOtherPlayerId(player1Id);

    const card1 = this.currentCards.get(player1Id);
    const card2 = this.currentCards.get(player2Id);

    if (!card1 || !card2) {
      console.error("Missing cards in resolvePlay");
      return;
    }

    // Add current cards to the war pile
    this.warPile.push(...this.currentCards.values());

    // Compare the cards
    const value1 = card1.getValue();
    const value2 = card2.getValue();

    if (value1 > value2) {
      this.resolveRound(player1Id);
      this.winReason = `${card1.toString()} beats ${card2.toString()}`;
    } else if (value2 > value1) {
      this.resolveRound(player2Id);
      this.winReason = `${card2.toString()} beats ${card1.toString()}`;
    } else {
      // It's a war!
      this.isWar = true;
      this.winReason = "WAR! Play again to continue the war.";

      // In a war, both players place 3 cards face down
      this.placeWarCards(player1Id, 3);
      this.placeWarCards(player2Id, 3);
    }

    // Reset for the next round
    this.currentCards.clear();

    // Set all players' hands back to PLAYING for the next round
    for (const hand of this.hands.values()) {
      hand.status = WarHandStatus.PLAYING;
    }
  }

  private placeWarCards(playerId: string, count: number): void {
    const hand = this.hands.get(playerId);
    if (!hand) return;

    // Place up to 'count' cards face down in the war pile
    for (let i = 0; i < count && hand.cards.length > 0; i++) {
      const card = hand.cards.shift();
      if (card) {
        card.flip(); // Face down for war
        this.warPile.push(card);
      }
    }

    // Check if player ran out of cards during war
    if (hand.cards.length === 0) {
      this.endGame(this.getOtherPlayerId(playerId));
    }
  }

  private resolveRound(winnerId: string): void {
    const winnerHand = this.hands.get(winnerId);
    if (!winnerHand) return;

    // Winner gets all cards in the war pile
    winnerHand.cards.push(...this.warPile);

    // Update winner info for the client
    this.roundWinner = winnerId;

    // Reset the war state
    this.warPile = [];
    this.isWar = false;
  }

  handleAction(playerId: string, action: GameAction) {
    if (this.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game is not in progress");
    }

    if (action === WarAction.Play) {
      this.play(playerId);
    } else {
      throw new Error(`Invalid action: ${action}`);
    }
  }

  newGame(): void {
    this.deck = Deck.createShuffled({}, 1); // Create a new deck with 1 deck
    this.hands.clear(); // Clear the hands for a new game
    this.status = GameStatus.READY;
  }

  public initializeHand(playerID: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.hands) {
      return;
    }
    if (this.hands.size >= War.MAX_PLAYERS) {
      throw new Error("Game is full");
    }

    this.hands.set(playerID, {
      cards: [],
      status: WarHandStatus.INACTIVE,
    });
  }

  addPlayer(playerId: string, playerName: string): void {
    super.addPlayer(playerId, playerName);
    this.initializeHand(playerId);
  }

  removePlayer(playerId: string): void {
    super.removePlayer(playerId);

    // Remove the player's hand
    this.hands.delete(playerId);

    // If the player is the CPU, remove the CPU hand
    if (playerId === this.cpuID) {
      this.hands.delete(this.cpuID);
    }
  }

  public getClientGameState(): WarClientGameState {
    return {
      gameType: GameType.WAR,
      gameStatus: this.status,
      isWar: this.isWar,
      warPileCount: this.warPile.length,
      roundWinner: this.roundWinner,
      winReason: this.winReason,
      currentCards: Object.fromEntries(
        Array.from(this.currentCards.entries()).map(([id, card]) => [id, card])
      ),
      players: Array.from(this.hands.entries()).map(([id, hand]) => ({
        id,
        name: this.players.get(id) ?? "Unknown",
        cardCount: hand.cards.length,
        hand: {
          cards: [], // Only send count, not actual cards for security
          status: hand.status,
        },
      })),
    };
  }

  private endGame(winnerId: string): void {
    console.log(`Game over! Player ${winnerId} wins.`);
    this.roundWinner = winnerId;
    this.winReason = `${this.players.get(winnerId) ?? "Player"} wins the game!`;
    this.status = GameStatus.FINISHED;
  }
}
