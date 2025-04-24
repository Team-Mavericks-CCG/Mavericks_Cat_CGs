import React, { useEffect, useState } from "react";
import "./blackjackStyle.css";
import { Typography, Box } from "@mui/material";
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
} from "shared";
import { socketManager } from "../utils/socketManager";

const BlackjackPage: React.FC = () => {
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [playerHand, setPlayerHand] = useState<Map<string, Hand[]>>(new Map());
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [revealDealer, setRevealDealer] = useState(false);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);
  const [dealerValue, setDealerValue] = useState<number | null>(null);

  useEffect(() => {
    const updateState = (state: ClientGameState | null): void => {
      if (!state || state.gameType !== "Blackjack") {
        console.error("Game state is not a valid Blackjack game state.");
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
    };

    const unsubscribe = socketManager.onGameStateUpdate(updateState);
    return () => {
      unsubscribe();
    };
  }, []);

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
        <CardComponent
          // fake card for deck display
          card={new Card(Rank.ACE, Suit.SPADES, {}, false)}
          isClickable={false}
          onClick={() => console.log("Deck clicked")}
        />
        {/* dealers cards  */}
        <Box mb={5}>
          <Typography variant="h6">Dealer's Hand</Typography>
          {renderHand(dealerHand)}
          {revealDealer && dealerValue !== null && (
            <Typography variant="body2">Total: {dealerValue}</Typography>
          )}
        </Box>
      </Box>

      {/* All players' cards */}
      <Box display="flex" flexDirection="column" gap={2} mb={2}>
        {Array.from(playerHand.entries()).map(([id, hands]) => (
          <Box
            key={id}
            display=""
            justifyContent={id === socketManager.playerID ? "right" : "left"}
            gap={2}
            sx={{
              opacity: activePlayer === id ? 1 : 0.7,
              border: activePlayer === id ? "2px solid gold" : "none",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <Typography variant="h6">
              {id === socketManager.playerID
                ? "Your Hand"
                : `Player ${
                    Array.from(playerHand.keys()).indexOf(id) + 1
                  }'s Hand`}
            </Typography>
            {renderHand(hands[0]?.cards ?? [])}
            <Typography variant="body2">
              Total: {hands[0]?.value}
              {hands[0]?.status === HandStatus.BUSTED && " (Busted)"}
              {hands[0]?.status === HandStatus.WIN && " (Winner!)"}
              {hands[0]?.status === HandStatus.LOSE && " (Lost)"}
            </Typography>
          </Box>
        ))}
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
