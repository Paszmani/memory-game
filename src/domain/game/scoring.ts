export function calculateScore(params: {
  pairCount: number;
  moves: number;
  timeInSeconds: number;
}): number {
  const baseScore = params.pairCount * 1000;
  const movePenalty = params.moves * 10;
  const timePenalty = params.timeInSeconds * 5;

  return Math.max(0, baseScore - movePenalty - timePenalty);
}