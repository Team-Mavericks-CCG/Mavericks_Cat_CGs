import React, { useEffect, useState } from "react";
import { SolitaireGame, Foundation, Column, Stock } from "./solitairePageModel";
import { Card } from "../utils/card";
import "../solitaire/solitairePage.css";
import {
  getCardImage,
  getCardBackImage,
  getAllCardImages,
} from "../utils/CardImage";

// Card component with fallback handling
const CardComponent: React.FC<{
  card: Card;
  isClickable: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ card, isClickable, isSelected, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const imageSrc = card.faceUp ? getCardImage(card) : getCardBackImage();
  const altText = card.faceUp ? card.toString() : "🂠";

  return (
    <div
      className={`card${card.faceUp ? " face-up" : ""}${isClickable ? " clickable" : ""}${isSelected ? " selected" : ""}`}
      onClick={onClick}
    >
      {!imageError ? (
        <img
          src={imageSrc}
          alt={altText}
          className="card-image"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="card-text-fallback">{altText}</div>
      )}
    </div>
  );
};

export const SolitairePage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_gameState, setGameState] = useState(0);

  const [imagesLoaded, setImagesLoaded] = useState(false);

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

  // Explicitly define the type for selectedCard
  const [selectedCard, setSelectedCard] = useState<{
    card: Card;
    source: Stock | Column;
  } | null>(null);

  const [game] = useState(new SolitaireGame());

  // Handle card click functionality with updated typing
  const handleCardClick = (
    card: Card | null,
    source: Stock | Column | Foundation
  ) => {
    if (selectedCard) {
      // If a card is already selected, try to move it to the target
      if (source !== selectedCard.source) {
        const success = game.moveCard(selectedCard.source, source);
        if (success) {
          setSelectedCard(null);
          setGameState((prev) => prev + 1);
        } else {
          setSelectedCard(null);
        }
      } else {
        // Deselect if clicking the same card
        setSelectedCard(null);
      }
    } else {
      // Only allow selecting the top card from any pile
      const isTopCard = source.cards[source.cards.length - 1] === card;
      if (isTopCard && !(source instanceof Foundation)) {
        for (const foundation of game.foundation) {
          const success = game.moveCard(source, foundation);
          if (success) {
            setGameState((prev) => prev + 1);
            return;
          }
        }
        setSelectedCard({ card, source });
      }
    }
  };

  const handleStockClick = (stock: Stock) => {
    stock.draw();
    setSelectedCard(null);
    setGameState((prev) => prev + 1);
  };

  const renderColumn = (column: Column) => (
    <div className="stackable-pile">
      {column.cards.length === 0 ? (
        <div
          className="card-blank-clickable"
          onClick={() => handleCardClick(null, column)}
        >
          {" "}
          +{" "}
        </div>
      ) : (
        column.cards.map((card, index) => (
          <CardComponent
            card={card}
            key={index}
            isClickable={index === column.cards.length - 1}
            isSelected={selectedCard?.card === card}
            onClick={() => handleCardClick(card, column)}
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
          onClick={() => handleStockClick(stock)}
        >
          +
        </div>
      ) : (
        <CardComponent
          card={stock.stock[stock.stock.length - 1]}
          isClickable={true}
          isSelected={false}
          onClick={() => handleStockClick(stock)}
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
          return (
            <CardComponent
              card={card}
              key={index}
              isClickable={index === visibleCards.length - 1}
              isSelected={selectedCard?.card === card}
              onClick={() => handleCardClick(card, stock)}
            />
          );
        })}
      </div>
    );
  };

  const renderFoundation = (foundation: Foundation) => (
    <div className="pile">
      {foundation.cards.length === 0 ? (
        <div
          className="card-blank-clickable"
          onClick={() => handleCardClick(null, foundation)}
        >
          {" "}
          +{" "}
        </div>
      ) : (
        <CardComponent
          card={foundation.cards[foundation.cards.length - 1]}
          isClickable={false}
          isSelected={false}
          onClick={() =>
            handleCardClick(
              foundation.cards[foundation.cards.length - 1],
              foundation
            )
          }
        />
      )}
    </div>
  );

  return (
    <div className="solitaire-page">
      {!imagesLoaded ? (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading cards...</div>
        </div>
      ) : (
        <>
          <h1>Solitaire</h1>
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
          <div className="stock-area">
            <div className="stock">{renderStock(game.stock)}</div>
            <div className="waste">{renderWaste(game.stock)}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default SolitairePage;
