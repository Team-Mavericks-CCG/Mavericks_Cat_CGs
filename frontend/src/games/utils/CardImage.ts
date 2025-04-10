import { Card, Suit } from "./card";

// Define available themes
export enum CardTheme {
  DEFAULT = "default",
  CLASSIC = "classic",
  PIXEL = "pixel",
  // Add more themes as needed
}

// Initialize theme from localStorage or default
let currentTheme: CardTheme = (() => {
  const savedTheme = localStorage.getItem("cardTheme") as CardTheme;
  if (savedTheme && Object.values(CardTheme).includes(savedTheme)) {
    return savedTheme;
  }
  return CardTheme.DEFAULT;
})();

const basePath = "/assets/cards";
// Theme-specific paths
const themePaths = {
  [CardTheme.CLASSIC]: `${basePath}/classic/`,
  [CardTheme.DEFAULT]: `${basePath}/default/`,
  [CardTheme.PIXEL]: `${basePath}/pixel/`,
  // Add paths for additional themes
};

// Theme-specific extensions
const themeExtensions = {
  [CardTheme.CLASSIC]: ".png",
  [CardTheme.DEFAULT]: ".webp",
  [CardTheme.PIXEL]: ".webp",
  // Different themes might use different file formats
};

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

// Function to change the current theme
export const setCardTheme = (theme: CardTheme): void => {
  if (Object.values(CardTheme).includes(theme)) {
    currentTheme = theme;

    // Save the theme to localStorage for persistence
    localStorage.setItem("cardTheme", theme);

    // Dispatch a custom event so other components can react to the theme change
    window.dispatchEvent(
      new CustomEvent("cardthemechange", { detail: { theme } })
    );

    // Check if we're currently on a game page and reload if needed
    const currentPath = window.location.pathname;
    if (currentPath.includes("/games/") || currentPath.includes("/game/")) {
      // If we're on a game page, force a reload to apply the new theme
      window.location.reload();
    }
  } else {
    console.warn(`Theme '${theme}' is not available, using default theme.`);
    currentTheme = CardTheme.CLASSIC;
  }
};

// Get the current theme
export const getCurrentTheme = (): CardTheme => {
  return currentTheme;
};

// Helper to get the current theme's path
const getThemePath = (): string => {
  return themePaths[currentTheme];
};

// Helper to get the current theme's extension
const getThemeExtension = (): string => {
  return themeExtensions[currentTheme];
};

export const getCardImage = (card: Card): string => {
  if (!card.faceUp) {
    return new URL(
      `${getThemePath()}_CardBack${getThemeExtension()}`,
      import.meta.url
    ).href;
  }
  return new URL(
    `${getThemePath()}${imageRank[card.rank]}${card.suit}${getThemeExtension()}`,
    import.meta.url
  ).href;
};

export const getCardBackImage = (): string => {
  return new URL(
    `${getThemePath()}_CardBack${getThemeExtension()}`,
    import.meta.url
  ).href;
};

export const getAllCardImages = (theme?: CardTheme): string[] => {
  const cardImages = [];
  const themePath = theme ? themePaths[theme] : getThemePath();
  const themeExtension = theme ? themeExtensions[theme] : getThemeExtension();

  cardImages.push(
    new URL(`${themePath}_CardBack${themeExtension}`, import.meta.url).href
  ); // Add the card back image

  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(imageRank)) {
      cardImages.push(
        new URL(`${themePath}${rank}${suit}${themeExtension}`, import.meta.url)
          .href
      );
    }
  }

  return cardImages;
};

// Preload all themes or a specific theme
export const preloadCardTheme = (theme?: CardTheme): void => {
  if (theme) {
    // Preload a specific theme
    getAllCardImages(theme).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  } else {
    // Preload all themes
    Object.values(CardTheme).forEach((themeValue) => {
      getAllCardImages(themeValue as CardTheme).forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }
};

// Get all available themes
export const getAvailableThemes = (): CardTheme[] => {
  return Object.values(CardTheme);
};
