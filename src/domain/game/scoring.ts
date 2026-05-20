const BASE_SCORE_PER_PAIR   = 1000;
const MOVE_PENALTY          = 10;
const TIME_PENALTY_PER_SEC  = 5;
const PERFECT_BONUS         = 500;
const MINIMUM_SCORE         = 0;

export interface ScoreParams {
  pairCount:      number;
  moves:          number;
  timeInSeconds:  number;
}

export function calculateScore(params: ScoreParams): number {
  const { pairCount, moves, timeInSeconds } = params;

  const base         = pairCount * BASE_SCORE_PER_PAIR;
  const movePenalty  = moves    * MOVE_PENALTY;
  const timePenalty  = timeInSeconds * TIME_PENALTY_PER_SEC;

  const isPerfect    = moves === pairCount;
  const perfectBonus = isPerfect ? PERFECT_BONUS : 0;

  return Math.max(MINIMUM_SCORE, base - movePenalty - timePenalty + perfectBonus);
}

export function getScoreLabel(score: number, pairCount: number): string {
  const maxScore = pairCount * BASE_SCORE_PER_PAIR + PERFECT_BONUS;
  const ratio    = score / maxScore;

  if (ratio >= 0.9) return '🏆 Perfeito!';
  if (ratio >= 0.7) return '⭐ Ótimo!';
  if (ratio >= 0.5) return '👍 Bom!';
  return '💪 Continue tentando!';
}