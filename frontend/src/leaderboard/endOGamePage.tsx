import React, { useEffect, useState } from "react";
import "./EndOGamePageLeaderboardStyle.css"; // Import  CSS
import { getPlayers, getScores } from './leaderboardpage'; // assuming they're exported from here
import { Player } from './leaderboardpage';
import { Score } from './leaderboardpage';

const UserCard = ({playerName, score, rank, position }) => (
    <div className="user-card">
        <h3>{playerName}</h3>
        <p>Score: {score}</p>
        <p>Rank: {rank}</p>
        <p>Podium Position: {position}</p>
  </div>
);

// React Component
const EndOGamePageLeaderboard: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [scores, setScores] = useState<Score[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedPlayers = await getPlayers();
                const fetchedScores = await getScores();
                
                // Ensure dates are properly formatted
                setPlayers(fetchedPlayers.map(player => ({
                    ...player,
                    createdAt: new Date(player.createdAt),
                    updatedAt: new Date(player.updatedAt),
                    lastLogin: new Date(player.lastLogin)
                })));

                setScores(fetchedScores);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        };
        void fetchData();
    }, []);

    // Sort scores before rendering & separate top 3 scores 
    const sortedScores = [...scores].sort((a, b) => a.rank - b.rank);
    const topThreeScores = sortedScores.slice(0,3);

    //create podium 
    const Podium = () => {
        return (
            <div className="podium-container">
          {topThreeScores.map((score, index) => {
            const player = players.find(p => p.playerId === score.playerId);
            return (
              <UserCard
                key={score.scoreId}
                playerName={player ? `${player.firstName} ${player.lastName}` : "Unknown"}
                score={score.scores}
                rank={score.rank}
                position={index + 1}
              />
            );
          })}
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
                  {sortedScores.map((score) => {
                    const player = players.find(p => p.playerId === score.playerId);
                    return (
                      <tr key={score.scoreId}>
                        <td>{player ? `${player.firstName} ${player.lastName}` : "Unknown"}</td>
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
        
        export default EndOGamePageLeaderboard;