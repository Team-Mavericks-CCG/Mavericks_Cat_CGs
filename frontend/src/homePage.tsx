import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tabs,
  Tab,
  Typography,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import AppTheme from "./shared-theme/AppTheme";
import ColorModeSelect from "./shared-theme/ColorModeSelect";

const Card = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  minHeight: "75%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  maxWidth: "650px",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const HomePageContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  "&::before": {
    content: '""',
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

interface GameDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  game: string;
  tabs: {
    label: string;
    content: string;
    buttonLabel: string;
    navigateTo: string;
  }[];
  selectedTab: number;
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
  navigateTo: (path: string) => void;
}

const GameDialog: React.FC<GameDialogProps> = ({
  open,
  setOpen,
  game,
  tabs,
  selectedTab,
  setSelectedTab,
  navigateTo,
}) => {
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>
        {game}
        <IconButton
          edge="end"
          color="inherit"
          onClick={() => setOpen(false)}
          aria-label="close"
          style={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogActions>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue: number) => setSelectedTab(newValue)}
          centered
          scrollButtons="auto"
          variant="scrollable"
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </DialogActions>
      {tabs.map((tab, index) => (
        <DialogContent
          key={index}
          style={{ display: selectedTab === index ? "block" : "none" }}
        >
          <DialogContentText>{tab.content}</DialogContentText>
          <DialogActions>
            <Button
              onClick={() => {
                setOpen(false);
                void navigateTo(tab.navigateTo);
              }}
            >
              {tab.buttonLabel}
            </Button>
          </DialogActions>
        </DialogContent>
      ))}
    </Dialog>
  );
};

function HomePage() {
  const navigate = useNavigate();
  const [openSolitaire, setOpenSolitaire] = useState(false);
  const [openWar, setOpenWar] = useState(false);
  const [openPoker, setOpenPoker] = useState(false);
  const [openBlackjack, setOpenBlackjack] = useState(false);

  const [selectedSolitaireTab, setSelectedSolitaireTab] = useState(0);
  const [selectedWarTab, setSelectedWarTab] = useState(0);
  const [selectedPokerTab, setSelectedPokerTab] = useState(0);
  const [selectedBlackjackTab, setSelectedBlackjackTab] = useState(0);

  const solitaireTabs = [
    {
      label: "Start",
      content: "Click the 'Start' button to begin the game.",
      buttonLabel: "Start",
      navigateTo: "/Solitaire",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for Solitaire:",
      buttonLabel: "Leaderboard",
      navigateTo: "/SolitaireLeaderboard",
    },
  ];

  const warTabs = [
    {
      label: "Start",
      content: "Click the 'Start' button to begin War.",
      buttonLabel: "Start",
      navigateTo: "/War",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for War:",
      buttonLabel: "Leaderboard",
      navigateTo: "/WarLeaderboard",
    },
    {
      label: "Create Lobby",
      content: "Create a War lobby.",
      buttonLabel: "Create",
      navigateTo: "/CreateLobby",
    },
    {
      label: "Join Lobby",
      content: "Join a War lobby.",
      buttonLabel: "Join",
      navigateTo: "/JoinLobby",
    },
  ];

  const pokerTabs = [
    {
      label: "Start",
      content: "Click the 'Start' button to begin Poker.",
      buttonLabel: "Start",
      navigateTo: "/Poker",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for Poker:",
      buttonLabel: "Leaderboard",
      navigateTo: "/PokerLeaderboard",
    },
    {
      label: "Create Lobby",
      content: "Create a Poker lobby.",
      buttonLabel: "Create",
      navigateTo: "/PokerCreateLobby",
    },
    {
      label: "Join Lobby",
      content: "Join a Poker lobby.",
      buttonLabel: "Join",
      navigateTo: "/PokerJoinLobby",
    },
  ];

  const blackjackTabs = [
    {
      label: "Start",
      content: "Click the 'Start' button to begin Blackjack.",
      buttonLabel: "Start",
      navigateTo: "/Blackjack",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for Blackjack:",
      buttonLabel: "Leaderboard",
      navigateTo: "/BlackjackLeaderboard",
    },
    {
      label: "Create Lobby",
      content: "Create a Blackjack lobby.",
      buttonLabel: "Create",
      navigateTo: "/BlackjackCreateLobby",
    },
    {
      label: "Join Lobby",
      content: "Join a Blackjack lobby.",
      buttonLabel: "Join",
      navigateTo: "/BlackjackJoinLobby",
    },
  ];

  return (
    <AppTheme>
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <HomePageContainer direction="column" justifyContent="space-between">
        <Card sx={{ flex: 1 }}>
          <Typography component="h1" variant="h4" sx={{ width: "100%" }}>
            Welcome to Mavericks Cat Card Games!
          </Typography>
          <p>Choose a game to play:</p>
          <div className="button-container">
            <div className="button-row">
              <button onClick={() => setOpenSolitaire(true)}>Solitaire</button>
              <button onClick={() => setOpenWar(true)}>War</button>
            </div>
            <div className="button-row">
              <button onClick={() => setOpenPoker(true)}>Poker</button>
              <button onClick={() => setOpenBlackjack(true)}>BlackJack</button>
            </div>
          </div>
        </Card>
      </HomePageContainer>

      <GameDialog
        open={openSolitaire}
        setOpen={setOpenSolitaire}
        game="Solitaire"
        tabs={solitaireTabs}
        selectedTab={selectedSolitaireTab}
        setSelectedTab={setSelectedSolitaireTab}
        navigateTo={(path) => {
          void navigate(path);
        }}
      />

      <GameDialog
        open={openWar}
        setOpen={setOpenWar}
        game="War"
        tabs={warTabs}
        selectedTab={selectedWarTab}
        setSelectedTab={setSelectedWarTab}
        navigateTo={(path) => {
          void navigate(path);
        }}
      />

      <GameDialog
        open={openPoker}
        setOpen={setOpenPoker}
        game="Poker"
        tabs={pokerTabs}
        selectedTab={selectedPokerTab}
        setSelectedTab={setSelectedPokerTab}
        navigateTo={(path) => {
          void navigate(path);
        }}
      />

      <GameDialog
        open={openBlackjack}
        setOpen={setOpenBlackjack}
        game="Blackjack"
        tabs={blackjackTabs}
        selectedTab={selectedBlackjackTab}
        setSelectedTab={setSelectedBlackjackTab}
        navigateTo={(path) => {
          void navigate(path);
        }}
      />
    </AppTheme>
  );
}

export default HomePage;
