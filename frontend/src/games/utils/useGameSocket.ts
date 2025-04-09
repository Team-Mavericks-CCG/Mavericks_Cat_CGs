import { useState, useEffect, useCallback } from "react";
import { socketManager } from "./socketManager";

// Hook for managing socket connections and game state in React components
export function useGameSocket<T = unknown>(gameType: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gameState, setGameState] = useState<T | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Connect to socket server
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const connected = await socketManager.connect();
      setIsConnected(connected);

      if (connected) {
        // Try to authenticate if we have a token
        const token = localStorage.getItem("authToken");
        if (token) {
          const authenticated = await socketManager.authenticate(token);
          setIsAuthenticated(authenticated);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new game
  const createGame = useCallback(
    async (playerName: string) => {
      setIsLoading(true);
      setError(null);

      try {
        let result;

        // Handle different game types
        if (gameType === "blackjack") {
          result = await socketManager.createBlackjackGame(playerName);
        } else {
          throw new Error(`Unsupported game type: ${gameType}`);
        }

        setGameId(result.gameId);
        setPlayerId(socketManager.socket?.id ?? "");
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create game");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [gameType]
  );

  // Join an existing game
  const joinGame = useCallback(
    async (gameId: string, playerName: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Handle different game types
        if (gameType === "blackjack") {
          await socketManager.joinBlackjackGame(gameId, playerName);
        } else {
          throw new Error(`Unsupported game type: ${gameType}`);
        }

        setGameId(gameId);
        setPlayerId(socketManager.socket?.id ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to join game");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [gameType]
  );

  // Game-specific actions
  const gameActions = useCallback(() => {
    if (gameType === "blackjack") {
      return {
        startGame: (gameId: string) => socketManager.startBlackjackGame(gameId),
        hit: (gameId: string) => socketManager.blackjackHit(gameId),
        stand: (gameId: string) => socketManager.blackjackStand(gameId),
        newRound: (gameId: string) => socketManager.blackjackNewRound(gameId),
      };
    }

    return {};
  }, [gameType]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Optional: disconnect when component unmounts
      // socketManager.disconnect();
    };
  }, []);

  // Set up event listeners when connected
  useEffect(() => {
    if (isConnected) {
      // Listen for game state updates
      socketManager.on("game-state", (state) => {
        setGameState(state as T);
      });

      // Listen for errors
      socketManager.on("error", (data: unknown) => {
        setError(data as string);
      });
    }

    return () => {
      // Remove listeners when disconnected or component unmounts
      if (isConnected) {
        socketManager.off("game-state");
        socketManager.off("error");
      }
    };
  }, [isConnected]);

  return {
    isConnected,
    isAuthenticated,
    isLoading,
    error,
    gameState,
    gameId,
    playerId,
    connect,
    createGame,
    joinGame,
    actions: gameActions(),
  };
}
