import { GameDifficulty } from '@/types/game';

export const DIFFICULTIES: Record<
  GameDifficulty,
  {
    label: string;
    pairCount: number;
    columns: number;
  }
> = {
  easy: {
    label: 'Fácil',
    pairCount: 4,
    columns: 4,
  },
  medium: {
    label: 'Médio',
    pairCount: 8,
    columns: 4,
  },
  hard: {
    label: 'Difícil',
    pairCount: 12,
    columns: 4,
  },
  custom: {
    label: 'Customizado',
    pairCount: 8,
    columns: 4,
  },
};

export function normalizeDifficulty(value: unknown): GameDifficulty {
  if (
    value === 'easy' ||
    value === 'medium' ||
    value === 'hard' ||
    value === 'custom'
  ) {
    return value;
  }

  return 'easy';
}