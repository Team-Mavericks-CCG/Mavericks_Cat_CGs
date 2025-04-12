import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

// Define the User model class
class GameStats extends Model {
  declare playerid: number;
  declare gameid: number;
  declare totalGamesCount: number;
  declare winCount: number;
  declare loseCount: number;
  declare score: number;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
}

GameStats.init(
  {
    playerid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "players",
        key: "playerid",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    gameid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "games",
        key: "gameid",
      },
      onDelete: "CASCADE", // When a game is deleted, delete related stats
      onUpdate: "CASCADE", // When a game id is updated, update in stats too
    },
    totalGamesCount: {
      type: DataTypes.INTEGER,
    },
    winCount: {
      type: DataTypes.INTEGER,
    },
    loseCount: {
      type: DataTypes.INTEGER,
    },
    score: {
      type: DataTypes.INTEGER,
    },
  },
  {
    sequelize,
    tableName: "gameStats",
    timestamps: true,
  }
);

export default GameStats;
