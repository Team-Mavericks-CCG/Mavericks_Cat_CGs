import React, { useEffect, useState } from "react";
import "./LobbyPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { SnakeGame } from "./snake";
import { socketManager, Player } from "../games/utils/socketManager";

const LobbyPage: React.FC = () => {
  const location = useLocation();
  // Define the expected type for location.state
  interface LobbyState {
    playerName: string;
    gameType: string;
    isCreating: boolean;
    inviteCode: string;
  }

  const [players, setPlayers] = useState<Player[]>([]);

  // state for the invite code and ready state
  const [inviteCode, setInviteCode] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false); // only host can start the game
  const [gameType, setGameType] = useState(""); // default game type is solitaire
  // const [playerName] = useState(localStorage.getItem("username") ?? "Player");
  const navigate = useNavigate();
  // const [showSnake, setShowSnake] = useState(false);

  useEffect(() => {
    // location state is only available when page is intially loaded
    // reloading gets rid of it
    if (!location.state) {
      const {
        playerName,
        gameType: gameTypeFromState,
        isCreating,
        inviteCode: inviteCodeFromState,
      } = JSON.parse(
        localStorage.getItem(socketManager.socketID!)!
      ) as LobbyState;

      setGameType(gameTypeFromState);
      setIsHost(isCreating);
      setInviteCode(inviteCodeFromState);

      void socketManager.connect(
        playerName,
        gameTypeFromState,
        inviteCodeFromState
      );
    } else {
      const {
        gameType: gameTypeFromState,
        isCreating,
        inviteCode: inviteCodeFromState,
      } = location.state as LobbyState;
      console.log("Location state:", location.state);

      setGameType(gameTypeFromState);
      setIsHost(isCreating);
      setInviteCode(inviteCodeFromState);

      localStorage.setItem(
        socketManager.socketID!,
        JSON.stringify(location.state as LobbyState)
      );
    }

    // Subscribe to player updates
    const unsubscribe = socketManager.onPlayersUpdate(setPlayers);
    setPlayers(socketManager.players);

    socketManager.on("game-started", (state) => {
      console.log("Game started, navigating to game page", state);
      void navigate(`/games/${gameType}`, { state: state });
    });

    // Clean up on unmount
    return () => {
      unsubscribe();
      socketManager.off("game-started");
    };
  }, [gameType, location.state, navigate]);

  // ready state for the start
  const toggleReady = () => setIsReady((prev) => !prev);

  // navigation for the leave button (directs to the home page)
  const handleLeave = () => {
    void navigate("/");
  };

  // navigation for the start button (directs to the card game)
  const handleStart = () => {
    if (isHost) {
      // Emit event to start the game
      void socketManager.startGame();
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
