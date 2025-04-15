import React, { useState } from "react";
import { Card } from "../utils/card";
import { getCardImage, getCardBackImage } from "../utils/CardImage";

// Card component with fallback handling
export const CardComponent: React.FC<{
  card: Card;
  isClickable: boolean;
  onClick: () => void;
}> = ({ card, isClickable, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const imageSrc = card.faceUp ? getCardImage(card) : getCardBackImage();
  const altText = card.faceUp ? card.toString() : "🂠";

  return (
    <div
      className={`card${card.faceUp ? " face-up" : ""}${isClickable ? " clickable" : ""}`}
      onClick={() => onClick()}
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
