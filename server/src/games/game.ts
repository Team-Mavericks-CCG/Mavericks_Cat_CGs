export interface Game {
  lastActivityTime: number;
  updateActivity(): void;
  getGameState(): unknown; // Each game will return its specific state format
  getPlayerCount(): number;
  removePlayer(playerID: string): void;
  getClientGameState(): unknown; // Each game will return its specific state format for the client
}
