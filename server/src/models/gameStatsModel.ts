import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";
import Player from "./userModel.js";
import Game from "./gameModel.js";

// Define the User model class
class GameStats extends Model {
  declare playerid: number;
  declare gameName: string;
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
        model: Player,
        key: "playerid",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    gameName: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: Game,
        key: "gameName",
      },
      onDelete: "CASCADE", // When a game is deleted, delete related stats
      onUpdate: "CASCADE", // When a game id is updated, update in stats too
    },
    totalGamesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    winCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    loseCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "gamestats",
    timestamps: true,
  }
);

export default GameStats;
