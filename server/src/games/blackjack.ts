import { Card, Rank } from "../utils/card.js";
import { Deck } from "../utils/deck.js";
import { Game } from "./game.js";
import { GameStatus } from "./game.js";

enum BlackjackAction {
  HIT = "hit",
  STAND = "stand",
  SPLIT = "split",
}
// Hand status
enum HandStatus {
  // hand is dealt, not current turn
  WAITING = "waiting",
  // hand is active, player can hit or stand
  PLAYING = "playing",
  // player joined mid round
  INACTIVE = "inactive",
  STOOD = "stood",
  BUSTED = "busted",
  WIN = "win",
  LOSE = "lose",
}

// Player hand
interface Hand {
  cards: Card[];
  status: HandStatus;
  value: number; // to avoid recalculating
}

// Client-friendly game state (with processed data for frontend)
export interface BlackjackClientGameState {
  gameId: string;
  gameStatus: GameStatus;
  activePlayer: string | null;
  players: {
    id: string;
    name: string;
    hands: Hand[];
  }[];
  dealerHand: {
    cards: Card[];
    value: number;
  };
}

export class Blackjack extends Game {
  private deck: Deck;
  private hands: Map<string, Hand[]>;
  private dealerHand: Card[];

  constructor(gameId: string) {
    super(gameId);
    this.hands = new Map();
    this.dealerHand = [];
    this.deck = Deck.createShuffled({}, 6);
  }

  startGame(): void {
    if (this.status !== GameStatus.READY) {
      throw new Error("Game is already started or in progress");
    }
    this.deal();
    this.updateActivity();
  }

  // Calculate the value of a hand
  private calculateHandValue(cards: Card[]): number {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      // Ace is counted as 11 initially
      if (card.rank === Rank.ACE) {
        aces++;
        value += 11;
      }
      // all other cards get trivial values
      else {
        value += card.getValue();
      }
    }

    // If over 21, turn aces into 1s until <= 21 or no more aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
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

  private nextTurn(): void {
    // Move to next player
    const { wrapped } = this.getNextPlayer();

    // If we wrapped around to first player, everyone has played
    if (wrapped) {
      this.dealerPlay();
    } else {
      this.status = GameStatus.IN_PROGRESS;
    }
  }

  // Deal initial cards
  public deal(): void {
    if (this.status !== GameStatus.READY) {
      throw new Error("Cannot deal now");
    }

    // reset/initialize hands
    this.hands = new Map();
    for (const playerId of this.players.keys()) {
      this.hands.set(playerId, [
        {
          cards: [],
          status: HandStatus.WAITING,
          value: 0,
        },
      ]);
    }

    // deal 1 card to each player
    for (const playerHands of this.hands.values()) {
      // only going to be 1 hand while dealing
      for (const hand of playerHands) {
        hand.cards.push(this.draw());
        hand.status = HandStatus.WAITING;
      }
    }

    // Deal first card to dealer
    this.dealerHand.push(this.draw());
    this.dealerHand[0].flip(); // Dealer's first card is face down

    // Deal second card to each player
    for (const playerHands of this.hands.values()) {
      // only going to be 1 hand while dealing
      for (const hand of playerHands) {
        hand.cards.push(this.draw());
        hand.value = this.calculateHandValue(hand.cards);
        hand.status = HandStatus.WAITING;
      }
    }

    // Deal second card to dealer
    this.dealerHand.push(this.draw());

    this.nextTurn();

    this.updateActivity();
  }

  // Player hits (takes another card)
  public hit(playerID: string, index = 0): void {
    if (playerID !== this.activePlayer) {
      throw new Error("Not this player's turn");
    }

    const playerHands = this.hands.get(playerID);
    if (!playerHands) {
      throw new Error(`Player with ID ${playerID} not found`);
    }
    const hand = playerHands[index];

    if (hand.status !== HandStatus.PLAYING) {
      throw new Error("Cannot hit on this hand");
    }

    // Draw a card
    hand.cards.push(this.draw());
    hand.value = this.calculateHandValue(hand.cards);

    if (hand.value > 21) {
      hand.status = HandStatus.BUSTED;

      // Move to next player
      this.nextTurn();
    }

    this.updateActivity();
  }

  // Player stands (ends turn)
  public stand(playerID: string, index = 0): void {
    if (playerID !== this.activePlayer) {
      throw new Error("Not this player's turn");
    }

    const playerHands = this.hands.get(playerID);
    if (!playerHands) {
      throw new Error(`Player with ID ${playerID} not found`);
    }
    const hand = playerHands[index];

    if (hand.status !== HandStatus.PLAYING) {
      throw new Error("Cannot stand on this hand");
    }

    hand.status = HandStatus.STOOD;

    this.nextTurn();

    this.updateActivity();
  }

  // Dealer plays their turn
  private dealerPlay(): void {
    // Check if any player has a non-busted hand
    const activePlayers = Array.from(this.hands.values()).some((hands) =>
      hands.some((hand) => hand.status === HandStatus.STOOD)
    );

    // If no active players, dealer doesn't need to draw
    if (!activePlayers) {
      this.resolveHands();
      return;
    }

    // Dealer hits until 17 or higher
    while (this.calculateHandValue(this.dealerHand) < 17) {
      this.dealerHand.push(this.draw());
    }

    this.resolveHands();
  }

  // Resolve all hands and determine winners
  private resolveHands(): void {
    const dealerValue = this.calculateHandValue(this.dealerHand);

    // only consider hands that are not busted
    const playerHands = Array.from(this.hands.values()).filter((hands) =>
      hands.some((hand) => hand.status === HandStatus.STOOD)
    );

    for (const hands of playerHands) {
      for (const hand of hands) {
        if (hand.status != HandStatus.STOOD) {
          continue; // Skip busted hands
        }

        if (dealerValue > 21) {
          hand.status = HandStatus.WIN; // Dealer busted, player wins
          continue;
        }

        // hand should always have a value at this point
        // the ?? is just for type safety
        if (hand.value > dealerValue) {
          hand.status = HandStatus.WIN; // Player wins
        } else {
          hand.status = HandStatus.LOSE;
        } // Player loses
      }
    }

    this.status = GameStatus.FINISHED;
    this.updateActivity();
  }

  // Start a new round
  public newGame(): void {
    // If we're running low on cards, get a new deck
    if (this.deck.getCount() < 30) {
      this.deck = new Deck();
      this.deck.shuffle();
    }

    this.status = GameStatus.READY;
    this.deal();
    this.updateActivity();
  }

  // Update the last activity time
  public updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  // Add a player to the game
  public addPlayer(playerID: string, playerName: string): void {
    super.addPlayer(playerID, playerName);

    if (this.hands.size >= Blackjack.MAX_PLAYERS) {
      throw new Error("Game is full");
    }

    this.hands.set(playerID, [
      {
        cards: [],
        status: HandStatus.INACTIVE,
        value: 0,
      },
    ]);
  }

  // Remove a player from the game
  public removePlayer(playerID: string): void {
    super.removePlayer(playerID);

    this.hands.delete(playerID);
  }

  // Check if it's a player's turn
  public isPlayerTurn(playerID: string): boolean {
    return (
      playerID === this.activePlayer && this.status === GameStatus.IN_PROGRESS
    );
  }

  // Convert the game state to client-friendly format
  public getClientGameState(): BlackjackClientGameState {
    return {
      gameId: this.gameId,
      gameStatus: this.status,
      activePlayer: this.activePlayer,
      players: Array.from(this.hands.entries()).map(([id, hands]) => ({
        id,
        name: this.players.get(id) ?? "Unknown",
        hands: hands.map((hand) => ({
          cards: hand.cards,
          status: hand.status,
          value: hand.value,
        })),
      })),
      dealerHand: {
        cards: this.dealerHand,
        value: this.calculateHandValue(this.dealerHand),
      },
    };
  }

  handleAction(playerID: string, action: string) {
    if (this.players.get(playerID) === undefined) {
      throw new Error("Player not in game");
    }
    if (!Object.values(BlackjackAction).includes(action as BlackjackAction)) {
      throw new Error("Invalid action");
    }

    switch (action as BlackjackAction) {
      case BlackjackAction.HIT:
        this.hit(playerID);
        break;
      case BlackjackAction.STAND:
        this.stand(playerID);
        break;
      case BlackjackAction.SPLIT:
        throw new Error("Split action not implemented yet");
    }
  }
}
