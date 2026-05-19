export type CardId = string;

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'custom';

export type MemoryCard = {
    id: CardId;
    pairId: string;
    label: string;
    emoji?: string;
    isFlippled: boolean;
    isMatched: boolean;
};

