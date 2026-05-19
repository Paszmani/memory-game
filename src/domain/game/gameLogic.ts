import { MemoryCard } from '@/types/game';

export function areCardsMatching(
  firstCard: MemoryCard,
  secondCard: MemoryCard,
): boolean {
  return firstCard.pairId === secondCard.pairId;
}

export function canFlipCard(card: MemoryCard): boolean {
  return !card.isFlipped && !card.isMatched;
}

export function hasFinishedGame(cards: MemoryCard[]): boolean {
  return cards.length > 0 && cards.every((card) => card.isMatched);
}