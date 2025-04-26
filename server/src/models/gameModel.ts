import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

class Game extends Model {
  declare gameName: string;
}

Game.init(
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

export default Game;
