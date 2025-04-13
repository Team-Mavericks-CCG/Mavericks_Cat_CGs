import { Request, Response } from "express";

import GameStats from "../models/gameStatsModel.js";

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
