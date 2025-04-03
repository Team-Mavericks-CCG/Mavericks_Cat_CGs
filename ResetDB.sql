-- permission for postgres user: GRANT INSERT, SELECT, UPDATE ON players TO <username>;

DROP TABLE IF EXISTS playerStats CASCADE;
DROP TABLE IF EXISTS gameStats CASCADE;
DROP TABLE IF EXISTS scoreInformation CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS players CASCADE;

CREATE TABLE players (
   playerid INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   username VARCHAR(255) UNIQUE NOT NULL,
   password VARCHAR(255) NOT NULL,
   firstName VARCHAR(255),
   lastName VARCHAR(255),
   'createdAt' TIMESTAMP WITH TIME ZONE,
   'updatedAt' TIMESTAMP WITH TIME ZONE,
   'lastLogin' TIMESTAMP WITH TIME ZONE
);

CREATE TABLE games(
    gameid INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    gameName VARCHAR(255),
    gameDescription TEXT
);

CREATE TABLE scoreInformation(
    scoreid INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    playerid INT NOT NULL,
    gameid INT NOT NULL,
    scores INT,
    ranks INT,
    rewards INT,
    CONSTRAINT fk_score_player FOREIGN KEY (playerid) REFERENCES players(playerid),
    CONSTRAINT fk_score_game FOREIGN KEY (gameid) REFERENCES games(gameid)
);

CREATE TABLE gameStats(
    gamestatsid INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    playerid INT NOT NULL,
    gameid INT NOT NULL,
    totalGamesCount INT,
    cardGameCount INT,
    mostPlayedCount INT,
    winCount INT,
    loseCount INT,
    CONSTRAINT fk_game_player FOREIGN KEY (playerid) REFERENCES players (playerid),
    CONSTRAINT fk_game FOREIGN KEY (gameid) REFERENCES games (gameid)
);

CREATE TABLE playerStats(
    playerStatsid INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    playerid INT NOT NULL,
    mostplayedWithCount INT,
    mostPlayedWith INT,
    CONSTRAINT fk_playerstats FOREIGN KEY (mostPlayedWith) REFERENCES players(playerid)
);
