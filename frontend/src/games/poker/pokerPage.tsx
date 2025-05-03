import React, { useState } from "react";
import { Card, Suit, Rank } from "shared"; 
import { CardComponent } from "../components/CardComponent";
import { GameButton } from "../components/GameButton";
import { Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import "./pokerStyles.css";

// Function to create a deck of cards
const createDeck = (): Card[] => {
    const suits = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
    const ranks = [
        Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
        Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE
    ];
    const deck: Card[] = [];
    suits.forEach((suit) => {
        ranks.forEach((rank) => {
            deck.push(new Card(rank, suit)); // Create Card instances
        });
    });
    return deck;
};

// Function to shuffle the deck using Fisher-Yates algorithm
const shuffleDeck = (deck: Card[]) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const PokerPage: React.FC = () => {
    // State variables for the game
    const [playerHand, setPlayerHand] = useState<Card[]>([]); // Player's hand
    const [opponentHand, setOpponentHand] = useState<Card[]>([]); // Opponent's hand
    const [dealerCards, setDealerCards] = useState<Card[]>([]); // Dealer's cards (community cards)
    const [deck, setDeck] = useState<Card[]>([]); // Remaining deck
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null); // Index of the selected card
    const [dialogOpen, setDialogOpen] = useState(false); // Dialog open state
    const [actionType, setActionType] = useState<'replace' | 'keep' | null>(null); // Action type for the dialog

    // Function to start a new game
    const startGame = () => {
        const shuffledDeck = shuffleDeck(createDeck());
        setDeck(shuffledDeck);
        setPlayerHand(shuffledDeck.slice(0, 2));       // 2 cards for player
        setOpponentHand(shuffledDeck.slice(2, 4));     // 2 cards for opponent
        setDealerCards(shuffledDeck.slice(4, 7));      // 3 cards for dealer (the flop)
    };

    // Function to render a hand of cards
    const renderHand = (hand: Card[], faceUp = true) => (
        <Box display="flex" gap={1}>
            {hand.map((card, idx) => (
                <CardComponent
                    key={idx}
                    card={card}
                    isClickable={false}
                    faceUp={faceUp} // Determines if the card is face up or down
                    onClick={() => {}}
                />
            ))}
        </Box>
    );

    // Function to open the dialog for replacing or keeping a card
    const openDialog = (cardIndex: number, action: 'replace' | 'keep') => {
        setSelectedCardIndex(cardIndex);
        setActionType(action);
        setDialogOpen(true);
    };

    // Function to handle dialog close and perform the selected action
    const handleDialogClose = (isConfirmed: boolean) => {
        if (isConfirmed && selectedCardIndex !== null) {
            if (actionType === 'replace') {
                replaceCard(selectedCardIndex);
            } else {
                keepCard(selectedCardIndex);
            }
        }
        setDialogOpen(false);
    };

    // Function to replace a card in the player's hand
    const replaceCard = (cardIndex: number) => {
        const newDeck = [...deck];
        const newCard = newDeck.pop(); // Draw the last card from the deck
        if (newCard) {
            const updatedHand = [...playerHand];
            updatedHand[cardIndex] = newCard; // Replace the card at the specified index
            setPlayerHand(updatedHand);
            setDeck(newDeck); // Update the deck
        }
    };

    // Function to keep a card (no changes needed)
    const keepCard = (cardIndex: number) => {
        console.log("Card kept at index:", cardIndex);
    };

    return (
        <Box className="poker-page">
            {/* Page title */}
            <Typography variant="h4" align="center" gutterBottom>
                Poker
            </Typography>

            {/* Start Game Button */}
            <Box display="flex" justifyContent="right" gap={2} mb={2}>
                <GameButton
                    className="start-btn"
                    variant="contained"
                    onClick={startGame}
                >
                    Start New Game
                </GameButton>
            </Box>

            {/* Opponent's Hand */}
            <Box mb={2}>
                <Typography variant="h6">Opponent's Hand</Typography>
                {renderHand(opponentHand, false)} {/* Cards are face down */}
            </Box>

            {/* Dealer Cards */}
            <Box mb={4} display="flex" justifyContent="center">
                <Box textAlign="center">
                    <Typography variant="h6" gutterBottom>Dealer Cards</Typography>
                    {renderHand(dealerCards, true)} {/* Cards are face up */}
                </Box>
            </Box>

            {/* Player's Hand */}
            <Box mb={2}>
                <Typography variant="h6">Your Hand</Typography>
                {renderHand(playerHand, true)} {/* Cards are face up */}
            </Box>

            {/* Replace/Keep Buttons for Player's Hand */}
            <Box display="flex" justifyContent="center" gap={2}>
                {playerHand.map((_, idx) => (
                    <Box key={idx}>
                        <GameButton
                            variant="contained"
                            color="primary"
                            onClick={() => openDialog(idx, 'replace')}
                        >
                            Replace
                        </GameButton>
                        <GameButton
                            variant="outlined"
                            color="secondary"
                            onClick={() => openDialog(idx, 'keep')}
                        >
                            Keep
                        </GameButton>
                    </Box>
                ))}
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Do you want to {actionType} this card?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDialogClose(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleDialogClose(true)} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PokerPage;
