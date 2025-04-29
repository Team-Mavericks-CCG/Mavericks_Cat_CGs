import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GameButton } from "../games/components/GameButton";
import "./endOfGamePage.css";

const EndOfGamePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("location.state:", location.state);

  // use the data sent from blackjack
  const { player } = location.state as {
    player: { name: string; score: number }[];
    winner: string;
    finalScore: number;
  };

  // players score descending
  const sortedPlayers = [...player].sort((a, b) => b.score - a.score);

  // top 3 players
  const topThreePlayers = sortedPlayers.slice(0, 3);
  const restOfPlayers = sortedPlayers.slice(3);

  return (
    <div className="leaderboard-container">
      {/* Podium */}
      <div className="podium-wrapper">
        {topThreePlayers.map((player, index) => (
          <div
            key={index}
            className={`podium ${index === 0 ? "first" : index === 1 ? "second" : "third"}`}
          >
            <div className="podium-label">
              {index === 0 ? "🥇 1st" : index === 1 ? "🥈 2nd" : "🥉 3rd"}
            </div>
            <div className="podium-name">{player.name}</div>
            <div className="podium-score">Score: {player.score}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard Table */}
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {restOfPlayers.map((player, index) => (
            <tr key={index}>
              <td>{player.name}</td>
              <td>{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Navigation Buttons */}
      <GameButton
        className="new-game-button"
        onClick={() => void navigate("/lobby")}
        aria-label="New game"
      >
        Go back to Lobby
      </GameButton>
      <GameButton
        className="new-game-button"
        onClick={() => void navigate("/")}
        aria-label="Home page"
      >
        Go back to Home Page
      </GameButton>
    </div>
  );
};

export default EndOfGamePage;
