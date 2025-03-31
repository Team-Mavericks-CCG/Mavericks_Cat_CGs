import React, { useState } from "react";
import { SolitaireGame, Foundation, Column, Stock } from "./solitairePageModel";
import { Card } from "../utils/card";
import "../solitaire/solitairePage.css";

export const SolitairePage: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_gameState, setGameState] = useState(0);

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
          <div
            className={`card ${card.faceUp ? "face-up" : ""} ${index === column.cards.length - 1 ? "clickable" : ""} ${selectedCard?.card === card ? "selected" : ""} `}
            key={index}
            onClick={() => handleCardClick(card, column)}
          >
            {card.faceUp ? card.toString() : "🂠"}{" "}
            {/* Render card string or face-down */}
          </div>
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
          {" "}
          +{" "}
        </div>
      ) : (
        <div className="card clickable" onClick={() => handleStockClick(stock)}>
          {"🂠"}
          {""}
          {/* Render card string or face-down */}
        </div>
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
          const isTopCard = index === visibleCards.length - 1;

          return (
            <div
              className={`card face-up ${isTopCard ? "clickable" : ""} ${selectedCard?.card === card ? "selected" : ""}`}
              key={index}
              // Only make the top card clickable
              onClick={
                isTopCard ? () => handleCardClick(card, stock) : undefined
              }
            >
              {card.toString()}
              {""}
              {/* Render card string */}
            </div>
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
        <div
          className="card"
          onClick={() =>
            handleCardClick(
              foundation.cards[foundation.cards.length - 1],
              foundation
            )
          }
        >
          {foundation.cards[foundation.cards.length - 1].toString()}
          {""}
          {/* Render card string or face-down */}
        </div>
      )}
    </div>
  );

  return (
    <div className="solitaire-page">
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
      <div className="stock">{renderStock(game.stock)}</div>
      <div className="waste">{renderWaste(game.stock)}</div>
    </div>
  );
};

export default SolitairePage;
