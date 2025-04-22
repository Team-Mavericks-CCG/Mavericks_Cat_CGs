import React, { useEffect, useState } from "react";
import { getCardBackImage } from "../utils/CardImage";
import "./blackjackStyle.css";
import { useNavigate } from "react-router-dom";
import { Typography, Box } from "@mui/material";
import { Card } from "../utils/card";
import { GameRules } from "../components/GameRules";
import { GameButton } from "../components/GameButton";
import { CardComponent } from "../components/CardComponent";
import { BlackjackClientGameState, GameStatus, Hand } from "./blackjackType";
import { socketManager } from "../utils/socketManager";

const BlackjackPage: React.FC = () => {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [playerHand, setPlayerHand] = useState<Map<string, Hand[]>>(new Map());
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [revealDealer, setRevealDealer] = useState(false);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [dealerValue, setDealerValue] = useState<number | null>(null);

  const navigate = useNavigate();

  const updateState = (state: BlackjackClientGameState | null): void => {
    if (!state) {
      console.error("Game state is null or undefined");
      return;
    }

    const tempDealerHand: Card[] = [];
    state.dealerHand.cards.forEach((card) => {
      tempDealerHand.push(new Card(card.rank, card.suit, {}, card.faceUp));
    });
    setDealerHand(tempDealerHand);
    setDealerValue(state.dealerHand.value);

    state.players.forEach((player) => {
      const tempPlayerHands: Hand[] = [];
      player.hands.forEach((hand) => {
        const tempPlayerHand: Card[] = [];
        hand.cards.forEach((card) => {
          tempPlayerHand.push(new Card(card.rank, card.suit, {}, card.faceUp));
        });
        tempPlayerHands.push({
          cards: tempPlayerHand,
          status: hand.status,
          value: hand.value,
        });
      });

      setPlayerHand((prev) => {
        const newHand = new Map(prev);
        newHand.set(player.id, tempPlayerHands);
        return newHand;
      });
    });
    setActivePlayer(state.activePlayer ?? null);
    if (state.gameStatus === GameStatus.FINISHED) {
      setIsGameOver(true);
    }
  };

  useEffect(() => {
    const unsubscribe = socketManager.onGameStateUpdate(updateState);
    return () => {
      unsubscribe();
    };
  }, []);

  const startGame = () => {
    if (isGameOver) {
      setIsGameOver(false);
      setGameResult("");
      setPlayerHand(new Map());
      setDealerHand([]);
      setRevealDealer(false);
      setActivePlayer(null);
      setDealerValue(null);
    }
  };

  const hit = () => {
    if (activePlayer !== socketManager.playerID) {
      console.error("It's not your turn to hit!");
      return;
    }
    void socketManager.gameAction("hit");
  };

  const stand = () => {
    if (activePlayer !== socketManager.playerID) {
      console.error("It's not your turn to hit!");
      return;
    }
    void socketManager.gameAction("stand");
  };

  const renderHand = (hand: Card[]) => (
    <Box display="flex" gap={1}>
      {hand.map((card, index) => (
        <CardComponent
          key={`${card.rank}-${card.suit}-${index}`}
          card={card}
          isClickable={false}
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
          disabled={!isGameOver}
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
            src={getCardBackImage()}
            alt="Deck"
            style={{ width: 80, height: 120 }}
          />
          <Typography variant="body2">Deck</Typography>
        </Box>

        {/* dealers cards  */}
        <Box mb={5}>
          <Typography variant="h6">Dealer's Hand</Typography>
          {renderHand(dealerHand)}
          {revealDealer && dealerValue !== null && (
            <Typography variant="body2">Total: {dealerValue}</Typography>
          )}
        </Box>
      </Box>

      {/* players cards */}
      <Box display="flex" justifyContent="right" gap={2} mb={2}>
        <Typography variant="h6">Your Hand</Typography>
        {renderHand(playerHand.get(socketManager.playerID!)?.[0]?.cards ?? [])}
        <Typography variant="body2">
          Total: {playerHand.get(socketManager.playerID!)?.[0]?.value}
        </Typography>
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
