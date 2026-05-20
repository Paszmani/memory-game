import { GameDifficulty } from '@/types/game';

export interface DifficultyConfig {
  label: string;
  pairCount: number;
  columns: number;
  description: string;
}

export const DIFFICULTIES: Record<GameDifficulty, DifficultyConfig> = {
  easy: {
    label: 'Fácil',
    pairCount: 4,
    columns: 4,
    description: '4 pares',
  },
  medium: {
    label: 'Médio',
    pairCount: 8,
    columns: 4,
    description: '8 pares',
  },
  hard: {
    label: 'Difícil',
    pairCount: 12,
    columns: 4,
    description: '12 pares',
  },
  custom: {
    label: 'Customizado',
    pairCount: 8,
    columns: 4,
    description: 'Quantidade baseada no tema',
  },
} as const;

const VALID_DIFFICULTIES = new Set<string>(['easy', 'medium', 'hard', 'custom']);

export function normalizeDifficulty(value: unknown): GameDifficulty {
  if (typeof value === 'string' && VALID_DIFFICULTIES.has(value)) {
    return value as GameDifficulty;
  }
  return 'easy';
}