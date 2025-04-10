import React, { useEffect, useState } from "react";
import "./EndOGamePageLeaderboardStyle.css"; // Import  CSS
import { getPlayers, getScores } from './leaderboardpage'; // assuming they're exported from here
import { Player } from './leaderboardpage';
import { Score } from './leaderboardpage';

const PodiumItem = ({playerName, score, rank, position }) => (
  <div> 
      <p><strong>Name:</strong> {playerName}</p>
      <p><strong>Score:</strong> {score}</p>
      <p><strong>Rank:</strong> {rank}</p>
      <p><strong>Position:</strong>{position}</p>
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
    const restofScores = sortedScores.slice(3);

    //create podium 
    const Podium = () => {
        return (
          <>
            <div className="podium-first">
                {topThreeScores[0] && (() => {
                const score = topThreeScores[0];
                const player = players.find(p => p.playerId === score.playerId);
                return (
                  <PodiumItem
                  key={score.scoreId}
                  playerName={player ? `${player.firstName} ${player.lastName}` : "Unknown"}
                  score={score.scores}
                  rank={score.rank}
                  position={1}
                  />
            );
            })()}
           </div>

           <div className="podium-second">
                {topThreeScores[1] && (() => {
                const score = topThreeScores[1];
                const player = players.find(p => p.playerId === score.playerId);
                return (
                  <PodiumItem
                  key={score.scoreId}
                  playerName={player ? `${player.firstName} ${player.lastName}` : "Unknown"}
                  score={score.scores}
                  rank={score.rank}
                  position={2}
                  />
            );
            })()}
           </div>
           <div className="podium-third">
                {topThreeScores[2] && (() => {
                const score = topThreeScores[2];
                const player = players.find(p => p.playerId === score.playerId);
                return (
                  <PodiumItem
                  key={score.scoreId}
                  playerName={player ? `${player.firstName} ${player.lastName}` : "Unknown"}
                  score={score.scores}
                  rank={score.rank}
                  position={3}
                  />
            );
            })()}
           </div>
      </>
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