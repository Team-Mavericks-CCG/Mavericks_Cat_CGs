import React, { useState, useCallback, useEffect } from "react";
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
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import { Socket } from "socket.io-client";

interface GameInfo {
  gameId: string;
  type: string;
  playerCount: number;
  joinable: boolean;
}

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
  const [activeGames, setActiveGames] = useState<GameInfo[]>([]);
  const [refreshingGames, setRefreshingGames] = useState(false);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setErrorMsg(null);
  };

  // Fetch active games
  const fetchActiveGames = useCallback(() => {
    if (!socket) return;

    setRefreshingGames(true);

    // Request active games
    socket.emit("get-active-games");

    // Handle response
    const handleLobbyUpdate = (games: GameInfo[]) => {
      // Filter games by type if a specific type is requested
      const filteredGames = gameType
        ? games.filter(
            (game) => game.type.toLowerCase() === gameType.toLowerCase()
          )
        : games;

      setActiveGames(filteredGames);
      setRefreshingGames(false);
    };

    socket.once("lobby-update", handleLobbyUpdate);

    // Handle error
    socket.once("error", (error: string) => {
      console.error("Error fetching games:", error);
      setRefreshingGames(false);
    });
  }, [socket, gameType]);

  // Fetch games when component loads and socket changes
  useEffect(() => {
    if (socket && open) {
      fetchActiveGames();
    }

    // Set up periodic refresh of active games
    const intervalId = setInterval(() => {
      if (socket && open) {
        fetchActiveGames();
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [socket, fetchActiveGames, open]);

  // Handle selecting a game from the list
  const handleGameSelect = (selectedGameId: string) => {
    setGameId(selectedGameId);
    setTabIndex(1); // Switch to Join Game tab
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
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game Lobby
      </DialogTitle>

      <DialogContent>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Browse Games" />
          <Tab label="Create Game" />
          <Tab label="Join by ID" />
        </Tabs>

        {/* Common player name field across all tabs */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Your Name"
            fullWidth
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            margin="normal"
            disabled={isLoading}
            required
            helperText="Enter a name to identify yourself to other players"
          />
        </Box>

        {/* Browse Games Tab */}
        {tabIndex === 0 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Available Games</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={fetchActiveGames}
                disabled={refreshingGames}
              >
                {refreshingGames ? <CircularProgress size={20} /> : "Refresh"}
              </Button>
            </Box>

            <Paper
              variant="outlined"
              sx={{ maxHeight: "300px", overflow: "auto" }}
            >
              {activeGames.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    {refreshingGames
                      ? "Loading games..."
                      : "No active games found. Create a new game!"}
                  </Typography>
                </Box>
              ) : (
                <List>
                  {activeGames.map((game, index) => (
                    <React.Fragment key={game.gameId}>
                      {index > 0 && <Divider />}
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <Chip
                            label={`${game.playerCount} player${game.playerCount !== 1 ? "s" : ""}`}
                            color={game.joinable ? "success" : "error"}
                            size="small"
                          />
                        }
                      >
                        <ListItemButton
                          onClick={() => handleGameSelect(game.gameId)}
                          disabled={!game.joinable || isLoading}
                        >
                          <ListItemText
                            primary={`${game.type.charAt(0).toUpperCase() + game.type.slice(1)} Game`}
                            secondary={`ID: ${game.gameId.substring(0, 8)}...`}
                          />
                        </ListItemButton>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        )}

        {/* Create Game Tab */}
        {tabIndex === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography>
              Create a new {gameType} game that others can join. You'll be the
              first player.
            </Typography>
          </Box>
        )}

        {/* Join Game by ID Tab */}
        {tabIndex === 2 && (
          <Box>
            <TextField
              label="Game ID"
              fullWidth
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              margin="normal"
              disabled={isLoading}
              placeholder="Enter the game ID to join"
              helperText="Get this from the person who created the game"
            />
          </Box>
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

        {tabIndex === 0 ? (
          <Button
            onClick={() => setTabIndex(1)}
            color="primary"
            variant="contained"
            disabled={isLoading}
          >
            Create New Game
          </Button>
        ) : (
          <Button
            onClick={tabIndex === 1 ? handleCreateGame : handleJoinGame}
            color="primary"
            variant="contained"
            disabled={
              isLoading ||
              !playerName.trim() ||
              (tabIndex === 2 && !gameId.trim())
            }
          >
            {tabIndex === 1 ? "Create Game" : "Join Game"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default GameLobby;
