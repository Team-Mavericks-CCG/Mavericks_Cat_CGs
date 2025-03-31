import React, { useState } from "react";
import { SolitaireGame, Foundation, Tableau } from "./solitairePageModel";
import "../solitaire/solitairePage.css";

const SolitairePage: React.FC = () => {
  // Explicitly define the type for selectedCard
  const [selectedCard, setSelectedCard] = useState<{
    card: any;
    source: any;
  } | null>(null);

  const [game] = useState(new SolitaireGame());

  // Handle card click functionality with updated typing
  const handleCardClick = (card: any, source: any) => {
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
  const renderPile = (pile: any[], source: any) => (
    <div className="pile">
      {pile.map((card: any, index: number) => (
        <div
          className={`card ${index === pile.length - 1 ? "clickable" : ""} ${selectedCard?.card === card ? "selected" : ""}`}
          key={index}
          onClick={() => handleCardClick(card, source)}
        >
          {index === pile.length - 1 ? card.toString() : "🂠"} {/* Render card string or face-down */}
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
            {renderPile(pile.cards, pile)}
          </div>
        ))}
      </div>
      <div className="tableau">
        {game.tableau.map((pile, index) => (
          <div key={index} className="tableau-pile">
            {renderPile(pile.cards, pile)}
          </div>
        ))}
      </div>
      <div className="stock">
        {renderPile(game.stock.cards, game.stock)}
      </div>
    </div>
  );
};

export default SolitairePage;