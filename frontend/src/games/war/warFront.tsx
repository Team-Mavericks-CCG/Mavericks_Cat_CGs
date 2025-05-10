import React, { useEffect, useState } from "react";
import "./war.css";
import { Typography, Box } from "@mui/material";
import { GameRules } from "../components/GameRules";
import { GameButton } from "../components/GameButton";
import { CardComponent } from "../components/CardComponent";
import {
  WarClientGameState,
  GameStatus,
  Card,
  ClientGameState,
  GameType,
} from "shared";
import { socketManager } from "../utils/socketManager";

const WarPage: React.FC = () => {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [playerCards, setPlayerCards] = useState<Map<string, Card | null>>(
    new Map()
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketManager.isConnected) {
      setIsConnecting(true);

      // Connect socket with a timeout
      const connectPromise = socketManager.connect();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Connection timed out")), 10000); // 10 second timeout
      });

      // Race between connection and timeout
      void Promise.race([connectPromise, timeoutPromise])
        .then(() => {
          setIsConnected(true);
          setIsConnecting(false);
        })
        .catch((error) => {
          console.error("Socket connection failed:", error);
          setIsConnecting(false);
        });
    } else {
      setIsConnected(true);
    }

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socketManager.socket?.on("disconnect", handleDisconnect);

    let unsubscribe: () => void;

    if (isConnected) {
      unsubscribe = socketManager.onGameStateUpdate(
        (state: ClientGameState | null) => {
          if (!state || state.gameType !== GameType.WAR) {
            console.error("Game state is not a valid war game state.");
            return;
          }

          const tempPlayerCards = new Map<string, Card | null>();
          state.players.forEach((player) => {
            const topCard = player.hand.cards[0] ?? null;
            tempPlayerCards.set(player.id, topCard);
          });

          setPlayerCards(tempPlayerCards);

          if (state.gameStatus === GameStatus.FINISHED) {
            setIsGameOver(true);
            resolveGame(state);
          } else {
            setIsGameOver(false);
            setGameResult("");
          }
        }
      );
    }
    return () => {
      socketManager.socket?.off("disconnect", handleDisconnect);
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  const resolveGame = (state: WarClientGameState) => {
    const winner = state.players.find(
      (player) => player.hand?.cards.length > 0
    );
    if (winner?.id === socketManager.playerID) {
      setGameResult("You Win!");
    } else {
      setGameResult("You Lose!");
    }
  };

  return (
    <Box className="war-page">
      <Typography variant="h4" align="center" gutterBottom>
        War <GameRules gameType="war" />
      </Typography>

      {!isConnecting && (
        <>
          {/* Players' cards */}
          <Box
            display="grid"
            gridTemplateColumns="repeat(2, 1fr)"
            gap={4}
            mb={5}
          >
            {Array.from(playerCards.entries()).map(([id, card]) => (
              <Box key={id} textAlign="center">
                <Typography variant="h6">
                  {socketManager.gameState?.players.find((p) => p.id === id)
                    ?.name ?? "Unknown"}
                </Typography>
                {card ? (
                  <CardComponent
                    card={card}
                    isClickable={false}
                    onClick={() => {
                      return;
                    }}
                  />
                ) : (
                  <Typography variant="body2">No card</Typography>
                )}
              </Box>
            ))}
          </Box>

          {/* Game result */}
          {gameResult && (
            <Typography variant="h5" align="center" gutterBottom>
              {gameResult}
            </Typography>
          )}

          {/* Buttons */}
          <Box display="flex" justifyContent="center" gap={2}>
            <GameButton
              variant="contained"
              onClick={() => {
                return;
              }}
              disabled={isGameOver}
            >
              Play
            </GameButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default WarPage;
