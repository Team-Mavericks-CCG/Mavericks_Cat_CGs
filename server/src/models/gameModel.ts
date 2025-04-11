import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

class GameStats extends Model {
  declare gameid: number;
  declare gameName: string;
  declare gameDescription: string;
}

GameStats.init(
  {
    gameid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    gameName: {
      type: DataTypes.STRING,
    },
    gameDescription: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize, // pass the connection instance
    tableName: "games", // specify the table name
    timestamps: false, // enable timestamps
  }
);
