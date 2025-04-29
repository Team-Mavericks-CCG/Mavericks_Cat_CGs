import { Card, Rank } from "../utils/card.js";
import { Game } from "./game.js";
import {
  Deck,
  GameStatus,
  BlackjackHand,
  BlackjackHandStatus,
  BlackjackAction,
  GameAction,
  BlackjackClientGameState,
  GameType,
} from "shared";

export class Blackjack extends Game {
  private deck: Deck;
  private hands = new Map<string, BlackjackHand[]>();
  private dealerHand: Card[] = [];

  constructor(gameId: string, hostID: string, playerName: string) {
    super(gameId, hostID, playerName);

    this.deck = Deck.createShuffled({}, 6);

    this.initializeHand(hostID);
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

    // reset active player
    this.activePlayer = null;

    // reset/initialize hands
    this.hands = new Map();
    for (const playerId of this.players.keys()) {
      this.hands.set(playerId, [
        {
          cards: [],
          status: BlackjackHandStatus.WAITING,
          value: 0,
        },
      ]);
    }

    // reset dealer hand
    this.dealerHand = [];

    // deal 1 card to each player
    for (const playerHands of this.hands.values()) {
      // only going to be 1 hand while dealing
      for (const hand of playerHands) {
        hand.cards.push(this.draw());
        hand.status = BlackjackHandStatus.WAITING;
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
        hand.status = BlackjackHandStatus.WAITING;
      }
    }

    // Deal second card to dealer
    this.dealerHand.push(this.draw());

    this.nextTurn();

    this.updateActivity();
  }

  // Player hits (takes another card)
  public hit(playerID: string, index = 0): void {
    const playerHands = this.hands.get(playerID);
    if (!playerHands) {
      throw new Error(`Player with ID ${playerID} not found`);
    }
    const hand = playerHands[index];

    if (hand.status !== BlackjackHandStatus.WAITING) {
      throw new Error("Cannot hit on this hand");
    }

    // Draw a card
    hand.cards.push(this.draw());
    hand.value = this.calculateHandValue(hand.cards);

    if (hand.value > 21) {
      hand.status = BlackjackHandStatus.BUSTED;

      // Move to next player
      this.nextTurn();
    }

    this.updateActivity();
  }

  // Player stands (ends turn)
  public stand(playerID: string, index = 0): void {
    const playerHands = this.hands.get(playerID);
    if (!playerHands) {
      throw new Error(`Player with ID ${playerID} not found`);
    }
    const hand = playerHands[index];

    if (hand.status !== BlackjackHandStatus.WAITING) {
      throw new Error("Cannot stand on this hand");
    }

    hand.status = BlackjackHandStatus.STOOD;

    this.nextTurn();

    this.updateActivity();
  }

  // Dealer plays their turn
  private dealerPlay(): void {
    // Check if any player has a non-busted hand
    const activePlayers = Array.from(this.hands.values()).some((hands) =>
      hands.some((hand) => hand.status === BlackjackHandStatus.STOOD)
    );

    // If no active players, dealer doesn't need to draw
    if (!activePlayers) {
      this.resolveHands();
      return;
    }

    // Reveal dealer's face-down card
    this.dealerHand[0].flip(); // Dealer's first card is face up

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
      hands.some((hand) => hand.status === BlackjackHandStatus.STOOD)
    );

    for (const hands of playerHands) {
      for (const hand of hands) {
        if (hand.status != BlackjackHandStatus.STOOD) {
          continue; // Skip busted hands
        }

        if (dealerValue > 21) {
          hand.status = BlackjackHandStatus.WIN; // Dealer busted, player wins
          continue;
        }

        // hand should always have a value at this point
        // the ?? is just for type safety
        if (hand.value > dealerValue) {
          hand.status = BlackjackHandStatus.WIN; // Player wins
        } else {
          hand.status = BlackjackHandStatus.LOSE;
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
    this.initializeHand(playerID);
  }

  public initializeHand(playerID: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.hands) {
      return;
    }
    if (this.hands.size >= Blackjack.MAX_PLAYERS) {
      throw new Error("Game is full");
    }

    this.hands.set(playerID, [
      {
        cards: [],
        status: BlackjackHandStatus.INACTIVE,
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
      gameType: GameType.BLACKJACK,
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

  handleAction(playerID: string, action: GameAction) {
    if (this.players.get(playerID) === undefined) {
      throw new Error("Player not in game");
    }

    if (this.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game is not in progress");
    }

    if (this.activePlayer !== playerID) {
      throw new Error("Not this player's turn");
    }

    if (this.hands.get(playerID) === undefined) {
      throw new Error("Player has no hand");
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
