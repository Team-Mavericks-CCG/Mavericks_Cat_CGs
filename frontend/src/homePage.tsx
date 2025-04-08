import React from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>Homepage!</h1>
      <div className="game-buttons">
        <button onClick={() => void navigate("/solitaire")}>Solitaire</button>
        <button onClick={() => void navigate("/blackjack")}>
          Multiplayer Blackjack
        </button>
      </div>
    </div>
  );
}

export default HomePage;
