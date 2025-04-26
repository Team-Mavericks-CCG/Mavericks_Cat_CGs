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
        {/* Leaderboard button, IDK if it should stay here */}  
        <Box
                sx={{ maxWidth: "300px", justifyContent: "right"}}
              >
                {isGameOver && (
                  <GameButton
                    className="game-button other-button"
                    variant="contained"
                    onClick={() => void navigate("/leaderboard")}
                    disabled={!isGameOver}
                  >
                    Leaderboard
                  </GameButton>
                )}
              </Box>
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
              {id === socketManager.playerID
                ? "Your Hand"
                : `Player ${
                    Array.from(playerHand.keys()).indexOf(id) + 1
                  }'s Hand`}
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

      {/* Game result display */}
      <Typography variant="h6" align="center" gutterBottom>
        {gameResult}
      </Typography>
            



    </Box>

    
  );
};

export default BlackjackPage;
