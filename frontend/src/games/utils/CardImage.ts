import { Card, Suit } from "./card";

const imageRank = {
  Ace: "Ace",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  Jack: "Jack",
  Queen: "Queen",
  King: "King",
};

const imagePath = "../gameAssets/compressed/";
const imageExtension = ".webp";

export const getCardImage = (card: Card): string => {
  if (!card.faceUp) {
    return new URL(`${imagePath}_CardBack${imageExtension}`, import.meta.url)
      .href;
  }
  return new URL(
    `${imagePath}${imageRank[card.rank]}${card.suit}${imageExtension}`,
    import.meta.url
  ).href;
};

export const getCardBackImage = (): string => {
  return new URL(`${imagePath}_CardBack${imageExtension}`, import.meta.url)
    .href;
};

export const getAllCardImages = (): string[] => {
  const cardImages = [];

  cardImages.push(`${imagePath}_CardBack${imageExtension}`); // Add the card back image
  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(imageRank)) {
      cardImages.push(
        new URL(`${imagePath}${rank}${suit}${imageExtension}`, import.meta.url)
          .href
      );
    }
  }

  return cardImages;
};
