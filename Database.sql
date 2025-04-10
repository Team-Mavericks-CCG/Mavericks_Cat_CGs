-- permission for postgres user: GRANT INSERT, SELECT, UPDATE ON players TO <username>;

CREATE TABLE players (
   playerid INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   username VARCHAR(255) UNIQUE NOT NULL,
   "hashedPassword" VARCHAR(255) NOT NULL,
   firstName VARCHAR(255),
   lastName VARCHAR(255),
   "createdAt" TIMESTAMP WITH TIME ZONE,
   "updatedAt" TIMESTAMP WITH TIME ZONE,
   "lastLogin" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE games(
    gameid INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    gameName VARCHAR(255),
    gameDescription TEXT
);

CREATE TABLE gameStats(
    playerid INT NOT NULL,
    gameid INT NOT NULL,
    totalGamesCount INT,
    winCount INT,
    loseCount INT,
    score INT,
    CONSTRAINT fk_game_player FOREIGN KEY (playerid) REFERENCES players (playerid),
    CONSTRAINT fk_game FOREIGN KEY (gameid) REFERENCES games (gameid)
);