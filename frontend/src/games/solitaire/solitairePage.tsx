import React, { useState } from "react";
import { SolitaireGame, Foundation, Column, Stock } from "./solitairePageModel";
import { Card } from "../utils/card";
import "../solitaire/solitairePage.css";

export const SolitairePage: React.FC = () => {
  // Explicitly define the type for selectedCard
  const [selectedCard, setSelectedCard] = useState<{
    card: Card;
    source: Stock | Column;
  } | null>(null);

  const [game] = useState(new SolitaireGame());

  // Handle card click functionality with updated typing
  const handleCardClick = (card: Card | null, source: Stock | Column) => {
    if (selectedCard) {
      // If a card is already selected, try to move it to the target
      if (source !== selectedCard.source) {
        const success = game.moveCard(selectedCard.source, source);
        if (success) {
          setSelectedCard(null);
        }
      } else {
        // Deselect if clicking the same card
        setSelectedCard(null);
      }
    } else {
      // Only allow selecting the top card from any pile
      const isTopCard = source.cards[source.cards.length - 1] === card;
      if (isTopCard) {
        setSelectedCard({ card, source });
      }
    }
  };

  // Render each pile (foundation, tableau, or stock)
  const renderPile = (pile: Foundation | Stock | Column) => (
    <div className="pile">
      <div className="card-blank-clickable" onClick={() => handleCardClick(null, pile)}> + </div>
      {pile.cards.map((card: Card, index: number) => (
        <div
          className={`card ${index === pile.cards.length - 1 ? "clickable" : ""} ${selectedCard?.card === card ? "selected" : ""}`}
          key={index}
          onClick={() => handleCardClick(card, pile)}
        >
          {card.faceUp ? card.toString() : "🂠"}{" "}
          {/* Render card string or face-down */}
        </div>
      ))}
    </div>
  );

  return (
    <div className="solitaire-page">
      <h1>Solitaire</h1>
      <div className="foundation">
        {game.foundation.map((pile, index) => (
          <div key={index} className="foundation-pile">
            {renderPile(pile)}
          </div>
        ))}
      </div>
      <div className="tableau">
        {game.tableau.map((pile, index) => (
          <div key={index} className="tableau-pile">
            {renderPile(pile)}
          </div>
        ))}
      </div>
      <div className="stock">{renderPile(game.stock)}</div>
    </div>
  );
};

export default SolitairePage;
