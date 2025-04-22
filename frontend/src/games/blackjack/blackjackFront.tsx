import React, { useState } from "react";
import { getCardBackImage } from "../utils/CardImage";
import "./blackjackStyle.css";
import { useNavigate } from "react-router-dom";
import { Typography, Box } from "@mui/material";
import { Card } from "../utils/card";
import { GameRules } from "../components/GameRules";
import { GameButton } from "../components/GameButton";
import { CardComponent } from "../components/CardComponent";
import { BlackjackClientGameState } from "./blackjackType";
import { socketManager } from "../utils/socketManager";

const BlackjackPage: React.FC = () => {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [revealDealer, setRevealDealer] = useState(false);
  const [dealerValue, setDealerValue] = useState<number | null>(null);
  const [playerValue, setPlayerValue] = useState<number>(0);

  const navigate = useNavigate();

  const updateState = (state: BlackjackClientGameState): void => {
    const tempDealerHand: Card[] = [];
    state.dealerHand.cards.forEach((card) => {
      tempDealerHand.push(new Card(card.rank, card.suit, {}, card.faceUp));
    });
    setDealerHand(tempDealerHand);
  };

  const startGame = () => {
    const fakePlayerHand = [
      { rank: "1", suit: "Clubs" },
      { rank: "1", suit: "Spades" },
    ];
    const fakeDealerHand = [
      { rank: "1", suit: "Hearts" },
      { rank: "1", suit: "Diamonds" },
    ];

    setPlayerHand(fakePlayerHand);
    setDealerHand(fakeDealerHand);
    setPlayerValue(10);
    setDealerValue(null);
    setGameResult("");
    setIsGameOver(false);
    setRevealDealer(true);
  };

  const hit = () => {
    void socketManager.gameAction("hit");
  };

  const stand = () => {
    const dealerTotal = 19;
    setDealerValue(dealerTotal);
    setRevealDealer(false);

    let result = "";
    if (playerValue > dealerTotal) {
      result = "You win!";
    } else if (playerValue < dealerTotal) {
      result = "You lose!";
    } else {
      result = "It's a draw!";
    }

    setGameResult(result);
    setIsGameOver(true);
  };

  const renderHand = (hand: Card[], hideFirst = true) => (
    <Box display="flex" gap={1}>
      {hand.map((card, idx) => (
        <CardComponent
          key={idx}
          card={card}
          isClickable={false}
          faceUp={hideFirst && idx === 0 && !revealDealer}
          onClick={() =>
            console.log(`Card clicked: ${card.rank} of ${card.suit}`)
          }
        />
      ))}
    </Box>
  );

  return (
    <Box className="blackjack-page">
      <Typography variant="h4" align="center" gutterBottom>
        Blackjack <GameRules gameType="blackjack" />
      </Typography>

      <Box display="flex" justifyContent="right" gap={2}>
        <GameButton
          className="start-btn"
          variant="contained"
          onClick={startGame}
          disabled={!isGameOver && playerHand.length > 0}
        >
          Start New Game
        </GameButton>
      </Box>

      {/* Deck Display */}
      <Box
        display="flex"
        textAlign="center"
        justifyContent="center"
        gap={4}
        mb={2}
      >
        <Box textAlign="center">
          <img
            src={getCardBackImage() }
            alt="Deck"
            style={{ width: 80, height: 120 }}
          />
          <Typography variant="body2">Deck</Typography>
        </Box>

        {/* dealers cards  */}
        <Box mb={5}>
          <Typography variant="h6">Dealer's Hand</Typography>
          {renderHand(dealerHand, true)}
          {revealDealer && dealerValue !== null && (
            <Typography variant="body2">Total: {dealerValue}</Typography>
          )}
        </Box>
      </Box>

      {/* players cards */}
      <Box display="flex" justifyContent="right" gap={2} mb={2}>
        <Typography variant="h6">Your Hand</Typography>
        {renderHand(playerHand)}
        <Typography variant="body2">Total: {playerValue}</Typography>
      </Box>
      <Typography variant="h6" align="center" gutterBottom>
        {gameResult}
      </Typography>

      {/* hit button  */}
      <Box display="flex" justifyContent="right" gap={2}>
        <GameButton
          className="hit-btn"
          variant="contained"
          onClick={hit}
          disabled={isGameOver}
        >
          Hit
        </GameButton>

        {/* stand button  */}
        <GameButton
          className="stand-btn"
          variant="contained"
          onClick={stand}
          disabled={isGameOver}
        >
          Stand
        </GameButton>
      </Box>

      {/* leaderboard button*/}
      {isGameOver && (
        <GameButton
          className="leaderboard"
          variant="contained"
          onClick={() => alert("Go to leaderboard")}
          disabled={!isGameOver}
        >
          See Leaderboard
        </GameButton>
      )}
    </Box>
  );
};

export default BlackjackPage;
