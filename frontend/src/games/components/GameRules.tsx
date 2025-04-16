
import React from 'react';
import { 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface GameRulesProps {
  gameType: 'solitaire' | 'war' | 'blackjack' | 'poker';
}

export const GameRules: React.FC<GameRulesProps> = ({ gameType }) => {
  const [open, setOpen] = React.useState(false);

  const getRules = () => {
    switch (gameType) {
      case 'solitaire':
        return (
          <>
            <Typography variant="h6" gutterBottom>Klondike Solitaire Rules:</Typography>
            <Typography variant="body1">
              1. Build four foundation piles up by suit from Ace to King.<br/>
              2. Build tableau piles down by alternate colors.<br/>
              3. Move cards between tableau piles.<br/>
              4. Use cards from the stock pile when stuck.<br/>
              5. Cards can be moved to empty tableau spots.<br/>
              6. Win by moving all cards to foundation piles.
            </Typography>
          </>
        );
      case 'war':
        return (
          <>
            <Typography variant="h6" gutterBottom>War Rules:</Typography>
            <Typography variant="body1">
              1. Deck is divided equally between players.<br/>
              2. Each player reveals top card simultaneously.<br/>
              3. Higher card wins both cards.<br/>
              4. If cards match, it's "War":<br/>
              &nbsp;&nbsp;- Place 3 cards face down<br/>
              &nbsp;&nbsp;- Reveal next card<br/>
              &nbsp;&nbsp;- Higher card wins all cards<br/>
              5. Game ends when one player has all cards.
            </Typography>
          </>
        );
      case 'blackjack':
        return (
          <>
            <Typography variant="h6" gutterBottom>Blackjack Rules:</Typography>
            <Typography variant="body1">
              1. Setup:<br/>
              &nbsp;&nbsp;- Each player gets 2 cards, face up<br/>
              &nbsp;&nbsp;- Dealer gets 1 card face down, 1 card face up<br/>
              2. Goal:<br/>
              &nbsp;&nbsp;- The goal is to get as close to 21 without going over<br/>
              &nbsp;&nbsp;-  Everyone is playing against the dealer, dealer wins in ties<br/>
              3. Actions:<br/>
              &nbsp;&nbsp;- Hit: get another card, only when less than 21<br/>
              &nbsp;&nbsp;- Stand: end turn, no more cards<br/>
              &nbsp;&nbsp;- Split: if both cards are same value, split them into 2 hands and play each<br/>
              &nbsp;&nbsp;-  Dealer doesn't split, hits until &gt;= 17<br/>
              4. Cards:<br/>
              &nbsp;&nbsp;- Ace: 1 or 11<br/>
              &nbsp;&nbsp;- Face Cards: 10<br/>
              &nbsp;&nbsp;- Number cards: face value<br/>
            </Typography>
          </>
        );
      case 'poker':
        return (
          <>
            <Typography variant="h6" gutterBottom>Texas Hold'em Rules:</Typography>
            <Typography variant="body1">
              1. Each player gets 2 hole cards.<br/>
              2. 5 community cards are dealt in 3 stages:<br/>
              &nbsp;&nbsp;- Flop: First 3 cards<br/>
              &nbsp;&nbsp;- Turn: 4th card<br/>
              &nbsp;&nbsp;- River: 5th card<br/>
              3. Betting rounds:<br/>
              &nbsp;&nbsp;- Pre-flop<br/>
              &nbsp;&nbsp;- After flop<br/>
              &nbsp;&nbsp;- After turn<br/>
              &nbsp;&nbsp;- After river<br/>
              4. Best 5-card hand wins using any combination of hole and community cards.
            </Typography>
          </>
        );
    }
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)} color="primary">
        <InfoIcon />
      </IconButton>
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogTitle>Game Rules</DialogTitle>
        <DialogContent>
          {getRules()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
