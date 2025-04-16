import React, { useEffect, useState } from "react";
import "./LobbyPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { SnakeGame } from "./snake";
import { socketManager } from "../games/utils/socketManager";

// players that will be displayed in the lobby
// this should be replaced with the actual players from the game
// this is just a placeholder for now
const players = [
  { name: "PLAYER 1", rank: "RANK #531", color: "blue", image: "🐱" },
  { name: "PLAYER 2", rank: "RANK #324", color: "green", image: "🐱" },
  { name: "PLAYER 3", rank: "RANK #678", color: "pink", image: "🐱" },
  { name: "PLAYER 4", rank: "RANK #114", color: "purple", image: "🐱" },
];

const LobbyPage: React.FC = () => {
  const location = useLocation();
  // Define the expected type for location.state
  interface LobbyState {
    gameType: string;
    isCreating: boolean;
    inviteCode?: string;
  }

  const {
    gameType,
    isCreating,
    inviteCode: inviteCodeFromState,
  } = (location.state as LobbyState) ?? {};

  // state for the invite code and ready state
  const [inviteCode, setInviteCode] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isHost] = useState(isCreating); // only host can start the game
  const navigate = useNavigate();
  // const [showSnake, setShowSnake] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // react dev mode tries to run this twice, so dont let it
    if (initialized) {
      return; // Skip if already initialized
    }

    setInitialized(true); // Flag to prevent re-initialization
    const initializeLobby = async () => {
      try {
        // Connect to socket server
        const connected = await socketManager.connect();
        if (!connected) {
          throw new Error("Could not connect to game server");
        }

        if (isCreating) {
          // Create a new lobby
          const playerName = localStorage.getItem("username") ?? "Player";
          const response = await socketManager.createLobby(
            playerName,
            gameType
          );

          console.log("Lobby created:", response);

          setInviteCode(response.inviteCode);
        } else if (inviteCodeFromState) {
          // Join existing lobby
          const playerName = localStorage.getItem("username") ?? "Player";
          await socketManager.joinLobby(playerName, inviteCodeFromState);
          setInviteCode(inviteCodeFromState);
        } else {
          // No invite code provided, redirect to home
          void navigate("/"); // Redirect to home if no game type
        }
      } catch (err) {
        console.error("Lobby initialization error:", err);
        void navigate("/"); // Redirect to home on error
        // setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    // Only initialize if we have the needed info
    if (gameType) {
      void initializeLobby();
    } else {
      void navigate("/"); // Redirect to home if no game type
      // No game type provided, show error or redirect
      // setError("No game type selected");
    }

    // Cleanup function
    return () => {
      // Clean up socket listeners when component unmounts
      socketManager.off("lobby-update");
      socketManager.off("game-started");
      socketManager.off("error");

      // Leave the lobby if we were in one
      if (inviteCode && socketManager.isConnected) {
        socketManager.socket?.emit("leave-game", { gameID: inviteCode });
      }
    };
  }, [
    initialized,
    gameType,
    isCreating,
    inviteCodeFromState,
    inviteCode,
    navigate,
  ]);

  // ready state for the start
  const toggleReady = () => setIsReady((prev) => !prev);

  // navigation for the leave button (directs to the home page)
  const handleLeave = () => {
    void navigate("/");
  };

  // navigation for the start button (directs to the card game)
  const handleStart = () => {
    if (isHost) {
      void navigate(`/games/${gameType}`);
    }
  };

  return (
    <div className="lobby-container">
      <h1 className="lobby-header">
        {gameType ? gameType.toUpperCase() : "Game Lobby "}
      </h1>
      <button className="invite-btn">INVITE</button>

      <div className="snake-box">
        <SnakeGame />
      </div>

      <div className="lobby-title-wrapper"></div>

      <div className="lobby-and-cards-container">
        <div className="player-cards">
          {players.map((player, index) => (
            <div
              key={index}
              className={`player-card ${player.color}`}
              style={{ transform: `rotate(${(index - 1.5) * 10}deg)` }}
            >
              <div className="player-icon">{player.image}</div>
              <div className="player-name">{player.name}</div>
              <div className="player-rank">{player.rank}</div>
            </div>
          ))}

          <div className="column-right"></div>
        </div>
      </div>

      <div className="invite-code">INVITE CODE: {inviteCode}</div>

      <div className="bottom-panel">
        <div className="bottom-left">Play snake while you wait!</div>

        <div className="bottom-center"></div>

        <div className="bottom-right">
          {!isHost && (
            <button className="ready-btn" onClick={toggleReady}>
              {" "}
              {isReady ? "☑ Ready!" : "☐ Ready?"}
            </button>
          )}
          <button
            className="start-btn"
            onClick={handleStart}
            disabled={!isHost}
            title={!isHost ? "Only the host can start the game" : ""}
          >
            {" "}
            START{" "}
          </button>
          <button className="leave-btn" onClick={handleLeave}>
            LEAVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
