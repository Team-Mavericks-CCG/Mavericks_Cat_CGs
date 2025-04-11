import React, { useEffect, useState } from "react";
import "./leaderboardStyle.css"; // Import external CSS

// Interfaces
export interface Player {   //exported to end of game page 
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

export interface Score {   //exported to end of game page 
    scoreId: number;
    playerId: number;
    gameStatsId: number;
    scores: number;
    rank: number;
    rewards: number;
}

// Mock API calls (replace with real API calls)
export const getPlayers = (): Promise<Player[]> => Promise.resolve([  //exported to end of game page 
    {
        playerId: 1,
        username: "user1",
        firstName: "User",
        lastName: "One",
        email: "user1@example.com",
        passwordHash: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
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
        lastLogin: new Date()
    },
    {
        playerId: 3,
        username: "user3",
        firstName: "User",
        lastName: "three",
        email: "user3@example.com",
        passwordHash: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
    }, 
    {
        playerId: 4,
        username: "user4",
        firstName: "User",
        lastName: "four",
        email: "user4@example.com",
        passwordHash: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
    }, 
    {
        playerId: 5,
        username: "user5",
        firstName: "User",
        lastName: "five",
        email: "user5@example.com",
        passwordHash: "hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
    }
]);


export const getScores = (): Promise<Score[]> => {
    const scores = [
        { scoreId: 1, playerId: 1, gameStatsId: 101, scores: 5000 },
        { scoreId: 2, playerId: 2, gameStatsId: 102, scores: 4200 },
        { scoreId: 3, playerId: 3, gameStatsId: 103, scores: 3000 },
        { scoreId: 4, playerId: 4, gameStatsId: 104, scores: 5030 },
        { scoreId: 5, playerId: 5, gameStatsId: 105, scores: 7030 }
    ];

    const sortedScoreWithRank = scores
        .sort((a, b) => b.scores - a.scores)  // sorted by descending score 
        .map((score, index) => ({   // assigns the rank bc of score 
            ...score,
            rank: index + 1,
            rewards: Math.floor(score.scores / 40) // assigns reward, reward eq: score ÷ 30
        }));

    return Promise.resolve(sortedScoreWithRank);  // finished array with scores and sorted 
};



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

export default Leaderboard;
