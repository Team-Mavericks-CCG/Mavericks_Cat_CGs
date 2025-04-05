export interface Game {
  lastActivityTime: number;
  updateActivity(): void;
  getGameState(): unknown; // Each game will return its specific state format
}
