import React, { useCallback } from "react";
import { Card } from "../utils/card";
import "../solitaire/solitairePage.css";
import {
  getCardImage,
  getCardBackImage,
  getAllCardImages,
} from "../utils/CardImage";
import { Button, styled, Typography, Box, Paper, Grid } from "@mui/material";
import { Socket } from "socket.io-client";

// Types for Blackjack game
interface BlackjackPlayer {
  id: string;
  name: string;
  cards: Card[];
  score: number;
  isBusted: boolean;
  isActive: boolean;
  hasStood: boolean;
}

interface BlackjackState {
  gameId: string;
  players: BlackjackPlayer[];
  dealerCards: Card[];
  dealerScore: number;
  dealerHasHiddenCard: boolean;
  currentPlayerId: string | null;
  gameStatus: "waiting" | "playing" | "roundOver" | "gameOver";
  winner: string | null;
}

// Props for BlackjackPage component
interface BlackjackPageProps {
  socket: Socket;
  gameState: BlackjackState;
  playerId: string;
}

// Styled components
const GameTable = styled(Paper)(({ theme }) => ({
  backgroundColor: "#076324",
  padding: theme.spacing(3),
  minHeight: "80vh",
  position: "relative",
  borderRadius: "15px",
  boxShadow: "0px 8px 16px rgba(0,0,0,0.25)",
}));

const PlayerArea = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "rgba(255,255,255,0.1)",
  borderRadius: "10px",
  margin: theme.spacing(1),
  minHeight: "120px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const DealerArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "rgba(0,0,0,0.15)",
  borderRadius: "10px",
  marginBottom: theme.spacing(3),
  minHeight: "120px",
}));

const CardContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  marginTop: "10px",
});

const CardImage = styled("img")({
  width: "80px",
  marginRight: "-30px",
  filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.4))",
});

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: "#f5c542",
  color: "#000",
  "&:hover": {
    backgroundColor: "#e6b71e",
  },
  "&:disabled": {
    backgroundColor: "#7c7c7c",
    color: "#fff",
  },
}));

const StatusMessage = styled(Typography)({
  color: "#fff",
  textAlign: "center",
  marginBottom: "20px",
  fontWeight: "bold",
  textShadow: "1px 1px 2px #000",
});

const BlackjackPage: React.FC<BlackjackPageProps> = ({
  socket,
  gameState,
  playerId,
}) => {
  // Preload card images (can be called once)
  getAllCardImages();

  // Game actions
  const handleStartGame = useCallback(() => {
    socket?.emit("start-blackjack", { gameId: gameState.gameId });
  }, [socket, gameState.gameId]);

  const handleHit = useCallback(() => {
    socket?.emit("blackjack-hit", { gameId: gameState.gameId });
  }, [socket, gameState.gameId]);

  const handleStand = useCallback(() => {
    socket?.emit("blackjack-stand", { gameId: gameState.gameId });
  }, [socket, gameState.gameId]);

  const handleNewRound = useCallback(() => {
    socket?.emit("blackjack-new-round", { gameId: gameState.gameId });
  }, [socket, gameState.gameId]);

  // Render player's cards
  const renderCards = (cards: Card[], hideFirst = false) => {
    return (
      <CardContainer>
        {cards.map((card, index) => (
          <CardImage
            key={`${card.suit}-${card.rank}-${index}`}
            src={
              index === 0 && hideFirst ? getCardBackImage() : getCardImage(card)
            }
            alt={`${card.rank} of ${card.suit}`}
            style={{ zIndex: index }}
          />
        ))}
      </CardContainer>
    );
  };

  // Determine if current player can take action
  const isPlayerTurn = useCallback(() => {
    return (
      gameState.currentPlayerId === playerId &&
      gameState.gameStatus === "playing"
    );
  }, [gameState.currentPlayerId, gameState.gameStatus, playerId]);

  // Find current player in game state
  const currentPlayer = useCallback(() => {
    return gameState.players.find((p) => p.id === playerId);
  }, [gameState.players, playerId]);

  // Main game view
  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: 2 }}>
      <GameTable>
        {/* Game status */}
        <StatusMessage variant="h5">
          {gameState.gameStatus === "waiting" && "Waiting for players..."}
          {gameState.gameStatus === "playing" &&
            `Current Turn: ${
              gameState.currentPlayerId === playerId
                ? "Your Turn"
                : (gameState.players.find(
                    (p) => p.id === gameState.currentPlayerId
                  )?.name ?? "Dealer")
            }`}
          {gameState.gameStatus === "roundOver" &&
            (gameState.winner
              ? `Round Over: ${gameState.winner === playerId ? "You Won!" : `${gameState.winner} Won!`}`
              : "Round Over: It's a tie!")}
          {gameState.gameStatus === "gameOver" && "Game Over!"}
        </StatusMessage>

        {/* Dealer area */}
        <DealerArea>
          <Typography variant="h6" sx={{ color: "white", mb: 1 }}>
            Dealer{" "}
            {gameState.dealerHasHiddenCard
              ? ""
              : `(Score: ${gameState.dealerScore})`}
          </Typography>
          {renderCards(gameState.dealerCards, gameState.dealerHasHiddenCard)}
        </DealerArea>

        {/* Game controls */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          {gameState.gameStatus === "waiting" && (
            <ActionButton
              onClick={handleStartGame}
              disabled={gameState.players.length < 2}
            >
              Start Game
            </ActionButton>
          )}

          {gameState.gameStatus === "playing" && (
            <>
              <ActionButton
                onClick={handleHit}
                disabled={
                  !isPlayerTurn() || (currentPlayer()?.hasStood ?? true)
                }
              >
                Hit
              </ActionButton>
              <ActionButton
                onClick={handleStand}
                disabled={
                  !isPlayerTurn() || (currentPlayer()?.hasStood ?? true)
                }
              >
                Stand
              </ActionButton>
            </>
          )}

          {(gameState.gameStatus === "roundOver" ||
            gameState.gameStatus === "gameOver") && (
            <ActionButton onClick={handleNewRound}>New Round</ActionButton>
          )}
        </Box>

        {/* Players area */}
        <Grid container spacing={2}>
          {gameState.players.map((player) => (
            <Grid key={player.id}>
              <PlayerArea
                elevation={player.id === gameState.currentPlayerId ? 8 : 1}
                sx={{
                  border: player.id === playerId ? "2px solid gold" : "none",
                  backgroundColor: player.isBusted
                    ? "rgba(255,0,0,0.1)"
                    : player.hasStood
                      ? "rgba(100,100,100,0.2)"
                      : player.id === gameState.currentPlayerId
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.1)",
                }}
              >
                <Typography variant="subtitle1" sx={{ color: "white" }}>
                  {player.id === playerId ? "You" : player.name}
                  {player.isBusted
                    ? " (Busted)"
                    : player.hasStood
                      ? " (Stood)"
                      : ""}
                </Typography>
                <Typography variant="body2" sx={{ color: "white" }}>
                  Score: {player.score}
                </Typography>
                {renderCards(player.cards)}
              </PlayerArea>
            </Grid>
          ))}

          {/* Empty player spots */}
          {Array.from({
            length: Math.max(0, 4 - gameState.players.length),
          }).map((_, i) => (
            <Grid key={`empty-${i}`}>
              <PlayerArea sx={{ opacity: 0.5 }}>
                <Typography variant="body1" sx={{ color: "white" }}>
                  Waiting for player...
                </Typography>
              </PlayerArea>
            </Grid>
          ))}
        </Grid>

        {/* Game ID display for sharing */}
        <Box sx={{ position: "absolute", bottom: "10px", right: "10px" }}>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Game ID: {gameState.gameId} (Share this to invite players)
          </Typography>
        </Box>
      </GameTable>
    </Box>
  );
};

export default BlackjackPage;
