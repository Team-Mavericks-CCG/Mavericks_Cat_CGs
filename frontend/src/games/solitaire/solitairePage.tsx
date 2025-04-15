import React, { useEffect, useState } from "react";
import {
  SolitaireGame,
  Foundation,
  Column,
  Stock,
  SerializableGameState,
} from "./solitairePageModel";
import { Card, Suit } from "../utils/card";
import "../solitaire/solitairePage.css";
import { getAllCardImages } from "../utils/CardImage";
import { CardComponent } from "../components/CardComponent";
import { GameRules } from "../components/GameRules";
import { GameButton } from "../components/GameButton";
import { LeaderboardAPI } from "../../utils/api";
import { Typography } from "@mui/material";

export const SolitairePage: React.FC = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [forceRerender, setForceRerender] = useState(0);
  const [, setHasSavedGame] = useState(false);

  const [game] = useState(new SolitaireGame());

  // Check for saved game on component mount and load it if exists
  useEffect(() => {
    const savedGame = localStorage.getItem("solitaireGameState");
    if (savedGame) {
      setHasSavedGame(true);
      try {
        const parsedState = JSON.parse(savedGame) as SerializableGameState;
        // Need to wait until game is initialized
        setTimeout(() => {
          game.loadState(parsedState);
          setCanUndo(game.hasHistory());
          setForceRerender((prev) => prev + 1);
        }, 0);
      } catch (error) {
        console.error("Failed to load saved game:", error);
      }
    }
  }, [game]);

  // disable right click context menu
  useEffect(() => {
    // Function to prevent context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Add the event listener when component mounts
    document.addEventListener("contextmenu", preventContextMenu);

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  useEffect(() => {
    const preloadImages = async () => {
      const images = getAllCardImages();

      await Promise.all(
        images.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = src;
              img.onload = resolve;
              img.onerror = resolve; // Continue even if some fail to load
            })
        )
      );

      setImagesLoaded(true);
    };

    void preloadImages();
  }, []);

  // Save game state to localStorage - called after every game state change
  const saveGameState = () => {
    try {
      const gameState = game.getSerializableState();
      localStorage.setItem("solitaireGameState", JSON.stringify(gameState));
      setHasSavedGame(true);
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  };

  // Clear saved game
  const newGame = () => {
    localStorage.removeItem("solitaireGameState");
    setHasSavedGame(false);
    game.resetGame();
    setCanUndo(false);
    saveGameState();
    setForceRerender((prev) => prev + 1);
  };

  const moveCard = (
    source: Column | Stock,
    target: Column | Foundation,
    index: number
  ): boolean => {
    const success = game.moveCard(source, target, index);
    if (success) {
      setCanUndo(true);
      setForceRerender((prev) => prev + 1);
      saveGameState(); // Auto-save after successful move
      if (game.checkWin()) {
        win();
      }
      return true;
    }
    return false;
  };

  // Handle card click functionality with updated typing
  const handleCardClick = (
    card: Card | null,
    source: Stock | Column | Foundation,
    sourceIndex: number
  ) => {
    // can't select a face down card
    if (!card?.faceUp) {
      return;
    }

    // Only allow selecting the top card from Stock,
    // Any face up card from Column,
    // No selection from Foundation
    if (source instanceof Foundation) {
      return;
    }

    const isTopCard = source.cards[source.cards.length - 1] === card;

    // if the card isn't the top card, try to move it to somewhere else in the tableau
    // select if you can't move it to somewhere else in the tableau
    if (source instanceof Column && !isTopCard) {
      // try to move to another column in the tableau
      for (const column of game.tableau) {
        if (column !== source) {
          const success = moveCard(source, column, sourceIndex);
          if (success) {
            return;
          }
        }
      }
      return;
    }
    // if the card is the top card, try to play it on foundation
    // then try to play to tableau
    // select if you can't play it anywhere
    else if (isTopCard) {
      // if the clicked card can be played on the foundation, play it
      const foundation = game.foundation.find(
        (foundation) => foundation.suit === card?.suit
      );

      const success = moveCard(source, foundation!, sourceIndex);
      if (success) {
        return;
      }

      // try to play it on another column in the tableau
      for (const column of game.tableau) {
        if (column !== source) {
          const success = moveCard(source, column, sourceIndex);
          if (success) {
            return;
          }
        }
      }
    }
  };

  const handleStockClick = () => {
    game.draw();
    setCanUndo(true);
    setForceRerender((prev) => prev + 1);
    saveGameState(); // Auto-save after drawing from stock
  };

  const handleUndo = () => {
    const success = game.undo();
    if (success) {
      setForceRerender((prev) => prev - 1);
      setCanUndo(game.hasHistory());
      saveGameState(); // Auto-save after undo
    }
  };

  const win = () => {
    console.log("You win!");

    // iterate through the tableau and move cards to the foundation
    // we dont actually know how many iterations it will take
    // so just loop until the foundations are full
    while (game.foundation.some((foundation) => foundation.cards.length < 13)) {
      for (const column of game.tableau) {
        if (column.cards.length > 0) {
          for (const foundation of game.foundation) {
            if (
              game.moveCard(column, foundation, column.cards.length - 1, false)
            ) {
              setForceRerender((prev) => prev + 1);
              break;
            }
          }
        }
      }
    }

    saveGameState();

    if (localStorage.getItem("username") != null) {
      try {
        void LeaderboardAPI.saveGameStats("Solitaire", true, game.score);
        console.log("Game stats saved");
      } catch (error) {
        console.error("Error saving game stats:", error);
      }
    }
  };

  const renderColumn = (column: Column) => (
    <div className="stackable-pile">
      {column.cards.length === 0 ? (
        <div
          className="card-blank-clickable"
          onClick={() => handleCardClick(null, column, -1)}
        >
          {" "}
          +{" "}
        </div>
      ) : (
        column.cards.map((card, index) => (
          <CardComponent
            card={card}
            key={index}
            isClickable={card.faceUp}
            onClick={() => handleCardClick(card, column, index)}
          />
        ))
      )}
    </div>
  );

  const renderStock = (stock: Stock) => (
    <div className="pile">
      {stock.stock.length === 0 ? (
        <div
          className="card-blank-clickable"
          onClick={() => handleStockClick()}
        >
          +
        </div>
      ) : (
        <CardComponent
          card={stock.stock[stock.stock.length - 1]}
          isClickable={true}
          onClick={() => handleStockClick()}
        />
      )}
    </div>
  );

  const renderWaste = (stock: Stock) => {
    // Get only the last 3 cards (or fewer if there are less than 3)
    const visibleCards =
      stock.cards.length <= 3 ? stock.cards : stock.cards.slice(-3);

    // Handle empty waste pile
    if (visibleCards.length === 0) {
      return (
        <div className="pile">
          <div className="card-blank"></div>
        </div>
      );
    }

    return (
      <div className="stackable-pile">
        {visibleCards.map((card, index) => {
          const actualIndex = stock.cards.length - visibleCards.length + index; // Calculate the actual index in the stock

          return (
            <CardComponent
              card={card}
              key={index}
              isClickable={index === visibleCards.length - 1}
              onClick={() => handleCardClick(card, stock, actualIndex)}
            />
          );
        })}
      </div>
    );
  };

  const renderFoundation = (foundation: Foundation) => {
    const getSuitSymbol = (suit: Suit) => {
      switch (suit) {
        case Suit.CLUBS:
          return "♣";
        case Suit.DIAMONDS:
          return "♦";
        case Suit.HEARTS:
          return "♥";
        case Suit.SPADES:
          return "♠";
        default:
          return "+";
      }
    };

    return (
      <div className="pile">
        {foundation.cards.length === 0 ? (
          <div
            className="card-blank-clickable"
            onClick={() => handleCardClick(null, foundation, -1)}
          >
            {getSuitSymbol(foundation.suit)}
          </div>
        ) : (
          <CardComponent
            card={foundation.cards[foundation.cards.length - 1]}
            isClickable={false}
            onClick={() =>
              handleCardClick(
                foundation.cards[foundation.cards.length - 1],
                foundation,
                foundation.cards.length - 1
              )
            }
          />
        )}
      </div>
    );
  };

  return (
    <div className="solitaire-page" key={forceRerender}>
      {!imagesLoaded ? (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading cards...</div>
        </div>
      ) : (
        <>
          <h1>
            Solitaire <GameRules gameType="solitaire" />
          </h1>

          <div className="game-container">
            <Typography className="score">Score: {game.score}</Typography>
            <div className="stock-area">
              <div className="stock">{renderStock(game.stock)}</div>
              <div className="waste">{renderWaste(game.stock)}</div>
            </div>
            <div className="foundation">
              {game.foundation.map((pile, index) => (
                <div key={index} className="foundation-pile">
                  {renderFoundation(pile)}
                </div>
              ))}
            </div>
            <div className="tableau">
              {game.tableau.map((pile, index) => (
                <div key={index} className="tableau-pile">
                  {renderColumn(pile)}
                </div>
              ))}
            </div>

            <div className="controls-area">
              <GameButton
                className="undo-button"
                onClick={handleUndo}
                disabled={!canUndo}
                aria-label="Undo last move"
              >
                Undo
              </GameButton>

              <GameButton
                className="new-game-button"
                onClick={newGame}
                aria-label="New game"
              >
                New Game
              </GameButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SolitairePage;
