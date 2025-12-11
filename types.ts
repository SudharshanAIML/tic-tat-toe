export type Player = 'X' | 'O' | null;

export interface GameState {
  board: Player[];
  currentPlayer: 'X' | 'O';
  winner: Player | 'DRAW' | null;
  winningLine: number[] | null;
  history: Player[][];
  stepNumber: number;
}

export enum GameMode {
  PVP = 'PVP',
  PVE = 'PVE', // Player vs AI
}

export enum Difficulty {
  EASY = 'EASY',
  HARD = 'HARD',
}

export interface MoveResponse {
  move: number;
  commentary?: string;
}