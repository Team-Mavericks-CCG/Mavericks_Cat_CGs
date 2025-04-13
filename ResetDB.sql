-- permission for postgres user: GRANT INSERT, SELECT, UPDATE ON players TO <username>;


DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS gameStats;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS players;

CREATE TABLE players (
   playerid INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   username VARCHAR(255) UNIQUE NOT NULL,
   "hashedPassword" VARCHAR(255) NOT NULL,
   firstName VARCHAR(255),
   lastName VARCHAR(255),
   "profilePicture" int DEFAULT 0,
   "joinedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
   "createdAt" TIMESTAMP WITH TIME ZONE,
   "updatedAt" TIMESTAMP WITH TIME ZONE,
   "lastLogin" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE friendships (
   playerid INT NOT NULL,
   friendid INT NOT NULL,
   "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (playerid, friendid),
   CONSTRAINT fk_player FOREIGN KEY (playerid) REFERENCES players (playerid) ON DELETE CASCADE,
   CONSTRAINT fk_friend FOREIGN KEY (friendid) REFERENCES players (playerid) ON DELETE CASCADE,
   CONSTRAINT check_not_self_friend CHECK (playerid <> friendid)
);

CREATE TABLE games(
    "gameName" VARCHAR(255) PRIMARY KEY
);

INSERT INTO games ("gameName") VALUES ('Solitaire'), ('Poker'), ('Blackjack'), ('War');

CREATE TABLE gameStats(
    playerid INT NOT NULL,
    "gameName" VARCHAR(255) NOT NULL,
    "totalGamesCount" INT DEFAULT 0,
    "winCount" INT DEFAULT 0,
    "loseCount" INT DEFAULT 0,
    score INT DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE,
    "updatedAt" TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (playerid, "gameName"),
    CONSTRAINT fk_game_player FOREIGN KEY (playerid) REFERENCES players (playerid) ON DELETE CASCADE,
    CONSTRAINT fk_game_name FOREIGN KEY ("gameName") REFERENCES games ("gameName") ON DELETE CASCADE
);