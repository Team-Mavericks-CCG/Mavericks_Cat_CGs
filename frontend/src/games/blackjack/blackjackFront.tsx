import React, { useEffect, useState } from "react";
import "./blackjackStyle.css";
import { Typography, Box, CircularProgress } from "@mui/material";
import { GameRules } from "../components/GameRules";
import { GameButton } from "../components/GameButton";
import { CardComponent } from "../components/CardComponent";
import {
  BlackjackClientGameState,
  GameStatus,
  Hand,
  BlackjackHandStatus,
  Card,
  ClientGameState,
  Rank,
  Suit,
  GameType,
} from "shared";
import { socketManager } from "../utils/socketManager";
import { useNavigate } from "react-router-dom";

const BlackjackPage: React.FC = () => {
  const navigate = useNavigate();
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [playerHand, setPlayerHand] = useState<Map<string, Hand[]>>(new Map());
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [revealDealer, setRevealDealer] = useState(false);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [dealerValue, setDealerValue] = useState<number | null>(null);
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
      // Optional: Try to reconnect automatically
    };

    socketManager.socket?.on("disconnect", handleDisconnect);

    let unsubscribe: () => void;

    if (isConnected) {
      unsubscribe = socketManager.onGameStateUpdate(
        (state: ClientGameState | null) => {
          if (!state || state.gameType !== GameType.BLACKJACK) {
            console.error("Game state is not a valid Blackjack game state.");
            return;
          }

          const tempDealerHand: Card[] = [];
          state.dealerHand.cards.forEach((card) => {
            tempDealerHand.push(
              new Card(card.rank, card.suit, {}, card.faceUp)
            );
          });
          setDealerHand(tempDealerHand);
          setDealerValue(state.dealerHand.value);

          state.players.forEach((player) => {
            const tempPlayerHands: Hand[] = [];
            player.hands.forEach((hand) => {
              const tempPlayerHand: Card[] = [];
              hand.cards.forEach((card) => {
                tempPlayerHand.push(
                  new Card(card.rank, card.suit, {}, card.faceUp)
                );
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

            resolveGame(state);
          }

          if (state.gameStatus === GameStatus.IN_PROGRESS) {
            setIsGameOver(false);
            setGameResult("");
            setRevealDealer(false);
          }
        }
      );
    }
    return () => {
      socketManager.socket?.off("disconnect", handleDisconnect);
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]);

  // This function is called when the game is over to determine the result
  const resolveGame = (state: BlackjackClientGameState) => {
    const currentPlayer = state.players.find(
      (player) => player.id === socketManager.playerID
    );

    // if any hand for this player is a win, set result to "You Win!"
    // otherwise, set result to "You Lose!"
    if (
      currentPlayer!.hands.some(
        (hand) => hand.status === BlackjackHandStatus.WIN
      )
    ) {
      setGameResult("You Win!");
    } else {
      setGameResult("You Lose!");
    }
  };

  const startGame = () => {
    if (isGameOver) {
      setIsGameOver(false);
      setGameResult("");
      setPlayerHand(new Map());
      setDealerHand([]);
      setRevealDealer(false);
      setActivePlayer(null);
      setDealerValue(null);

      // restart the game
      void socketManager.newRound();
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
      console.error("It's not your turn to stand!");
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

  // Render loading state if socket is connecting or disconnected
  if (isConnecting || !isConnected) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="80vh"
      >
        <Typography variant="h5" gutterBottom>
          {isConnecting
            ? "Connecting to game server..."
            : "Not connected to game server"}
        </Typography>

        {isConnecting ? (
          <CircularProgress size={60} />
        ) : (
          <>
            <GameButton
              className="game-button other-button"
              variant="contained"
              onClick={() => {
                setIsConnecting(true);
                void socketManager
                  .connect()
                  .then(() => {
                    setIsConnected(true);
                    setIsConnecting(false);
                  })
                  .catch((error) => {
                    console.error("Reconnection failed:", error);
                    setIsConnecting(false);
                  });
              }}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </GameButton>
          </>
        )}

        <Box mt={4}>
          <GameButton
            className="game-button other-button"
            variant="outlined"
            onClick={() => void navigate("/")}
          >
            Return to Home
          </GameButton>
        </Box>
      </Box>
    );
  }

  return (
    //title
    <Box className="blackjack-page">
      <Typography variant="h4" align="center" gutterBottom>
        Blackjack <GameRules gameType="blackjack" />
      </Typography>

      {/* Deck Display */}
      <Box
        display="flex"
        gap={4}
        flexDirection="row"
        alignItems="flex-start"
        justifyContent="center"
        mb={5}
      >
        {/* Deck label */}
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h6">Deck</Typography>
          <CardComponent
            card={new Card(Rank.ACE, Suit.SPADES, {}, false)}
            isClickable={false}
            onClick={() => console.log("Deck clicked")}
          />
        </Box>

        {/* Dealer's cards */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={5}>
          <Typography variant="h6">Dealer's Hand</Typography>
          {renderHand(dealerHand)}
          {revealDealer && dealerValue !== null && (
            <Typography variant="body2">Total: {dealerValue}</Typography>
          )}
        </Box>
      </Box>

      {/* New game button*/}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          maxWidth: "800px",
          margin: "0 auto",
          padding: "5px 20px",
        }}
      >
        <GameButton
          className="game-button other-button"
          variant="contained"
          onClick={startGame}
          disabled={!isGameOver}
        >
          New Game
        </GameButton>
      </Box>

      {/* Leaderboard button, sends the game data to end of game page for podium using navigate */}
      <Box sx={{ maxWidth: "300px", justifyContent: "right" }}>
        <GameButton
          className="game-button other-button"
          variant="contained"
          onClick={() => {
            const gameState =
              socketManager.gameState as BlackjackClientGameState;
            const playersArray =
              gameState.players.map((player) => {
                const hand = player.hands[0];
                return {
                  name: player.name,
                  score: hand?.value ?? 0,
                };
              }) ?? [];

            if (playersArray.length === 0) {
              console.error("No players found to navigate.");
              return;
            }

            const winnerPlayer = playersArray.reduce(
              (best, player) => (player.score > best.score ? player : best),
              playersArray[0]
            );

            void navigate("/endOfGamePage", {
              state: {
                player: playersArray,
                winner: winnerPlayer.name,
                finalScore: winnerPlayer.score,
              },
            });
          }}
        >
          Leaderboard
        </GameButton>
      </Box>

      {/* hit and stand button  */}
      <Box display="flex" flexDirection="column" gap={2} mb={2}>
        <Box
          className="game-controls"
          sx={{
            display: "flex",
            gap: 2,
            maxWidth: "800px",
            margin: "0 auto",
            padding: "5px 20px",
          }}
        >
          <GameButton
            className="game-button hit-button"
            variant="contained"
            onClick={hit}
            disabled={isGameOver || activePlayer !== socketManager.playerID}
          >
            Hit
          </GameButton>

          <GameButton
            className="game-button stand-button"
            variant="contained"
            onClick={stand}
            disabled={isGameOver || activePlayer !== socketManager.playerID}
          >
            Stand
          </GameButton>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="repeat(2, 1fr)" // two columns
          gap={4}
          justifyItems="center"
          alignItems="start"
        >
          {/* Card spots and all player hands w/ boarder*/}
          {Array.from(playerHand.entries()).map(([id, hands]) => (
            <Box
              key={id}
              display="flex"
              justifyContent={id === socketManager.playerID ? "center" : "left"}
              gap={2}
              sx={{
                width: "fit-content",
                opacity: activePlayer === id ? 1 : 0.7,
                border: activePlayer === id ? "2px solid gold" : "none",
                padding: "10px",
                borderRadius: "5px",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6">
                {id === socketManager.username
                  ? "Your Hand"
                  : `${socketManager.gameState?.players.find((p) => p.id === id)?.name ?? "Unknown"}'s Hand`}
              </Typography>

              {renderHand(hands[0]?.cards ?? [])}
              <Typography variant="body2">
                Total: {hands[0]?.value}
                {hands[0]?.status === BlackjackHandStatus.BUSTED && " (Busted)"}
                {hands[0]?.status === BlackjackHandStatus.WIN && " (Winner!)"}
                {hands[0]?.status === BlackjackHandStatus.LOSE && " (Lost)"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Game result display */}
      <Typography variant="h6" align="center" gutterBottom>
        {gameResult}
      </Typography>
    </Box>
  );
};

export default BlackjackPage;
