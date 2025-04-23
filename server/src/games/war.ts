import { Card } from "../utils/card.js";
import { Deck } from "../utils/deck.js";
import { Game } from "./game.js";
import { GameStatus } from "./game.js";

enum WarAction {
  DRAW = "draw",
}

export interface WarClientGameState {
  gameId: string;
  gameStatus: GameStatus;
  players: {
    id: string;
    name: string;
    cardsRemaining: number;
  }[];
  currentCards: {
    [playerId: string]: Card | null;
  };
  roundWinner?: string | null;
  gameWinner?: string | null;
}

export class War extends Game {
  private deck: Deck;
  private playerDecks = new Map<string, Card[]>();
  private currentCards: { [playerId: string]: Card | null } = {};
  private cpuPlayerId = "cpu";
  private gameWinner: string | null = null;

  constructor(gameId: string, hostID: string, playerName: string) {
    super(gameId, hostID, playerName);

    this.deck = Deck.createShuffled({}, 1); // Single deck for War
    this.initializePlayerDeck(hostID);
    this.addOpponent(); // Add CPU or human opponent
  }

  // Add an opponent (CPU by default, replaced by human if another player joins)
  private addOpponent(): void {
    if (this.playerDecks.size < 2) {
      this.initializePlayerDeck(this.cpuPlayerId); // Add CPU as the default opponent
    }
  }

  // Initialize a player's deck
  private initializePlayerDeck(playerId: string): void {
    const cards = this.deck.drawMultiple(26); // Each player gets half the deck
    if (!cards) {
      throw new Error("Not enough cards to initialize player deck");
    }
    this.playerDecks.set(playerId, cards);
  }

  // Add a human player to replace the CPU
  public addHumanPlayer(playerId: string, playerName: string): void {
    if (this.playerDecks.has(this.cpuPlayerId)) {
      this.playerDecks.delete(this.cpuPlayerId); // Remove the CPU
    }
    this.players.set(playerId, playerName); // Add the human player
    this.initializePlayerDeck(playerId); // Initialize their deck
  }

  // Start a new game
  public newGame(): void {
    this.status = GameStatus.READY;
    this.playerDecks.clear();
    this.currentCards = {};
    this.gameWinner = null;

    this.deck = Deck.createShuffled({}, 1); // Single deck for War
    this.initializePlayerDeck(this.hostID);
    this.addOpponent(); // Add CPU or human opponent
  }

  // Start the game
  public startGame(): void {
    if (this.status !== GameStatus.READY) {
      throw new Error("Game is already started or in progress");
    }

    if (this.playerDecks.size < 2) {
      throw new Error("Not enough players to start the game");
    }

    this.status = GameStatus.IN_PROGRESS;
    this.updateActivity();
  }

  // Handle a player's action
  public handleAction(playerID: string, action: string): void {
    if (!this.playerDecks.has(playerID)) {
      throw new Error("Player not in game");
    }

    if (action !== WarAction.DRAW) {
      throw new Error("Invalid action");
    }

    this.playRound(playerID);
  }

  // Play a round
  private playRound(playerID: string): void {
    if (this.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Cannot play a round now");
    }

    // Draw cards for both players
    const playerCard = this.drawCard(playerID);
    const opponentId = this.getOpponentId(playerID);
    const opponentCard = this.drawCard(opponentId);

    this.currentCards = {
      [playerID]: playerCard,
      [opponentId]: opponentCard,
    };

    // Determine the winner of the round
    const roundWinner = this.determineRoundWinner(playerID, opponentId);
    if (roundWinner) {
      this.collectCards(roundWinner, playerCard, opponentCard);
    }

    // Check if the game is over
    this.checkGameOver();

    this.updateActivity();
  }

  // Draw a card from a player's deck
  private drawCard(playerId: string): Card | null {
    const deck = this.playerDecks.get(playerId);
    if (!deck || deck.length === 0) {
      return null;
    }
    return deck.shift() || null;
  }

  // Determine the winner of the round
  private determineRoundWinner(playerID: string, opponentId: string): string | null {
    const playerCard = this.currentCards[playerID];
    const opponentCard = this.currentCards[opponentId];

    if (!playerCard || !opponentCard) {
      return null;
    }

    if (playerCard.getValue() > opponentCard.getValue()) {
      return playerID;
    } else if (opponentCard.getValue() > playerCard.getValue()) {
      return opponentId;
    }

    // Tie: No winner
    return null;
  }

  // Collect cards for the winner
  private collectCards(winnerId: string, ...cards: (Card | null)[]): void {
    const deck = this.playerDecks.get(winnerId);
    if (!deck) {
      throw new Error("Winner's deck not found");
    }

    for (const card of cards) {
      if (card) {
        deck.push(card);
      }
    }
  }

  // Check if the game is over
  private checkGameOver(): void {
    const playerDecks = Array.from(this.playerDecks.entries());
    const emptyDecks = playerDecks.filter(([_, deck]) => deck.length === 0);

    if (emptyDecks.length > 0) {
      this.status = GameStatus.FINISHED;
      this.gameWinner = playerDecks.find(([_, deck]) => deck.length > 0)?.[0] || null;
    }
  }

  // Get the opponent's ID
  private getOpponentId(playerID: string): string {
    const opponentId = Array.from(this.playerDecks.keys()).find((id) => id !== playerID);
    return opponentId || this.cpuPlayerId;
  }

  // Convert the game state to a client-friendly format
  public getClientGameState(): WarClientGameState {
    return {
      gameId: this.gameId,
      gameStatus: this.status,
      players: Array.from(this.playerDecks.entries()).map(([id, deck]) => ({
        id,
        name: this.players.get(id) ?? (id === this.cpuPlayerId ? "CPU" : "Unknown"),
        cardsRemaining: deck.length,
      })),
      currentCards: this.currentCards,
      roundWinner: null, // This can be updated after each round
      gameWinner: this.gameWinner,
    };
  }
}