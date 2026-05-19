export type CardId = string;

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'custom';

export type MemoryCard = {
  id: CardId;
  pairId: string;
  label: string;
  emoji?: string;
  imageUri?: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export type GameResult = {
  id: string;
  themeId: string;
  themeName: string;
  difficulty: GameDifficulty;
  moves: number;
  timeInSeconds: number;
  score: number;
  finishedAt: string;
};