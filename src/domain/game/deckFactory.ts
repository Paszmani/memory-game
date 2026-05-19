import { MemoryCard } from '@/types/game';
import { CustomThemeCard } from '@/types/theme';

export function createDeck(
  themeCards: CustomThemeCard[],
  pairCount: number,
): MemoryCard[] {
  const selectedCards = themeCards.slice(0, pairCount);

  const duplicatedCards = selectedCards.flatMap((card) => [
    createMemoryCard(card, 'a'),
    createMemoryCard(card, 'b'),
  ]);

  return shuffleDeck(duplicatedCards);
}

function createMemoryCard(card: CustomThemeCard, copy: 'a' | 'b'): MemoryCard {
  return {
    id: `${card.id}-${copy}`,
    pairId: card.id,
    label: card.label,
    emoji: card.emoji,
    imageUri: card.imageUri,
    isFlipped: false,
    isMatched: false,
  };
}

export function shuffleDeck<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}