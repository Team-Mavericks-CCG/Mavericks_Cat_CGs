import React, { useEffect, useState } from "react";
import "./LobbyPage.css";
import { useNavigate, useParams } from "react-router-dom";

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
 
    // state for the invite code and ready state
    const [inviteCode, setInviteCode] = useState("");
    const [isReady, setIsReady] = useState(false);
    const [isHost] = useState(true); // only host can start the game
    const navigate = useNavigate();
    const { game, inviteCode: inviteCodeFromURL } = useParams();
    
    // useEffect to set the invite code from the URL or generate a new one
    // this will be used to join the game
    useEffect(() => {
        if (inviteCodeFromURL) {
          setInviteCode(inviteCodeFromURL);
        } else {
          const code = Math.floor(10000 + Math.random() * 90000).toString();
          setInviteCode(code);
        }
      }, [inviteCodeFromURL]);

    // ready state for the start 
    const toggleReady = () => setIsReady((prev) => !prev);

    // navigation for the leave button (directs to the home page)
    const handleLeave = () => {
        void navigate("/");
    }

    // navigation for the start button (directs to the card game)
    const handleStart = () => {
        if (isHost && game) {
            void navigate(`/games/${game}`);
        }
    };

  return (
    <div className="lobby-container">
        <h1 className="lobby-header">{game ? game.toUpperCase() : "Loading..."}</h1>
        <button className="invite-btn">INVITE</button>
        <svg viewBox="0 0 400 150" className="lobby-title-svg">
            <defs>
                <path
                id="arcPath"
                d="M 50 150 A 150 150 0 0 1 340 150"
                fill="none" />
            </defs>
            <text fontSize="40" fill="#f4a340" textAnchor="middle">
                <textPath
                    href="#arcPath"
                    startOffset="53%"
                    textLength="300"
                    className="lobby-arc-text" >
                    LOBBY
                </textPath>
        </text>
        </svg>


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
      </div>

      <div className="invite-code">INVITE CODE: {inviteCode}</div>

        <div className="bottom-panel">
        <div className="bottom-left"></div>

        <div className="bottom-center">
            <div className="ready-check" onClick={toggleReady}>
                {isReady ? "☑ Ready!" : "☐ Ready?"}
            </div>
            <button className="start-btn" onClick={handleStart} disabled={!isHost} title={!isHost ? "Only the host can start the game" : ""} > START </button>
        </div>

        <div className="bottom-right">
            <button className="leave-btn" onClick={handleLeave}>LEAVE</button>
        </div>
        </div>
      </div>
  );
};

export default LobbyPage;
