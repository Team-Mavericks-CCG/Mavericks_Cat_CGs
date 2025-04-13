import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

class GameStats extends Model {
  declare playerID: number;
  declare friendID: number;
  declare createdAt: Date;
}

GameStats.init(
  {
    playerID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "players",
        key: "playerid",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    friendID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "players",
        key: "playerid",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize, // pass the connection instance
    tableName: "friendships", // specify the table name
    timestamps: false, // enable timestamps
  }
);
