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
  previewCardsOnStart?: boolean;
  previewCardsDurationMs?: number;
}

export interface UseMemoryGameReturn {
  cards: MemoryCard[];
  moves: number;
  elapsedSeconds: number;
  isLocked: boolean;
  isPreviewing: boolean;
  isFinished: boolean;
  flipCard: (cardId: string) => void;
  restartGame: () => void;
}

const DEFAULT_FLIP_DELAY_MS = 800;
const DEFAULT_PREVIEW_CARDS_DURATION_MS = 5000;

function triggerMatchHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

function triggerMismatchHaptic() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

function showAllCards(deck: MemoryCard[]): MemoryCard[] {
  return deck.map((card) => ({
    ...card,
    isFlipped: true,
  }));
}

function hideUnmatchedCards(deck: MemoryCard[]): MemoryCard[] {
  return deck.map((card) => ({
    ...card,
    isFlipped: card.isMatched ? card.isFlipped : false,
  }));
}

function normalizePreviewDuration(durationMs?: number) {
  if (!Number.isFinite(durationMs)) {
    return DEFAULT_PREVIEW_CARDS_DURATION_MS;
  }

  return Math.max(
    0,
    Math.round(durationMs ?? DEFAULT_PREVIEW_CARDS_DURATION_MS),
  );
}

export function useMemoryGame({
  themeCards,
  pairCount,
  flipDelayMs = DEFAULT_FLIP_DELAY_MS,
  previewCardsOnStart = true,
  previewCardsDurationMs = DEFAULT_PREVIEW_CARDS_DURATION_MS,
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
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFlipTimeout = useCallback(() => {
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
  }, []);

  const clearPreviewTimeout = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  }, []);

  const clearAllTimeouts = useCallback(() => {
    clearFlipTimeout();
    clearPreviewTimeout();
  }, [clearFlipTimeout, clearPreviewTimeout]);

  const startDeck = useCallback(
    (deck: MemoryCard[]) => {
      clearAllTimeouts();

      const durationMs = normalizePreviewDuration(previewCardsDurationMs);
      const shouldPreview =
        previewCardsOnStart && durationMs > 0 && deck.length > 0;

      setSelectedIds([]);
      setMoves(0);
      setIsFinished(false);
      reset();

      if (!shouldPreview) {
        setCards(deck);
        setIsLocked(false);
        setIsPreviewing(false);
        return;
      }

      setCards(showAllCards(deck));
      setIsLocked(true);
      setIsPreviewing(true);

      previewTimeoutRef.current = setTimeout(() => {
        setCards((currentCards) => hideUnmatchedCards(currentCards));
        setSelectedIds([]);
        setIsLocked(false);
        setIsPreviewing(false);
        previewTimeoutRef.current = null;
      }, durationMs);
    },
    [
      clearAllTimeouts,
      previewCardsOnStart,
      previewCardsDurationMs,
      reset,
    ],
  );

  useEffect(() => {
    startDeck(initialDeck);
  }, [initialDeck, startDeck]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  const restartGame = useCallback(() => {
    const nextDeck = createDeck(themeCards, pairCount);
    startDeck(nextDeck);
  }, [themeCards, pairCount, startDeck]);

  const flipCard = useCallback(
    (cardId: string) => {
      if (isLocked || isPreviewing || isFinished) {
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
        card.id === cardId
          ? { ...card, isFlipped: true }
          : card,
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
        flipTimeoutRef.current = null;
      }, flipDelayMs);
    },
    [
      cards,
      selectedIds,
      moves,
      isLocked,
      isPreviewing,
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
    isPreviewing,
    isFinished,
    flipCard,
    restartGame,
  };
}