import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./homePage.css";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tabs, Tab, Typography, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import AppTheme from "./shared-theme/AppTheme";
import ColorModeSelect from "./shared-theme/ColorModeSelect";

// Styled Card component with custom styles
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

// Styled HomePage container component with background gradient
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

// Interface for the GameDialog component props
interface GameDialogProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  game: string;
  tabs: {
    label: string;
    content: React.ReactNode;
    buttonLabel: string;
    navigateTo: string;
  }[];
  selectedTab: number;
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
  navigateTo: (path: string) => void;
}

// GameDialog component that renders dialog with tabs for each game
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
        {/* Close icon button for closing the dialog */}
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
        {/* Tabs to switch between different game sections */}
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
      {/* Display content based on selected tab */}
      {tabs.map((tab, index) => (
        <DialogContent
          key={index}
          style={{ display: selectedTab === index ? "block" : "none" }}
        >
          <DialogContentText>{tab.content}</DialogContentText>
          {/* Display button only if not on the "Leaderboard" tab */}
          {tab.label !== "Leaderboard" && (
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
          )}
        </DialogContent>
      ))}
    </Dialog>
  );
};

function HomePage() {
  const navigate = useNavigate();
  // State hooks for managing the open status of each game dialog
  const [openSolitaire, setOpenSolitaire] = useState(false);
  const [openWar, setOpenWar] = useState(false);
  const [openPoker, setOpenPoker] = useState(false);
  const [openBlackjack, setOpenBlackjack] = useState(false);

  // General state to manage selected tabs for all games
  const [selectedTabs, setSelectedTabs] = useState({
    solitaire: 0,
    war: 0,
    poker: 0,
    blackjack: 0,
  });

  // Function to handle tab changes for each game
  const handleTabChange = (game: string, newValue: number) => {
    setSelectedTabs((prevState) => ({
      ...prevState,
      [game]: newValue,
    }));
  };

  // Tabs and content for Solitaire game
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

  // Tabs and content for War game
  const warTabs = [
    {
      label: "Start",
      content: (
        <>
          <p>Click the 'Start' button to begin War.</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              void navigate("/CreateWarLobby");
            }}
            style={{ marginRight: "1rem" }}
          >
            Create Lobby
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              void navigate("/JoinWarLobby");
            }}
          >
            Join Lobby
          </Button>
        </>
      ),
      buttonLabel: "Start",
      navigateTo: "/War",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for War:",
      buttonLabel: "Leaderboard",
      navigateTo: "/WarLeaderboard",
    },
  ];

  // Tabs and content for Poker game
  const pokerTabs = [
    {
      label: "Start",
      content: (
        <>
          <p>Click the 'Start' button to begin Poker.</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              void navigate("/CreatePokerLobby");
            }}
            style={{ marginRight: "1rem" }}
          >
            Create Lobby
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              void navigate("/JoinPokerLobby");
            }}
          >
            Join Lobby
          </Button>
        </>
      ),
      buttonLabel: "Start",
      navigateTo: "/Poker",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for Poker:",
      buttonLabel: "Leaderboard",
      navigateTo: "/PokerLeaderboard",
    },
  ];

  // Tabs and content for Blackjack game
  const blackjackTabs = [
    {
      label: "Start",
      content: (
        <>
          <p>Click the 'Start' button to begin Blackjack.</p>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              void navigate("/CreateBlackjackLobby");
            }}
            style={{ marginRight: "1rem" }}
          >
            Create Lobby
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              void navigate("/JoinBlackjackLobby");
            }}
          >
            Join Lobby
          </Button>
        </>
      ),
      buttonLabel: "Start",
      navigateTo: "/Blackjack",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for Blackjack:",
      buttonLabel: "Leaderboard",
      navigateTo: "/BlackjackLeaderboard",
    },
  ];

  return (
    <AppTheme>
      {/* Color mode selector button */}
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      {/* Main container for home page */}
      <HomePageContainer direction="column" justifyContent="space-between">
        <Card sx={{ flex: 1 }}>
          <Typography component="h1" variant="h4" sx={{ width: "100%" }}>
            Welcome to Mavericks Cat Card Games!
          </Typography>
          <p>Choose a game to play:</p>
          <div className="button-container">
            <div className="button-row">
              {/* Solitaire button with an image icon */}
              <button onClick={() => setOpenSolitaire(true)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <img
                  src="/rosemarie/Desktop/Solitaire.png" 
                  style={{ width: "24px", height: "24px" }}
                />
                Solitaire
              </button>
              <button onClick={() => setOpenWar(true)}>War</button>
            </div>
            <div className="button-row">
              <button onClick={() => setOpenPoker(true)}>Poker</button>
              <button onClick={() => setOpenBlackjack(true)}>BlackJack</button>
            </div>
            <div className="button-row">
              <button onClick={() => { void navigate("/Leaderboard"); }}>
                Leaderboard
              </button>
            </div>
          </div>
        </Card>
      </HomePageContainer>

      {/* Dialogs for each game */}
      <GameDialog
        open={openSolitaire}
        setOpen={setOpenSolitaire}
        game="Solitaire"
        tabs={solitaireTabs}
        selectedTab={selectedTabs.solitaire}
        setSelectedTab={(newValue) => {
          if (typeof newValue === "number") {
            handleTabChange("solitaire", newValue);
          }
        }}
        navigateTo={(path) => {
          void navigate(path);
        }}
      />

      <GameDialog
        open={openWar}
        setOpen={setOpenWar}
        game="War"
        tabs={warTabs}
        selectedTab={selectedTabs.war}
        setSelectedTab={(newValue) => {
          if (typeof newValue === "number") {
            handleTabChange("war", newValue);
          }
        }}
        navigateTo={(path) => {
          void navigate(path);
        }}
      />

      <GameDialog
        open={openPoker}
        setOpen={setOpenPoker}
        game="Poker"
        tabs={pokerTabs}
        selectedTab={selectedTabs.poker}
        setSelectedTab={(newValue) => setSelectedTabs((prevState) => ({
          ...prevState,
          poker: typeof newValue === "function" ? newValue(prevState.poker) : newValue,
        }))}
        navigateTo={(path) => {
          void navigate(path);
        }}
      />

      <GameDialog
        open={openBlackjack}
        setOpen={setOpenBlackjack}
        game="Blackjack"
        tabs={blackjackTabs}
        selectedTab={selectedTabs.blackjack}
        setSelectedTab={(newValue) => {
          if (typeof newValue === "number") {
            handleTabChange("blackjack", newValue);
          }
        }}
        navigateTo={(path) => {
          void navigate(path);
        }}
      />
    </AppTheme>
  );
}

export default HomePage;
