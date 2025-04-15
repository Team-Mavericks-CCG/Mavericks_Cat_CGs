import React, { useRef, useState } from "react";
import { getCardImage, getCardBackImage } from "../utils/CardImage";
import "./blackjackStyle.css";
import { Typography, Box } from "@mui/material";
import { BlackjackGame } from "./blackjackModel";
import { Card } from "../utils/card";
import { GameRules } from "../components/GameRules";
import { LeaderboardAPI } from "../../utils/api";
import { GameButton } from '../components/GameButton'

const BlackjackPage: React.FC = () => {
  const gameRef = useRef<BlackjackGame>(new BlackjackGame());
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [revealDealer, setRevealDealer] = useState(false);
  const [dealerValue, setDealerValue] = useState<number | null>(null);
  const [playerValue, setPlayerValue] = useState<number>(0);

  const game = gameRef.current;

  const startGame = () => {
    game.initializeGame();
    setPlayerHand([...game.player.hand]);
    setDealerHand([...game.dealer.hand]);
    setPlayerValue(game.getHandValue(game.player.hand));
    setDealerValue(null);
    setGameResult("");
    setIsGameOver(false);
    setRevealDealer(false);
  };

  const hit = () => {
    game.hitPlayer();
    setPlayerHand([...game.player.hand]);
    const playerTotal = game.getHandValue(game.player.hand);
    setPlayerValue(playerTotal);

    if (game.player.isBusted) {
      setGameResult("You busted!");
      setIsGameOver(true);
    } else if (game.player.isStanding) {
      stand(); // if player hit to exactly 21
    }
  };

  const stand = () => {
    game.standPlayer();
    setRevealDealer(true);
    setDealerHand([...game.dealer.hand]);
    const dealerTotal = game.getHandValue(game.dealer.hand);
    setDealerValue(dealerTotal);
    const playerTotal = game.getHandValue(game.player.hand);

    let result = "";
    if (game.player.isBusted) {
      result = "You busted!";
    } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
      result = "You win!";
    } else if (playerTotal < dealerTotal) {
      result = "You lose!";
    } else {
      result = "It's a draw!";
    }

    setGameResult(result);
    setIsGameOver(true);

    const username = localStorage.getItem("username");
    if (username) {
      void LeaderboardAPI.saveGameStats("Blackjack", result === "You win!", playerTotal);
    }
  };

  const renderHand = (hand: Card[], hideFirst = false) => (
    <Box display="flex" gap={1}>
      {hand.map((card, idx) => {
        const imgSrc =
          hideFirst && idx === 0 && !revealDealer
            ? getCardBackImage()
            : getCardImage(card);
        return (
          <img
            key={idx}
            src={imgSrc}
            alt={`${card.rank} of ${card.suit}`}
            style={{ width: 80, height: 120 }}
          />
        );
      })}
    </Box>
  );

  return (
    <Box className="blackjack-page">
      <Typography variant="h4" align="center" gutterBottom>
        Blackjack <GameRules gameType="blackjack" />
      </Typography>

      {/* Deck Display */}
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <Box textAlign="center">
          <img
            src={getCardBackImage()}
            alt="Deck"
            style={{ width: 80, height: 120 }}
          />
          <Typography variant="body2">Deck</Typography>
        </Box>
      </Box>

      {/* Dealer's Hand */}
      <Box mb={2}>
        <Typography variant="h6">Dealer's Hand</Typography>
        {renderHand(dealerHand, true)}
        {revealDealer && dealerValue !== null && (
          <Typography variant="body2">Total: {dealerValue}</Typography>
        )}
      </Box>

      {/* Player's Hand */}
      <Box mb={2}>
        <Typography variant="h6">Your Hand</Typography>
        {renderHand(playerHand)}
        <Typography variant="body2">Total: {playerValue}</Typography>
      </Box>

      <Typography variant="h6" align="center" gutterBottom>
        {gameResult}
      </Typography>

      <Box display="flex" justifyContent="center" gap={2}>
        <GameButton className="start-btn"
          variant="contained"
          onClick={startGame}
          disabled={!isGameOver && playerHand.length > 0}
        >
          Start New Game
        </GameButton>
        <GameButton className="hit-btn"
          variant="contained"
          onClick={hit}
          disabled={isGameOver}
        >
          Hit
        </GameButton>
        <GameButton className="stand-btn"
          variant="contained"
          onClick={stand}
          disabled={isGameOver}
        >
          Stand
        </GameButton>
      </Box>
    </Box>
  );
};

export default BlackjackPage;
