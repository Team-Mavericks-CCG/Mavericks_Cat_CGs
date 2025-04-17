import React, { useEffect, useState } from "react";
import "./leaderboardStyle.css"; // Import external CSS

// Interfaces
export interface Player {
  playerId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

export interface Score {
  scoreId: number;
  playerId: number;
  gameStatsId: number;
  scores: number;
  rank: number;
  rewards: number;
}

// Mock API calls (replace with real API calls)
export const getPlayers = (): Promise<Player[]> =>
  Promise.resolve([
    {
      playerId: 1,
      username: "user1",
      firstName: "User",
      lastName: "One",
      email: "user1@example.com",
      passwordHash: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    },
    {
      playerId: 2,
      username: "user2",
      firstName: "User",
      lastName: "Two",
      email: "user2@example.com",
      passwordHash: "hashed",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    },
  ]);

export const getScores = (): Promise<Score[]> =>
  Promise.resolve([
    {
      scoreId: 1,
      playerId: 1,
      gameStatsId: 101,
      scores: 5000,
      rank: 1,
      rewards: 100,
    },
    {
      scoreId: 2,
      playerId: 2,
      gameStatsId: 102,
      scores: 4200,
      rank: 2,
      rewards: 80,
    },
  ]);

// React Component
const Leaderboard: React.FC = () => {
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

  // Sort scores before rendering
  const sortedScores = [...scores].sort((a, b) => a.rank - b.rank);

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Leaderboard</h1>
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

export default Leaderboard;
