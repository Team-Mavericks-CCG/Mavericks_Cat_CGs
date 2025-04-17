import React, { useEffect, useState } from "react";
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
import { socketManager } from "./games/utils/socketManager";

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
    content: string | React.ReactNode;
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
          <DialogContentText component="div">{tab.content}</DialogContentText>
          <DialogActions>
            <Button
              onClick={() => {
                void navigateTo(tab.navigateTo); // Navigate first
                setOpen(false); // Close the dialog after navigation
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
  useEffect(() => {
    // disconnect from any games/lobbies if connected
    socketManager.disconnect();

    // Cleanup function if needed
    return () => {
      // Cleanup code
    };
  }, []);

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
      navigateTo: "/games/solitaire",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for Solitaire:",
      buttonLabel: "Leaderboard",
      navigateTo: "/leaderboard",
    },
  ];

  const warTabs = [
    {
      label: "Start",
      content: (
        <>
          <p>Click the 'Start' button to begin War, or create/join a lobby.</p>

          <Button
            onClick={() => {
              setOpenWar(false);
              void navigate("/lobby");
            }}
          >
            Create Lobby
          </Button>
          <br />
          <Button
            onClick={() => {
              setOpenWar(false);
              // Prompt for invite code
              const inviteCode = prompt("Enter the invite code:");
              if (!inviteCode) {
                alert("Please enter a valid invite code.");
                return;
              } else if (inviteCode.length !== 5) {
                alert("Please enter a valid 5 digit invite code.");
                return;
              }
              // Navigate to the lobby with the invite code
              void navigate(`/games/war/lobby/${inviteCode}`);
            }}
          >
            Join Lobby
          </Button>
        </>
      ),
      buttonLabel: "Start",
      navigateTo: "/games/war",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for War:",
      buttonLabel: "Leaderboard",
      navigateTo: "/leaderboard",
    },
  ];

  const pokerTabs = [
    {
      label: "Start",
      content: (
        <>
          <p>
            Click the 'Start' button to begin Poker, or create/join a lobby.
          </p>
          <Button
            onClick={() => {
              setOpenPoker(false);
              void navigate("/lobby", {
                state: { gameType: "Poker", isCreating: true },
              });
            }}
          >
            Create Lobby
          </Button>
          <br />
          <Button
            onClick={() => {
              setOpenPoker(false);
              // Prompt for invite code
              const inviteCode = prompt("Enter the invite code:");
              if (!inviteCode) {
                alert("Please enter a valid invite code.");
                return;
              } else if (inviteCode.length !== 5) {
                alert("Please enter a valid 5 digit invite code.");
                return;
              }
              // Navigate to the lobby with the invite code
              void navigate(`/games/poker/lobby/${inviteCode}`);
            }}
          >
            Join Lobby
          </Button>
        </>
      ),
      buttonLabel: "Start",
      navigateTo: "/games/poker",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for Poker:",
      buttonLabel: "Leaderboard",
      navigateTo: "/leaderboard",
    },
  ];

  const blackjackTabs = [
    {
      label: "Start",
      content: (
        <>
          <p>
            Click the 'Start' button to begin Blackjack, or create/join a lobby.
          </p>
          <Button
            onClick={() => {
              setOpenBlackjack(false);
              void socketManager
                .connect("default", "Blackjack")
                .then((data) => {
                  void navigate("/lobby", {
                    state: {
                      playerName: localStorage.getItem("username") ?? "Player",
                      gameType: "Blackjack",
                      isCreating: true,
                      inviteCode: data,
                    },
                  });
                });
            }}
          >
            Create Lobby
          </Button>
          <br />
          <Button
            onClick={() => {
              setOpenBlackjack(false);
              // Prompt for invite code
              const inviteCode = prompt("Enter the invite code:");
              if (!inviteCode) {
                alert("Please enter a valid invite code.");
                return;
              } else if (inviteCode.length !== 6) {
                alert("Please enter a valid 5 digit invite code.");
                return;
              }
              void socketManager
                .connect("default", "Blackjack", inviteCode)
                .then(() => {
                  void navigate("/lobby", {
                    state: {
                      gameType: "Blackjack",
                      isCreating: false,
                      inviteCode: inviteCode,
                    },
                  });
                });
            }}
          >
            Join Lobby
          </Button>
        </>
      ),
      buttonLabel: "Start",
      navigateTo: "/games/blackjack",
    },
    {
      label: "Leaderboard",
      content: "Here is the leaderboard for Blackjack:",
      buttonLabel: "Leaderboard",
      navigateTo: "/leaderboard",
    },
  ];

  return (
    <AppTheme>
      <HomePageContainer direction="column" justifyContent="space-between">
        <Typography component="h1" variant="h2" sx={{ width: "100%" }}>
          Welcome to Mavericks Cat Card Games!
        </Typography>
        <Typography component="h1" variant="h4" sx={{ width: "100%" }}>
          Choose a game to play:
        </Typography>
        <div className="button-container">
          <div className="button-row1">
            <button
              className="game-button"
              onClick={() => setOpenSolitaire(true)}
            >
              <img
                src="/assets/images/solitaireButton.png"
                alt="Solitaire"
                className="game-icon"
              />
              <span className="game-label">Solitaire</span>
            </button>
            <button className="game-button" onClick={() => setOpenWar(true)}>
              <img
                src="/assets/images/warIcon.png"
                alt="Solitaire"
                className="game-icon"
              />
              <span className="game-label">War</span>
            </button>
            <button
              className="game-button"
              onClick={() => setOpenBlackjack(true)}
            >
              <img
                src="/assets/images/blackjackButton.png"
                alt="Solitaire"
                className="game-icon"
              />
              <span className="game-label">BlackJack</span>
            </button>
            <button className="game-button" onClick={() => setOpenPoker(true)}>
              <img
                src="/assets/images/pokerButton.png"
                alt="Solitaire"
                className="game-icon"
              />
              <span className="game-label">Poker</span>
            </button>
            <section className="aboutUs">
              <h2>About Us</h2>
              <p>
                We are a team of passionate developers who love card games and
                cats.
              </p>
              <p>
                Our goal is to create a fun and engaging platform for players of
                all skill levels.
              </p>
              <footer>© 2025 Team Mavericks. All rights reserved.</footer>
            </section>
          </div>
          <div className="button-row"></div>
        </div>
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
