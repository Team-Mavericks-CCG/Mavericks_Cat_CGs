export class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  getValue(options = {}) {
    const { aceHigh = false } = options;

    if (this.rank === "A") {
      return aceHigh ? 11 : 1;
    } else if (["J", "Q", "K"].includes(this.rank)) {
      return 10;
    } else {
      return parseInt(this.rank, 10);
    }
  }

  getColor() {
    return this.suit === "♣" || this.suit === "♠" ? "black" : "red";
  }
}
