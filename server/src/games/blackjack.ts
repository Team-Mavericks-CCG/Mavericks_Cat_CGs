import { Card, Rank } from "../utils/card.js";
import { Deck } from "../utils/deck.js";
import { Game } from "./game.js";

// Hand status
enum HandStatus {
  WAITING = "waiting",
  PLAYING = "playing",
  STOOD = "stood",
  BUSTED = "busted",
  BLACKJACK = "blackjack",
  PUSH = "push",
  WIN = "win",
  LOSE = "lose",
}

// Game status
enum GameStatus {
  DEALING = "dealing",
  PLAYER_TURN = "playerTurn",
  DEALER_TURN = "dealerTurn",
  RESOLVING = "resolving",
  COMPLETE = "complete",
}

// Player hand
interface Hand {
  cards: Card[];
  status: HandStatus;
}

// Game state for client
interface BlackjackState {
  status: GameStatus;
  currentPlayer: number;
  hands: {
    cards: Card[];
    status: string;
    value?: number;
  }[];
  dealerHand: {
    cards: Card[];
    value?: number;
  };
  deck: {
    remaining: number;
  };
}

export class Blackjack implements Game {
  private deck: Deck;
  private hands: Hand[] = [];
  private dealerHand: Card[] = [];
  private currentPlayer = 0;
  private numPlayers: number;
  private status: GameStatus = GameStatus.DEALING;
  public lastActivityTime: number;

  constructor(numPlayers: number) {
    this.numPlayers = numPlayers;
    this.deck = Deck.createShuffled({}, 6);
    this.initializeHands();
    this.lastActivityTime = Date.now();
  }

  // Initialize player hands
  private initializeHands(): void {
    this.hands = [];
    for (let i = 0; i < this.numPlayers; i++) {
      this.hands.push({
        cards: [],
        status: HandStatus.WAITING,
      });
    }
    this.dealerHand = [];
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

  // Check if a hand is a blackjack
  private isBlackjack(cards: Card[]): boolean {
    return cards.length === 2 && this.calculateHandValue(cards) === 21;
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

  // Deal initial cards
  public deal(): void {
    if (this.status !== GameStatus.DEALING) {
      throw new Error("Cannot deal now");
    }

    // Deal first card to each player
    for (let i = 0; i < this.numPlayers; i++) {
      this.hands[i].cards.push(this.draw());
      this.hands[i].status = HandStatus.PLAYING;
    }

    // Deal first card to dealer
    this.dealerHand.push(this.draw());

    // Deal second card to each player
    for (let i = 0; i < this.numPlayers; i++) {
      this.hands[i].cards.push(this.draw());

      // Check for blackjack
      if (this.isBlackjack(this.hands[i].cards)) {
        this.hands[i].status = HandStatus.BLACKJACK;
      }
    }

    // Deal second card to dealer
    this.dealerHand.push(this.draw());

    // Move to player turn or check if all players have blackjack
    this.status = GameStatus.PLAYER_TURN;
    this.currentPlayer = this.findNextActivePlayer(-1);

    // If no active players, move to dealer turn
    if (this.currentPlayer === -1) {
      this.status = GameStatus.DEALER_TURN;
      this.dealerPlay();
    }

    this.updateActivity();
  }

  // Player hits (takes another card)
  public hit(playerID: number): void {
    if (this.status !== GameStatus.PLAYER_TURN) {
      throw new Error("Not player's turn");
    }

    if (playerID !== this.currentPlayer) {
      throw new Error("Not this player's turn");
    }

    const hand = this.hands[playerID];

    if (hand.status !== HandStatus.PLAYING) {
      throw new Error("Cannot hit on this hand");
    }

    // Draw a card
    hand.cards.push(this.draw());

    // Check hand value
    const value = this.calculateHandValue(hand.cards);

    if (value > 21) {
      hand.status = HandStatus.BUSTED;
      // Move to next player
      this.currentPlayer = this.findNextActivePlayer(playerID);

      // If no more active players, move to dealer turn
      if (this.currentPlayer === -1) {
        this.status = GameStatus.DEALER_TURN;
        this.dealerPlay();
      }
    }

    this.updateActivity();
  }

  // Player stands (ends turn)
  public stand(playerID: number): void {
    if (this.status !== GameStatus.PLAYER_TURN) {
      throw new Error("Not player's turn");
    }

    if (playerID !== this.currentPlayer) {
      throw new Error("Not this player's turn");
    }

    const hand = this.hands[playerID];

    if (hand.status !== HandStatus.PLAYING) {
      throw new Error("Cannot stand on this hand");
    }

    hand.status = HandStatus.STOOD;

    // Move to next player
    this.currentPlayer = this.findNextActivePlayer(playerID);

    // If no more active players, move to dealer turn
    if (this.currentPlayer === -1) {
      this.status = GameStatus.DEALER_TURN;
      this.dealerPlay();
    }

    this.updateActivity();
  }

  // Find the next active player
  private findNextActivePlayer(currentID: number): number {
    for (let i = currentID + 1; i < this.numPlayers; i++) {
      if (this.hands[i].status === HandStatus.PLAYING) {
        return i;
      }
    }
    return -1; // No more active players
  }

  // Dealer plays their turn
  private dealerPlay(): void {
    // Check if any player has a non-busted hand
    const activePlayers = this.hands.some(
      (h) => h.status === HandStatus.STOOD || h.status === HandStatus.BLACKJACK
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
    this.status = GameStatus.RESOLVING;

    const dealerValue = this.calculateHandValue(this.dealerHand);
    const dealerHasBlackjack = this.isBlackjack(this.dealerHand);

    for (let i = 0; i < this.numPlayers; i++) {
      const hand = this.hands[i];

      // Skip already resolved hands (busted)
      if (hand.status === HandStatus.BUSTED) {
        continue;
      }

      const playerValue = this.calculateHandValue(hand.cards);

      // Handle blackjacks
      if (hand.status === HandStatus.BLACKJACK) {
        if (dealerHasBlackjack) {
          hand.status = HandStatus.LOSE;
        } else {
          hand.status = HandStatus.WIN;
        }
        continue;
      }

      // Dealer busts, all standing players win
      if (dealerValue > 21) {
        if (hand.status === HandStatus.STOOD) {
          hand.status = HandStatus.WIN;
        }
      }
      // Compare dealer and player values
      else {
        if (playerValue > dealerValue) {
          hand.status = HandStatus.WIN;
        } else {
          hand.status = HandStatus.LOSE;
        }
      }
    }

    this.status = GameStatus.COMPLETE;
    this.updateActivity();
  }

  // Start a new round
  public newRound(): void {
    // If we're running low on cards, get a new deck
    if (this.deck.getCount() < 30) {
      this.deck = new Deck();
      this.deck.shuffle();
    }

    this.initializeHands();
    this.status = GameStatus.DEALING;
    this.updateActivity();
  }

  // Update the last activity time
  public updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  // Get the current game state
  public getGameState(): BlackjackState {
    return {
      status: this.status,
      currentPlayer: this.currentPlayer,
      hands: this.hands.map((hand) => ({
        cards: hand.cards,
        status: hand.status,
        value: this.calculateHandValue(hand.cards),
      })),
      dealerHand: {
        cards: this.dealerHand,
        value: this.calculateHandValue(this.dealerHand),
      },
      deck: {
        remaining: this.deck.getCount(),
      },
    };
  }
}
