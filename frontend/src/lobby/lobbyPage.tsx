
import React from "react";
import "./LobbyPage.css";

const players = [
  { name: "PLAYER 1", rank: "RANK #531", color: "blue", image: "🐱" },
  { name: "PLAYER 2", rank: "RANK #324", color: "green", image: "🐱" },
  { name: "PLAYER 3", rank: "RANK #678", color: "pink", image: "🐱" },
  { name: "PLAYER 4", rank: "RANK #114", color: "purple", image: "🐱" },
];

const LobbyPage: React.FC = () => {
  return (
    <div className="lobby-container">
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

      <div className="bottom-panel">
        <div className="invite-code">INVITE CODE: 73654</div>
        <div className="action-buttons">
          <button className="start-btn">START</button>
          <button className="ready-btn">READY</button>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
