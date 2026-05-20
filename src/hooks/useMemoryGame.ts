import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { createDeck } from '@/domain/game/deckFactory';
import {
  areCardsMatching,
  canFlipCard,
  hasFinishedGame,
} from '@/domain/game/gameLogic';
import { MemoryCard } from '@/types/game';
import { CustomThemeCard } from '@/types/theme';
import { useTimer } from '@/hooks/useTimer';

export interface UseMemoryGameParams {
  themeCards:   CustomThemeCard[];
  pairCount:    number;
  flipDelayMs?: number;
}

export interface UseMemoryGameReturn {
  cards:          MemoryCard[];
  moves:          number;
  elapsedSeconds: number;
  isLocked:       boolean;
  isFinished:     boolean;
  flipCard:       (cardId: string) => void;
  restartGame:    () => void;
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
  const timer = useTimer();

  const initialDeck = useMemo(
    () => createDeck(themeCards, pairCount),
    [themeCards, pairCount],
  );

  const [cards,         setCards]         = useState<MemoryCard[]>(initialDeck);
  const [selectedIds,   setSelectedIds]   = useState<string[]>([]);
  const [moves,         setMoves]         = useState(0);
  const [isLocked,      setIsLocked]      = useState(false);
  const [isFinished,    setIsFinished]    = useState(false);

  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFlipTimeout = useCallback(() => {
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
  }, []);

  // Reinicia quando o deck muda
  useEffect(() => {
    setCards(initialDeck);
    setSelectedIds([]);
    setMoves(0);
    setIsLocked(false);
    setIsFinished(false);
    timer.reset();
    clearFlipTimeout();
  }, [initialDeck, timer, clearFlipTimeout]);

  // Cleanup ao desmontar
  useEffect(() => () => clearFlipTimeout(), [clearFlipTimeout]);

  const restartGame = useCallback(() => {
    clearFlipTimeout();
    setCards(createDeck(themeCards, pairCount));
    setSelectedIds([]);
    setMoves(0);
    setIsLocked(false);
    setIsFinished(false);
    timer.reset();
  }, [themeCards, pairCount, timer, clearFlipTimeout]);

  const flipCard = useCallback(
    (cardId: string) => {
      if (isLocked || isFinished) return;

      const targetCard = cards.find((c) => c.id === cardId);
      if (!targetCard || !canFlipCard(targetCard)) return;

      // Inicia o timer na primeira carta
      const isFirstFlip = moves === 0 && selectedIds.length === 0;
      if (!timer.isRunning && isFirstFlip) timer.start();

      const withFlipped = cards.map((c) =>
        c.id === cardId ? { ...c, isFlipped: true } : c,
      );

      // Primeira carta selecionada
      if (selectedIds.length === 0) {
        setCards(withFlipped);
        setSelectedIds([cardId]);
        return;
      }

      // Segunda carta — verifica par
      const firstCard  = withFlipped.find((c) => c.id === selectedIds[0]);
      const secondCard = withFlipped.find((c) => c.id === cardId);

      if (!firstCard || !secondCard) return;

      setMoves((prev) => prev + 1);

      if (areCardsMatching(firstCard, secondCard)) {
        const withMatched = withFlipped.map((c) =>
          c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c,
        );

        setCards(withMatched);
        setSelectedIds([]);
        triggerMatchHaptic();

        if (hasFinishedGame(withMatched)) {
          timer.stop();
          setIsFinished(true);
        }

        return;
      }

      // Par incorreto — desvira após delay
      setCards(withFlipped);
      setIsLocked(true);
      triggerMismatchHaptic();

      flipTimeoutRef.current = setTimeout(() => {
        setCards((current) =>
          current.map((c) =>
            c.id === firstCard.id || c.id === secondCard.id
              ? { ...c, isFlipped: false }
              : c,
          ),
        );
        setSelectedIds([]);
        setIsLocked(false);
      }, flipDelayMs);
    },
    [cards, isFinished, isLocked, moves, selectedIds, timer, flipDelayMs],
  );

  return {
    cards,
    moves,
    elapsedSeconds: timer.elapsedSeconds,
    isLocked,
    isFinished,
    flipCard,
    restartGame,
  };
}