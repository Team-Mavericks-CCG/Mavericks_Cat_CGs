import React, { useEffect, useState } from "react";
import "./endOfGamePage.css"; // Import  CSS
import { getPlayers, getScores } from "./leaderboardpage"; // assuming they're exported from here
import { Player } from "./leaderboardpage";
import { Score } from "./leaderboardpage";

// React Component
const EndOfGamePage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedPlayers = await getPlayers();
        const fetchedScores = await getScores();

        // Ensure dates are properly formatted
        setPlayers(
          fetchedPlayers.map((player) => ({
            ...player,
            createdAt: new Date(player.createdAt),
            updatedAt: new Date(player.updatedAt),
            lastLogin: new Date(player.lastLogin),
          }))
        );

        setScores(fetchedScores);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };
    void fetchData();
  }, []);

  // Sort scores before rendering & separate top 3 scores
  const sortedScores = [...scores].sort((a, b) => a.rank - b.rank);
  const topThreeScores = sortedScores.slice(0, 3);
  const restofScores = sortedScores.slice(3);

  //create podium
  const Podium = () => {
    const first = topThreeScores[0];
    const second = topThreeScores[1];
    const third = topThreeScores[2];

    const getPlayerName = (score: Score | null) => {
      if (!score) return "Unknown";
      const player = players.find((p) => p.playerId === score.playerId);
      return player ? `${player.firstName} ${player.lastName}` : "Unknown";
    };

    return (
      <div className="podium-wrapper">
        {/* 2nd */}
        <div className="second">
          <div className="podium-label">🥈 2nd</div>
          <div className="podium-name">{getPlayerName(second)}</div>
          <div className="podium-score">Score: {second?.scores ?? "-"}</div>
        </div>

        {/* 1st*/}
        <div className="first">
          <div className="podium-label">🥇 1st</div>
          <div className="podium-name">{getPlayerName(first)}</div>
          <div className="podium-score">Score: {first?.scores ?? "-"}</div>
        </div>

        {/* 3rd*/}
        <div className="third">
          <div className="podium-label">🥉 3rd</div>
          <div className="podium-name">{getPlayerName(third)}</div>
          <div className="podium-score">Score: {third?.scores ?? "-"}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="leaderboard-container">
      <Podium />
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Score</th>
            <th>Rank</th>
            <th>Rewards</th>
          </tr>
        </thead>
        <tbody>
          {restofScores.map((score) => {
            const player = players.find((p) => p.playerId === score.playerId);
            return (
              <tr key={score.scoreId}>
                <td>
                  {player
                    ? `${player.firstName} ${player.lastName}`
                    : "Unknown"}
                </td>
                <td>{score.scores}</td>
                <td>{score.rank}</td>
                <td>{score.rewards}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EndOfGamePage;
