import React, { useEffect, useState } from "react";
import "./LobbyPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { SnakeGame } from "./snake";

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
        <h1 className="lobby-header">{game ? game.toUpperCase() : "Game Lobby "}</h1>
        <button className="invite-btn">INVITE</button>

        <div className= "snake-box">
         <SnakeGame />
          </div>

        <div className = "lobby-title-wrapper">
          </div>


          <div className= "lobby-and-cards-container">
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
          
        <div className = "column-right"></div>
        </div>
        </div>

      <div className="invite-code">INVITE CODE: {inviteCode}</div>

        <div className="bottom-panel">
        <div className="bottom-left">Play snake while you wait!</div>

        <div className="bottom-center">
        </div>

       

        <div className="bottom-right">
          {!isHost &&(<button className="ready-btn" onClick={toggleReady}> {isReady ? "☑ Ready!" : "☐ Ready?"}</button>)}
              <button className="start-btn" onClick={handleStart} disabled={!isHost} title={!isHost ? "Only the host can start the game" : ""} > START </button>
              <button className="leave-btn" onClick={handleLeave}>LEAVE</button>
          </div>


        </div> 


      </div>
  );
};

export default LobbyPage;
