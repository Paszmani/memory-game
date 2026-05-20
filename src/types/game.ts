export type CardId = string;

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'custom';

export interface MemoryCard {
  id: CardId;
  pairId: string;
  label: string;
  emoji?: string;
  imageUri?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameResult {
  id: string;
  themeId: string;
  themeName: string;
  difficulty: GameDifficulty;
  moves: number;
  timeInSeconds: number;
  score: number;
  finishedAt: string;
}

export interface GameStats {
  moves: number;
  elapsedSeconds: number;
  score: number;
  isFinished: boolean;
}