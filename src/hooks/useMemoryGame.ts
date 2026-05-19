import { useCallback, useEffect, useMemo, useState } from 'react';
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

type UseMemoryGameParams = {
  themeCards: CustomThemeCard[];
  pairCount: number;
};

export function useMemoryGame(params: UseMemoryGameParams) {
  const timer = useTimer();

  const initialDeck = useMemo(() => {
    return createDeck(params.themeCards, params.pairCount);
  }, [params.themeCards, params.pairCount]);

  const [cards, setCards] = useState<MemoryCard[]>(initialDeck);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setCards(initialDeck);
    setSelectedCardIds([]);
    setMoves(0);
    setIsLocked(false);
    setIsFinished(false);
    timer.reset();
  }, [initialDeck]);

  const restartGame = useCallback(() => {
    setCards(createDeck(params.themeCards, params.pairCount));
    setSelectedCardIds([]);
    setMoves(0);
    setIsLocked(false);
    setIsFinished(false);
    timer.reset();
  }, [params.themeCards, params.pairCount, timer]);

  const flipCard = useCallback(
    (cardId: string) => {
      if (isLocked || isFinished) {
        return;
      }

      const selectedCard = cards.find((card) => card.id === cardId);

      if (!selectedCard || !canFlipCard(selectedCard)) {
        return;
      }

      if (!timer.isRunning && moves === 0 && selectedCardIds.length === 0) {
        timer.start();
      }

      const flippedCards = cards.map((card) =>
        card.id === cardId ? { ...card, isFlipped: true } : card,
      );

      if (selectedCardIds.length === 0) {
        setCards(flippedCards);
        setSelectedCardIds([cardId]);
        return;
      }

      if (selectedCardIds.length === 1) {
        const firstCard = flippedCards.find(
          (card) => card.id === selectedCardIds[0],
        );

        const secondCard = flippedCards.find((card) => card.id === cardId);

        if (!firstCard || !secondCard) {
          return;
        }

        setMoves((currentMoves) => currentMoves + 1);

        if (areCardsMatching(firstCard, secondCard)) {
          const matchedCards = flippedCards.map((card) =>
            card.pairId === firstCard.pairId
              ? { ...card, isMatched: true }
              : card,
          );

          setCards(matchedCards);
          setSelectedCardIds([]);

          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );

          if (hasFinishedGame(matchedCards)) {
            timer.stop();
            setIsFinished(true);
          }

          return;
        }

        setCards(flippedCards);
        setIsLocked(true);

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );

        setTimeout(() => {
          setCards((currentCards) =>
            currentCards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isFlipped: false }
                : card,
            ),
          );

          setSelectedCardIds([]);
          setIsLocked(false);
        }, 800);
      }
    },
    [
      cards,
      isFinished,
      isLocked,
      moves,
      selectedCardIds,
      timer,
    ],
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