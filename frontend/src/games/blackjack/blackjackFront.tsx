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
import React, { useState, useEffect } from "react";


const BlackjackPage: React.FC = () => {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [revealDealer, setRevealDealer] = useState(false);
  const [dealerValue, setDealerValue] = useState<number | null>(null);
  const [playerValue, setPlayerValue] = useState<number>(0);

  const navigate = useNavigate();

 
    const updateState = (state: BlackjackClientGameState) => {
      if (!state || !state.players || !Array.isArray(state.players)) {
        console.warn("Invalid or missing game state", state);
        return;
      }
      const currentPlayer = state.players.find(p => p.id === socketManager.playerID);
      if (!currentPlayer) return;
    
      const hand = currentPlayer.hands[0];
      setPlayerHand(hand.cards.map(card => new Card(card.rank, card.suit, {}, card.faceUp)));
      setPlayerValue(hand.value);
    
      setDealerHand(state.dealerHand.cards.map(card => new Card(card.rank, card.suit, {}, card.faceUp)));
      setDealerValue(state.dealerHand.value);
    
      setIsGameOver(state.gameStatus === "FINISHED");
    }; 
    
     useEffect(() => {
      socketManager.onGameStateUpdate(updateState);
      return () => socketManager.removeGameStateListener?.();
    }, []);
    

  const startGame = () => {
    const fakeDealerHand = [
      new Card("1" as Rank, "Hearts" as Suit, {}, false), // hidden card
      new Card("1" as Rank, "Diamonds" as Suit, {}, true), // visible
    ];
    
    const fakePlayerHand = [
      new Card("1" as Rank, "Clubs" as Suit),
      new Card("1" as Rank, "Spades" as Suit),
    ];
    

    setPlayerHand(fakePlayerHand);
    setDealerHand(fakeDealerHand);
    setPlayerValue(10);
    setDealerValue(null);
    setGameResult("");
    setIsGameOver(false);
    setRevealDealer(true);
  };

  {/*const hit = () => {
    void socketManager.gameAction("hit");
  };*/}
  const hit = async () => {
    try {
      await socketManager.gameAction("hit");
    } catch (err) {
      console.error("Hit action failed:", err);
      alert("Failed to hit. Make sure you're in a game and it's your turn.");
    }
  };
  

  const stand = () => {
    const flipped = dealerHand.map((card, i) =>
    i === 0 ? card.clone().flip() : card
    );
    setDealerHand(flipped);

    const dealerTotal = 19;
    setDealerValue(dealerTotal);
    setRevealDealer(true);

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
