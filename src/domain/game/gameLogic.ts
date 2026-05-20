import { MemoryCard } from '@/types/game';

export function areCardsMatching(first: MemoryCard, second: MemoryCard): boolean {
  return first.pairId === second.pairId && first.id !== second.id;
}

export function canFlipCard(card: MemoryCard): boolean {
  return !card.isFlipped && !card.isMatched;
}

export function hasFinishedGame(cards: MemoryCard[]): boolean {
  return cards.length > 0 && cards.every((card) => card.isMatched);
}

export function countMatchedPairs(cards: MemoryCard[]): number {
  return cards.filter((card) => card.isMatched).length / 2;
}

export function getTotalPairs(cards: MemoryCard[]): number {
  return cards.length / 2;
}