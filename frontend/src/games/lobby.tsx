/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Socket } from "socket.io-client";

interface GameLobbyProps {
  open: boolean;
  onClose: () => void;
  socket: Socket | null;
  gameType: string;
  onGameJoined: (gameState: unknown, playerId: string) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({
  open,
  onClose,
  socket,
  gameType,
  onGameJoined,
}) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setErrorMsg(null);
  };

  // Handle creating a new game
  const handleCreateGame = useCallback(() => {
    if (!socket || !playerName.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    // Create game request
    socket.emit(`create-${gameType}`, { playerName: playerName.trim() });

    // Handle responses
    socket.once("game-created", (data: { gameId: string }) => {
      console.log(`Created ${gameType} game with ID:`, data.gameId);
      // Wait for initial game state
      socket.once("game-state", (state: unknown) => {
        setIsLoading(false);
        onGameJoined(state, socket.id ?? "");
        onClose();
      });
    });

    socket.once("error", (error: string) => {
      setIsLoading(false);
      setErrorMsg(error);
    });
  }, [socket, playerName, gameType, onGameJoined, onClose]);

  // Handle joining an existing game
  const handleJoinGame = useCallback(() => {
    if (!socket || !gameId || !playerName.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    // Join game request
    socket.emit(`join-${gameType}`, {
      gameId,
      playerName: playerName.trim(),
    });

    // Handle responses
    socket.once("join-success", () => {
      console.log(`Joined ${gameType} game with ID:`, gameId);
      // Wait for game state
      socket.once("game-state", (state: unknown) => {
        setIsLoading(false);
        onGameJoined(state, socket.id ?? "");
        onClose();
      });
    });

    socket.once("error", (error: string) => {
      setIsLoading(false);
      setErrorMsg(error);
    });
  }, [socket, gameId, playerName, gameType, onGameJoined, onClose]);

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game
      </DialogTitle>

      <DialogContent>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Create Game" />
          <Tab label="Join Game" />
        </Tabs>

        <Box sx={{ mb: 2 }}>
          <TextField
            label="Your Name"
            fullWidth
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            margin="normal"
            disabled={isLoading}
          />
        </Box>

        {tabIndex === 1 && (
          <TextField
            label="Game ID"
            fullWidth
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            margin="normal"
            disabled={isLoading}
            placeholder="Enter the game ID to join"
          />
        )}

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>
          Cancel
        </Button>

        <Button
          onClick={tabIndex === 0 ? handleCreateGame : handleJoinGame}
          color="primary"
          variant="contained"
          disabled={
            isLoading ||
            !playerName.trim() ||
            (tabIndex === 1 && !gameId.trim())
          }
        >
          {tabIndex === 0 ? "Create Game" : "Join Game"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameLobby;
