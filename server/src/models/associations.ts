import Player from "./userModel.js";
import Game from "./gameModel.js";
import GameStats from "./gameStatsModel.js";
import Friendship from "./friendsModel.js";

export function setupAssociations() {
  // Player (User) to GameStats: One-to-Many
  Player.hasMany(GameStats, {
    foreignKey: "playerid",
    as: "gameStat",
  });

  // GameStats to Player: Many-to-One
  GameStats.belongsTo(Player, {
    foreignKey: "playerid",
    as: "player",
  });

  // Game to GameStats: One-to-Many
  Game.hasMany(GameStats, {
    foreignKey: "gameName",
    sourceKey: "gameName",
    as: "stats",
  });

  // GameStats to Game: Many-to-One
  GameStats.belongsTo(Game, {
    foreignKey: "gameName",
    targetKey: "gameName",
    as: "game",
  });

  Player.belongsToMany(Player, {
    through: Friendship,
    foreignKey: "playerID",
    otherKey: "friendID",
    as: "friends",
  });
}
