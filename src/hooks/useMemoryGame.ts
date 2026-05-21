import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { createDeck } from '@/domain/game/deckFactory';
import {
  areCardsMatching,
  canFlipCard,
  hasFinishedGame,
} from '@/domain/game/gameLogic';
import { useTimer } from '@/hooks/useTimer';
import { MemoryCard } from '@/types/game';
import { CustomThemeCard } from '@/types/theme';

export interface UseMemoryGameParams {
  themeCards: CustomThemeCard[];
  pairCount: number;
  flipDelayMs?: number;
}

export interface UseMemoryGameReturn {
  cards: MemoryCard[];
  moves: number;
  elapsedSeconds: number;
  isLocked: boolean;
  isFinished: boolean;
  flipCard: (cardId: string) => void;
  restartGame: () => void;
}

const DEFAULT_FLIP_DELAY_MS = 800;

function triggerMatchHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

function triggerMismatchHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function useMemoryGame({
  themeCards,
  pairCount,
  flipDelayMs = DEFAULT_FLIP_DELAY_MS,
}: UseMemoryGameParams): UseMemoryGameReturn {
  const {
    elapsedSeconds,
    isRunning,
    start,
    stop,
    reset,
  } = useTimer();

  const initialDeck = useMemo(
    () => createDeck(themeCards, pairCount),
    [themeCards, pairCount],
  );

  const [cards, setCards] = useState<MemoryCard[]>(initialDeck);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFlipTimeout = useCallback(() => {
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    setCards(initialDeck);
    setSelectedIds([]);
    setMoves(0);
    setIsLocked(false);
    setIsFinished(false);
    reset();
    clearFlipTimeout();
  }, [initialDeck, reset, clearFlipTimeout]);

  useEffect(() => {
    return () => {
      clearFlipTimeout();
    };
  }, [clearFlipTimeout]);

  const restartGame = useCallback(() => {
    clearFlipTimeout();
    setCards(createDeck(themeCards, pairCount));
    setSelectedIds([]);
    setMoves(0);
    setIsLocked(false);
    setIsFinished(false);
    reset();
  }, [themeCards, pairCount, reset, clearFlipTimeout]);

  const flipCard = useCallback(
    (cardId: string) => {
      if (isLocked || isFinished) {
        return;
      }

      const targetCard = cards.find((card) => card.id === cardId);

      if (!targetCard || !canFlipCard(targetCard)) {
        return;
      }

      const isFirstFlip = moves === 0 && selectedIds.length === 0;

      if (!isRunning && isFirstFlip) {
        start();
      }

      const withFlipped = cards.map((card) =>
        card.id === cardId ? { ...card, isFlipped: true } : card,
      );

      if (selectedIds.length === 0) {
        setCards(withFlipped);
        setSelectedIds([cardId]);
        return;
      }

      const firstCard = withFlipped.find(
        (card) => card.id === selectedIds[0],
      );

      const secondCard = withFlipped.find(
        (card) => card.id === cardId,
      );

      if (!firstCard || !secondCard) {
        return;
      }

      setMoves((currentMoves) => currentMoves + 1);

      if (areCardsMatching(firstCard, secondCard)) {
        const withMatched = withFlipped.map((card) =>
          card.pairId === firstCard.pairId
            ? { ...card, isMatched: true }
            : card,
        );

        setCards(withMatched);
        setSelectedIds([]);
        triggerMatchHaptic();

        if (hasFinishedGame(withMatched)) {
          stop();
          setIsFinished(true);
        }

        return;
      }

      setCards(withFlipped);
      setIsLocked(true);
      triggerMismatchHaptic();

      flipTimeoutRef.current = setTimeout(() => {
        setCards((currentCards) =>
          currentCards.map((card) =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, isFlipped: false }
              : card,
          ),
        );

        setSelectedIds([]);
        setIsLocked(false);
      }, flipDelayMs);
    },
    [
      cards,
      selectedIds,
      moves,
      isLocked,
      isFinished,
      isRunning,
      start,
      stop,
      flipDelayMs,
    ],
  );

  return {
    cards,
    moves,
    elapsedSeconds,
    isLocked,
    isFinished,
    flipCard,
    restartGame,
  };
}