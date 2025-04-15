import React, { useState } from "react";
import {
  getCardImage,
  getCardBackImage,
} from "../utils/CardImage";
import "./blackjack.css";
import { Button, Typography, Box, Paper} from "@mui/material";
import { BlackjackGame, Card } from "./blackjackModel"; 

const BlackjackPage: React.FC = () => {
  const [game, setGame] = useState<BlackjackGame>(new BlackjackGame());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<string>("");

  const startGame = () => {
    game.deal(); // Deal initial cards
    setGameResult("");
    setIsGameOver(false);
    setGame(new BlackjackGame()); // Trigger re-render
  };

  const hit = () => {
    game.playerHit(); // Player hits (draws a card)
    if (game.playerHand.isBusted) {
      setGameResult("You busted!");
      setIsGameOver(true);
    }
    setGame(new BlackjackGame()); // Trigger re-render
  };

  const stand = () => {
    game.playerStand(); // Player stands (dealer's turn)
    setGameResult(game.result === "win" ? "You win!" : game.result === "lose" ? "You lose!" : "It's a draw!");
    setIsGameOver(true);
    setGame(new BlackjackGame()); // Trigger re-render
  };

  const renderHand = (hand: Card[], hideFirst = false) => (
    <Box display="flex" gap={1}>
      {hand.map((card, idx) => {
        const imgSrc = hideFirst && idx === 0 && !isGameOver
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
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Blackjack
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Dealer's Hand</Typography>
        {renderHand(game.dealerHand.cards, true)} {/* Hide the dealer's first card initially */}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Player's Hand</Typography>
        {renderHand(game.playerHand.cards)} {/* Show all player's cards */}
      </Paper>

      <Typography variant="h6" align="center" gutterBottom>
        {gameResult && <span>{gameResult}</span>}
      </Typography>

        <Box display="flex" justifyContent="center" gap={2}>
            <Button
            variant="contained"
            color="primary"
            onClick={startGame}
            disabled={!isGameOver}
            >
            Start New Game
            </Button>
            <Button
            variant="contained"
            color="secondary"
            onClick={hit}
            disabled={isGameOver}
            >
            Hit
            </Button>
            <Button
            variant="contained"
            color="secondary"
            onClick={stand}
            disabled={isGameOver}
            >
            Stand
            </Button>

        </Box>
      </Box>
  );
};

export default BlackjackPage;
