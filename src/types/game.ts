export type CardId = string;

export interface MemoryCard {
  id:        CardId;
  pairId:    string;
  label:     string;
  emoji?:    string;
  imageUri?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameResult {
  id:            string;
  themeId:       string;
  themeName:     string;
  moves:         number;
  timeInSeconds: number;
  finishedAt:    string;
}