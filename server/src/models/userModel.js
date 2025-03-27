import { DataTypes } from "sequelize";
import sequelize from "../config/dbConfig.js";

const User = sequelize.define(
  // name of table
  "players",
  // table columns
  {
    id: {
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
    },
    // to track inactive accounts
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    // use createdAt and updatedAt columns to automatically track record changes
    timestamps: true,
  }
);

export default User;
