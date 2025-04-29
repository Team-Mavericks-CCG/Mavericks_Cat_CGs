# Mavericks_Cat_CGs

This repository contains the codebase for **Team Maverick's Cat Card Game**, developed as part of CS 390 02. This application allows players to play classic card games with cat themed cards. Games includes Solitaire, Poker, War, and Blackjack. Players can play with each other directly by creating and joining rooms, or can compete independently for top placement on the leaderboards.


# Installation & Setup
1. Install Docker, the easiest way to do so by downloading docker dekstop @ https://www.docker.com/products/docker-desktop/
   
2. Clone the repository:
   ```bash
   git clone https://github.com/Team-Mavericks-CCG/Mavericks_Cat_CGs.git
   ```
   
3. Set PASSWORD and JWT_SECRET
4. To run the docker containers:

   Prod:
   
   ```bash
   docker:build:prod
   docker:prod
   ```
   
   Dev:
   
   ```bash
   docker:build:dev
   docker:dev
```
