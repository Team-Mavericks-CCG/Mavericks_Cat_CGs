# Mavericks_Cat_CGs

This repository contains the codebase for **Team Maverick's Cat Card Game**, developed as part of CS 390 02. This application allows players to play classic card games with cat themed cards. Games includes Solitaire, Poker, War, and Blackjack. Players can play with each other directly by creating and joining rooms, or can compete independently for top placement on the leaderboards.


# Installation & Setup
1. Install Docker, the easiest way to do so by downloading docker dekstop @ https://www.docker.com/products/docker-desktop/
   
2. Clone the repository:
   ```bash
   git clone https://github.com/Team-Mavericks-CCG/Mavericks_Cat_CGs.git
   ```
   
3. Set PASSWORD and JWT_SECRET in docker-compose.yml
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
5. Connect to frontend, address will change if running prod or dev, docker output will provide url.


# Codebase Structure
```
├── shared/                     # Shared code between frontend and backend
│   ├── src/
│   │   ├── card.ts             # Card-related utilities (e.g., Card class, ranks, suits)
│   │   ├── war.ts              # Shared types and enums for the War game
│   │   ├── index.ts            # Shared constants and utilities (e.g., GameStatus, GameType)
│   │   └── ...                 # Other shared utilities or types
│   ├── tsconfig.json           # TypeScript configuration for shared code
│   └── package.json            # Metadata and dependencies for the shared workspace
│
├── server/                     # Backend code
│   ├── src/
│   │   ├── app.ts              # Backend entry point
│   │   ├── games/              # Game-specific logic
│   │   │   ├── game.ts         # Abstract base class for all games
│   │   │   ├── blackjack.ts    # Blackjack game implementation
│   │   │   ├── war.ts          # War game implementation
│   │   │   └── ...             # Other game implementations
│   │   ├── utils/              # Utility functions and helpers
│   │   │   └── card.ts         # Card-related utilities (e.g., Card class)
│   │   ├── routes/             # API routes
│   │   │   ├── authRoutes.ts   # Authentication routes
│   │   │   └── leaderboardRoutes.ts # Leaderboard routes
│   │   ├── socket/             # Socket.io server logic
│   │   │   └── socketManager.ts # Socket event handling and game communication
│   │   └── models/             # Database models
│   │       ├── userModel.ts    # User model for authentication
│   │       ├── gameModel.ts    # Game model for storing game data
│   │       └── associations.ts # Model associations setup
│   ├── Dockerfile-backend      # Dockerfile for backend production
│   ├── Dockerfile-backend.dev  # Dockerfile for backend development
│   ├── package.json            # Backend dependencies and scripts
│   └── README.md               # Backend documentation
│
├── frontend/                   # Frontend code
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Pages of the app (e.g., SignIn, GamePage)
│   │   ├── games/              # Game-specific frontend logic
│   │   │   ├── blackjack/      # Blackjack frontend logic
│   │   │   ├── war/            # War frontend logic
│   │   │   └── utils/          # Game utilities (e.g., socketManager.ts)
│   │   ├── App.tsx             # Main frontend entry point
│   │   ├── main.tsx            # Frontend bootstrap file
│   │   └── theme/              # Shared theme and styling
│   ├── Dockerfile-frontend     # Dockerfile for frontend production
│   ├── Dockerfile-frontend.dev # Dockerfile for frontend development
│   ├── vite.config.ts          # Vite configuration for frontend
│   ├── package.json            # Frontend dependencies and scripts
│   └── README.md               # Frontend documentation
│
├── docker-compose.yml          # Docker configuration for frontend and backend
├── package.json                # Root project metadata and dependencies
├── tsconfig.json               # TypeScript configuration for the entire project
└── README.md                   # Project documentation
```
