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
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";
import AppTheme from "./shared-theme/AppTheme";
import { socketManager } from "./games/utils/socketManager";
import catPlaying from "/assets/images/catPlaying.webp";
import { GameType } from "shared";

// Styled container for the HomePage
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

// Props for the GameDialog component
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

// Components for displaying a dialog with game options
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
        {/* Tabs for navigating between different game options */}
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
    // Disconnect from any games/lobbies if connected
    socketManager.leave();
    socketManager.disconnect();

    // Cleanup function if needed
    return () => {
      // Cleanup code
    };
  }, []);

  // State variable for managing dialogs and tabs 
  const navigate = useNavigate();
  const [openSolitaire, setOpenSolitaire] = useState(false);
  const [openWar, setOpenWar] = useState(false);
  const [openPoker, setOpenPoker] = useState(false);
  const [openBlackjack, setOpenBlackjack] = useState(false);

  const [selectedSolitaireTab, setSelectedSolitaireTab] = useState(0);
  const [selectedWarTab, setSelectedWarTab] = useState(0);
  const [selectedPokerTab, setSelectedPokerTab] = useState(0);
  const [selectedBlackjackTab, setSelectedBlackjackTab] = useState(0);

  const [openJoinWarLobby, setOpenJoinWarLobby] = useState(false);
  const [openJoinPokerLobby, setOpenJoinPokerLobby] = useState(false);
  const [openJoinBlackjackLobby, setOpenJoinBlackjackLobby] = useState(false);
  const [openCreateLobbyDialog, setOpenCreateLobbyDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [userName, setUserName] = useState("");
  const [createLobbyGameType, setCreateLobbyGameType] = useState<string | null>(
    null
  );
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");

  const [inviteCodeError, setInviteCodeError] = React.useState(false);
  const [inviteCodeErrorMessage, setInviteCodeErrorMessage] =
    React.useState("");

  // Updated validateUsername function to allow usernames longer than 3 characters
  const validateUsername = (): boolean => {
    if (!userName || userName.trim().length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage("Username must be at least 3 characters long.");
      return false;
    }
    setUsernameError(false);
    setUsernameErrorMessage("");
    return true;
  };

  // Updated validateInviteCode function to ensure proper validation
  const validateInviteCode = (): boolean => {
    if (!inviteCode || inviteCode.trim().length !== 6) {
      setInviteCodeError(true);
      setInviteCodeErrorMessage(
        "Invite code must be exactly 6 characters long."
      );
      return false;
    }
    setInviteCodeError(false);
    setInviteCodeErrorMessage("");
    return true;
  };

  // Function to start a game
  const startGame = (gameType: GameType) => {
    const playerName = userName.trim(); // Use the userName state directly
    sessionStorage.setItem("username", playerName);

    if (usernameError || inviteCodeError) {
      return;
    }

    try {
      void socketManager
        .connect()
        .then(() => {
          void socketManager.createLobby("Player", gameType).then(() => {
            void socketManager.startGame().then(() => {
              void navigate(`/games/${gameType.toLowerCase()}`);
            });
          });
        })
        .catch((error) => {
          console.error("Error creating blackjack lobby:", error);
          alert("Failed to create lobby. Please try again.");
        });
    } catch (error) {
      console.error(`Error starting ${gameType} game:`, error);
      alert(`Failed to start ${gameType} game. Please try again.`);
    }
  };

  // Reusable function for connecting to a lobby
  const connectToLobby = (gameType: GameType, inviteCode: string | null) => {
    const playerName = userName.trim(); // Use the userName state directly
    sessionStorage.setItem("username", playerName);

    try {
      if (!inviteCode) {
        //create lobby
        void socketManager
          .connect()
          .then(() => {
            console.log("Connected to socket server.");
            void socketManager.createLobby(playerName, gameType).then(() => {
              void navigate("/lobby");
            });
          })
          .catch((error) => {
            console.error("Error creating blackjack lobby:", error);
            alert("Failed to create lobby. Please try again.");
          });
      } else {
        //join lobby
        void socketManager
          .connect()
          .then(() => {
            void socketManager.joinLobby(playerName, inviteCode).then(() => {
              void navigate("/lobby");
            });
          })
          .catch((error) => {
            console.error("Error joining blackjack lobby:", error);
            alert("Failed to join lobby. Please try again.");
          });
      }
    } catch (error) {
      console.error(`Error connecting to ${gameType} lobby:`, error);
      alert(
        `Failed to ${
          inviteCode === null ? "create" : "join"
        } lobby. Please try again.`
      );
    }
  };

  // tabs for solitaire, war, poker, and blackjack
  // Each tab contains a label, content, button label, and navigation path
  const solitaireTabs = [
    {
      label: "Start",
      content: "Click the 'Start' button to begin the game.",
      buttonLabel: "Start",
      navigateTo: "/games/solitaire",
    },
    {
      label: "Leaderboard",
      content:
        "Click the 'Leaderboard' button to view the Solitaire leaderboard.",
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
              startGame(GameType.WAR);
            }}
          >
            Create Lobby
          </Button>
          <br />
          <Button
            onClick={() => {
              setOpenWar(false);
              setTimeout(() => setOpenJoinWarLobby(true), 300);
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
      content: "Click the 'Leaderboard' button to view the War leaderboard.",
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
              startGame(GameType.POKER);
            }}
          >
            Create Lobby
          </Button>
          <br />
          <Button
            onClick={() => {
              setOpenPoker(false);
              setTimeout(() => setOpenJoinPokerLobby(true), 300);
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
      content: "Click the 'Leaderboard' button to view the Poker leaderboard.",
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
              startGame(GameType.BLACKJACK);
            }}
          >
            Create Lobby
          </Button>
          <br />
          <Button
            onClick={() => {
              setOpenBlackjack(false);
              setTimeout(() => setOpenJoinBlackjackLobby(true), 300);
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
      content:
        "Click the 'Leaderboard' button to view the Blackjack leaderboard.",
      buttonLabel: "Leaderboard",
      navigateTo: "/leaderboard",
    },
  ];

  return (
    <AppTheme>
      {/* Main container for the HomePage */}
      {/* The container is styled using the HomePageContainer component */}
      <HomePageContainer direction="column" justifyContent="space-between">
        <Typography component="h1" variant="h2" sx={{ width: "100%" }}>
          Welcome to Mavericks Cat-tastic Card Games!
        </Typography>
        <Typography component="h1" variant="h4" sx={{ width: "100%" }}>
          Choose a game to play:
        </Typography>
        <div className="button-container">
          <div className="button-row1">
            <div className="game-button-container">
              <div className="game-button">
                <img
                  src="/assets/images/solitaireButton.png"
                  alt="Solitaire"
                  className="game-icon"
                />
                <span className="game-label">Solitaire</span>
              </div>
              <div className="dropdown-menu">
                <button
                  className="dropdown-button"
                  onClick={() => {
                    void navigate("/games/solitaire");
                  }}
                >
                  Start Game
                </button>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    void navigate("/leaderboard");
                  }}
                >
                  Leaderboard
                </button>
              </div>
            </div>
            {/* blackjack game container*/}
            <div className="game-button-container">
              {/* blackjack button*/}
              <div className="game-button">
                <img
                  src="/assets/images/warIcon.png"
                  alt="War"
                  className="game-icon"
                />
                <span className="game-label">War</span>
              </div>
              {/* War dropdown munue*/}
              <div className="dropdown-menu">
                <button
                  className="dropdown-button"
                  onClick={() => {
                    startGame(GameType.WAR);
                  }}
                >
                  Start Game
                </button>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    setOpenJoinWarLobby(true);
                  }}
                >
                  Join Lobby
                </button>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    setCreateLobbyGameType("War");
                    setOpenCreateLobbyDialog(true);
                  }}
                >
                  Create Lobby
                </button>
              </div>
            </div>

            {/* blackjack game container*/}
            <div className="game-button-container">
              {/* blackjack button*/}
              <div className="game-button">
                <img
                  src="/assets/images/blackjackButton.png"
                  alt="Blackjack"
                  className="game-icon"
                />
                <span className="game-label">Blackjack</span>
              </div>
              {/* blackjack dropdown munue*/}
              <div className="dropdown-menu">
                <button
                  className="dropdown-button"
                  onClick={() => {
                    startGame(GameType.BLACKJACK);
                  }}
                >
                  Start Game
                </button>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    setOpenJoinBlackjackLobby(true);
                  }}
                >
                  Join Lobby
                </button>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    setCreateLobbyGameType("Blackjack");
                    setOpenCreateLobbyDialog(true);
                  }}
                >
                  Create Lobby
                </button>
              </div>
            </div>
            {/* Poker game container*/}
            <div className="game-button-container">
              {/* Poker button*/}
              <div className="game-button">
                <img
                  src="/assets/images/pokerButton.png"
                  alt="Poker"
                  className="game-icon"
                />
                <span className="game-label">Poker</span>
              </div>
              {/* Poker dropdown menu*/}
              <div className="dropdown-menu">
                <button
                  className="dropdown-button"
                  onClick={() => {
                    startGame(GameType.POKER);
                  }}
                >
                  Start Game
                </button>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    setOpenJoinPokerLobby(true);
                  }}
                >
                  Join Lobby
                </button>
                <button
                  className="dropdown-button"
                  onClick={() => {
                    setCreateLobbyGameType("Poker");
                    setOpenCreateLobbyDialog(true);
                  }}
                >
                  Create Lobby
                </button>
              </div>
            </div>

             {/* About Us section */}
            <section className="aboutUs">
              <h2>About Us</h2>
              <img
                src={catPlaying}
                alt="Cat Pawprint"
                className="cat-pawprint"
              />
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

        {/* Game Dialogs for each game */}
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

        {/* Join War Lobby Dialog */}
        <Dialog
          open={openJoinWarLobby}
          onClose={() => setOpenJoinWarLobby(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (!validateInviteCode() || !validateUsername()) {
                return;
              }
              setOpenJoinWarLobby(false);
              void connectToLobby(GameType.WAR, inviteCode);
            }
          }}
        >
          <DialogTitle>Join War Lobby</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
          >
            <TextField
              label="Invite Code"
              helperText={inviteCodeErrorMessage}
              value={inviteCode.toUpperCase()}
              onChange={(e) => setInviteCode(e.target.value)}
              inputProps={{ maxLength: 6 }}
              fullWidth
            />
            <TextField
              label="Your Name"
              helperText={usernameErrorMessage}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenJoinWarLobby(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!validateInviteCode()) {
                  return;
                }
                if (!validateUsername()) {
                  return;
                }
                setOpenJoinWarLobby(false);
                void connectToLobby(GameType.WAR, inviteCode);
              }}
            >
              Join
            </Button>
          </DialogActions>
        </Dialog>

        {/* Join Poker Lobby Dialog */}
        <Dialog
          open={openJoinPokerLobby}
          onClose={() => setOpenJoinPokerLobby(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (!validateInviteCode() || !validateUsername()) {
                return;
              }
              setOpenJoinPokerLobby(false);
              void connectToLobby(GameType.POKER, inviteCode);
            }
          }}
        >
          <DialogTitle>Join Poker Lobby</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
          >
            <TextField
              label="Invite Code"
              helperText={inviteCodeErrorMessage}
              value={inviteCode.toUpperCase()}
              onChange={(e) => setInviteCode(e.target.value)}
              inputProps={{ maxLength: 6 }}
              fullWidth
            />
            <TextField
              label="Your Name"
              helperText={usernameErrorMessage}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenJoinPokerLobby(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!validateInviteCode()) {
                  return;
                }
                if (!validateUsername()) {
                  return;
                }
                setOpenJoinPokerLobby(false);
                void connectToLobby(GameType.POKER, inviteCode);
              }}
            >
              Join
            </Button>
          </DialogActions>
        </Dialog>

        {/* Join Blackjack Lobby Dialog */}
        <Dialog
          open={openJoinBlackjackLobby}
          onClose={() => setOpenJoinBlackjackLobby(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (!validateInviteCode() || !validateUsername()) {
                return;
              }
              setOpenJoinBlackjackLobby(false);
              void connectToLobby(GameType.BLACKJACK, inviteCode);
            }
          }}
        >
          <DialogTitle>Join Blackjack Lobby</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
          >
            <TextField
              label="Invite Code"
              helperText={inviteCodeErrorMessage}
              value={inviteCode.toUpperCase()}
              onChange={(e) => setInviteCode(e.target.value)}
              inputProps={{ maxLength: 6 }}
              fullWidth
            />
            <TextField
              label="Your Name"
              helperText={usernameErrorMessage}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenJoinBlackjackLobby(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!validateInviteCode()) {
                  return;
                }
                if (!validateUsername()) {
                  return;
                }
                setOpenJoinBlackjackLobby(false);
                void connectToLobby(GameType.BLACKJACK, inviteCode);
              }}
            >
              Join
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Lobby Dialog */}
        <Dialog
          open={openCreateLobbyDialog}
          onClose={() => {
            setOpenCreateLobbyDialog(false);
            setUserName(""); // Clear the username when the dialog is closed
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (!validateUsername()) {
                return;
              }
              if (createLobbyGameType) {
                try {
                  connectToLobby(createLobbyGameType as GameType, null);
                  setOpenCreateLobbyDialog(false);
                  setUserName(""); // Clear the username after successful creation
                } catch (error) {
                  console.error(
                    `Error creating ${createLobbyGameType} lobby:`,
                    error
                  );
                  alert("Failed to create lobby. Please try again.");
                }
              }
            }
          }}
        >
          <DialogTitle>Create Lobby</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
          >
            <TextField
              label="Your Name"
              helperText={usernameErrorMessage}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCreateLobbyDialog(false);
                setUserName(""); // Clear the username when the dialog is canceled
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                void (() => {
                  if (!validateUsername()) {
                    return;
                  }

                  if (createLobbyGameType) {
                    try {
                      connectToLobby(createLobbyGameType as GameType, null);
                      setOpenCreateLobbyDialog(false);
                      setUserName(""); // Clear the username after successful creation
                    } catch (error) {
                      console.error(
                        `Error creating ${createLobbyGameType} lobby:`,
                        error
                      );
                      alert("Failed to create lobby. Please try again.");
                    }
                  }
                })();
              }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </HomePageContainer>
    </AppTheme>
  );
}

export default HomePage;
