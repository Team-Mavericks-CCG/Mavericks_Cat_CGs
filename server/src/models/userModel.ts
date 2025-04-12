import { Model, DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

// Define the User model class
class Player extends Model {
  declare playerid: number;
  declare username: string;
  declare password: string;
  declare lastLogin: Date | null;
  declare joinedAt: Date;

  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date | null;
}

Player.init(
  {
    playerid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "hashedPassword", // Map the password attribute to hashedPassword column
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize, // pass the connection instance
    tableName: "players", // specify the table name
    timestamps: true, // enable timestamps
  }
);

export default Player;
