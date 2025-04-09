import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { socketManager } from "../utils/socketManager";
import { useGameSocket } from "../utils/useGameSocket";
import GameLobby from "../lobby";
import BlackjackPage from "./blackjackPage";

const BlackjackWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [showLobby, setShowLobby] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use our game socket hook for blackjack
  const { connect, isConnected, gameState, playerId, error, isLoading } =
    useGameSocket("blackjack");

  // Connect to the socket server on component mount
  useEffect(() => {
    const initConnection = async () => {
      setIsConnecting(true);
      try {
        await connect();
        setIsConnecting(false);
      } catch {
        setConnectionError(
          "Failed to connect to game server. Please try again later."
        );
        setIsConnecting(false);
      }
    };

    void initConnection();

    // Clean up on unmount
    return () => {
      socketManager.disconnect();
    };
  }, [connect]);

  // Open the lobby when connected but no game is joined
  useEffect(() => {
    if (isConnected && !gameState && !showLobby && !isLoading) {
      setShowLobby(true);
    }
  }, [isConnected, gameState, showLobby, isLoading]);

  // Handle game join from lobby
  const handleGameJoined = (newGameState: unknown) => {
    console.log("Game joined:", newGameState);
    // The useGameSocket hook will automatically update the game state
    setShowLobby(false);
  };

  // If still connecting, show loading
  if (isConnecting) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Connecting to game server...
        </Typography>
      </Box>
    );
  }

  // If connection error, show error message
  if (connectionError) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Connection Error
          </Typography>
          <Typography variant="body1">{connectionError}</Typography>
          <Button
            variant="contained"
            onClick={() => {
              void navigate("/");
            }}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  // If there's a game error, show it
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Game Error
          </Typography>
          <Typography variant="body1" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setShowLobby(true);
            }}
          >
            Return to Lobby
          </Button>
        </Paper>
      </Box>
    );
  }

  // If there's a game state, show the game
  if (gameState && socketManager.socket) {
    return (
      <>
        <BlackjackPage
          socket={socketManager.socket}
          gameState={gameState}
          playerId={playerId}
        />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button variant="outlined" onClick={() => setShowLobby(true)}>
            Lobby
          </Button>
        </Box>
      </>
    );
  }

  // Show lobby dialog
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <Typography variant="h3" gutterBottom>
          Blackjack
        </Typography>
        <Typography variant="body1" paragraph>
          Play Blackjack against friends or other players online.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => setShowLobby(true)}
        >
          Enter Lobby
        </Button>
      </Box>

      <GameLobby
        open={showLobby}
        onClose={() => {
          // Don't navigate away, just close the lobby
          setShowLobby(false);
        }}
        socket={socketManager.socket}
        gameType="blackjack"
        onGameJoined={handleGameJoined}
      />
    </>
  );
};

export default BlackjackWrapper;
