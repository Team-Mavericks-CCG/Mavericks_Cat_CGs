import { Request, Response } from "express";

import GameStats from "../models/gameStatsModel.js";
import Player from "../models/userModel.js";

// Define an interface for the request body
interface SaveStatsRequestBody {
  gameName?: string;
  won?: boolean;
  score?: number;
}

//save stats to the database
export function saveGameStats(req: Request, res: Response) {
  const playerid = req.user?.playerid;
  const { gameName, won, score } = req.body as SaveStatsRequestBody;

  if (gameName === undefined || won === undefined || score === undefined) {
    res.status(400).json({ message: "Invalid request data" });
    return;
  }

  console.log("Game stats received:", { playerid, gameName, won, score });

  // check if stats already exist for the player and game
  void GameStats.findOne({ where: { playerid, gameName } }).then((stats) => {
    if (stats) {
      // Update existing stats
      stats.totalGamesCount++;
      if (won) {
        stats.winCount++;
      } else {
        stats.loseCount++;
      }
      stats.score += score;
      return stats.save();
    } else {
      // Create new stats entry
      return GameStats.create({
        playerid,
        gameName,
        totalGamesCount: 1,
        winCount: won ? 1 : 0,
        loseCount: won ? 0 : 1,
        score,
      });
    }
  });

  res.status(200).json({ message: "Game stats saved successfully" });
}

export function getGameStats(req: Request, res: Response) {
  // get top players on the leaderboard for the given game
  const gameName = req.query.gameName as string;
  if (!gameName) {
    res.status(400).json({ message: "Game name is required" });
    return;
  }

  void GameStats.findAll({
    where: { gameName },
    attributes: [
      "gameName",
      "totalGamesCount",
      "winCount",
      "loseCount",
      "score",
    ],
    order: [
      ["score", "DESC"], // Primary sort by score
      ["winCount", "ASC"], // Secondary sort by wins, less wins at same score is better
    ],
    limit: 5,
    include: [
      {
        model: Player,
        attributes: ["playerid", "username"],
        as: "player",
      },
    ],
  })
    .then((stats) => {
      try {
        // Combine stats with player names
        const fullStats = stats.map((stat) => {
          const winPercentage =
            stat.totalGamesCount > 0 ? stat.winCount / stat.totalGamesCount : 0;

          interface StatResponse {
            gameName: string;
            totalGamesCount: number;
            winCount: number;
            loseCount: number;
            score: number;
            player: {
              playerid: number;
              username: string;
            };
            winPercentage: string;
          }

          const json: StatResponse = stat.toJSON();
          json.winPercentage = winPercentage.toFixed(2);
          return {
            stat: json,
          };
        });

        res.status(200).json(fullStats);
      } catch (error) {
        console.error("Error fetching player data:", error);
        // Still return stats even if player names couldn't be fetched
        res.status(200).json(stats);
      }
    })
    .catch((error: unknown) => {
      console.error("Error fetching game stats:", error);
      res.status(500).json({ message: "Error fetching leaderboard data" });
    });
}
