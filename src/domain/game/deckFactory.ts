import { MemoryCard } from '@/types/game';
import { CustomThemeCard } from '@/types/theme';

function createMemoryCard(
  source: CustomThemeCard,
  copy: 'a' | 'b',
): MemoryCard {
  return {
    id: `${source.id}_${copy}`,
    pairId: source.id,
    label: source.label,
    emoji: source.emoji,
    imageUri: source.imageUri,
    isFlipped: false,
    isMatched: false,
  };
}

export function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function createDeck(
  themeCards: CustomThemeCard[],
  pairCount: number,
): MemoryCard[] {
  // Mantém compatibilidade com a API atual, mas evita valores inválidos.
  const safePairCount =
    Number.isFinite(pairCount) && pairCount > 0
      ? Math.floor(pairCount)
      : themeCards.length;

  const selected = themeCards.slice(0, Math.min(themeCards.length, safePairCount));

  const doubled = selected.flatMap((card) => [
    createMemoryCard(card, 'a'),
    createMemoryCard(card, 'b'),
  ]);

  return shuffleArray(doubled);
}
