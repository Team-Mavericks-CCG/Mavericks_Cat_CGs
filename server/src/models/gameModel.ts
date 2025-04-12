import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

class GameStats extends Model {
  declare gameName: string;
}

GameStats.init(
  {
    gameName: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    sequelize, // pass the connection instance
    tableName: "games", // specify the table name
    timestamps: false, // enable timestamps
  }
);
