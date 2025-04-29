import React, { useState } from "react";
import { Card, Suit, Rank } from "shared"; 
import { CardComponent } from "../components/CardComponent";
import { GameButton } from "../components/GameButton";
import { Typography, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import "./pokerStyles.css";

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

const shuffleDeck = (deck: Card[]) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const PokerPage: React.FC = () => {
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [opponentHand, setOpponentHand] = useState<Card[]>([]);
    const [dealerCards, setDealerCards] = useState<Card[]>([]);
    const [deck, setDeck] = useState<Card[]>([]);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'replace' | 'keep' | null>(null);

    const startGame = () => {
        const shuffledDeck = shuffleDeck(createDeck());
        setDeck(shuffledDeck);
        setPlayerHand(shuffledDeck.slice(0, 2));       // 2 cards for player
        setOpponentHand(shuffledDeck.slice(2, 4));     // 2 cards for opponent
        setDealerCards(shuffledDeck.slice(4, 7));       // 3 cards for dealer (the flop)
    };

    const renderHand = (hand: Card[], faceUp = true) => (
        <Box display="flex" gap={1}>
            {hand.map((card, idx) => (
                <CardComponent
                    key={idx}
                    card={card}
                    isClickable={false}
                    faceUp={faceUp}
                    onClick={() => {}}
                />
            ))}
        </Box>
    );

    const openDialog = (cardIndex: number, action: 'replace' | 'keep') => {
        setSelectedCardIndex(cardIndex);
        setActionType(action);
        setDialogOpen(true);
    };

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

    const replaceCard = (cardIndex: number) => {
        const newDeck = [...deck];
        const newCard = newDeck.pop(); // Replace the last card in the deck with the player’s chosen card
        if (newCard) {
            const updatedHand = [...playerHand];
            updatedHand[cardIndex] = newCard; // Replace the card at the specified index in the player’s hand
            setPlayerHand(updatedHand);
            setDeck(newDeck); // Update the deck with the new card removed
        }
    };

    const keepCard = (cardIndex: number) => {
        // Simply keep the card (no changes needed)
        console.log("Card kept at index:", cardIndex);
    };

    return (
        <Box className="poker-page">
            <Typography variant="h4" align="center" gutterBottom>
                Poker
            </Typography>

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
                {renderHand(opponentHand, false)} {/* face down */}
            </Box>

            {/* Dealer Cards */}
            <Box mb={4} display="flex" justifyContent="center">
                <Box textAlign="center">
                    <Typography variant="h6" gutterBottom>Dealer Cards</Typography>
                    {renderHand(dealerCards, true)} {/* face up */}
                </Box>
            </Box>

            {/* Player's Hand */}
            <Box mb={2}>
                <Typography variant="h6">Your Hand</Typography>
                {renderHand(playerHand, true)} {/* face up */}
            </Box>

            {/* Replace/Keep Button */}
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
