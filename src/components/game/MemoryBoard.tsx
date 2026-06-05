import React, { memo, useMemo } from 'react';

import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { MemoryCard } from '@/components/game/MemoryCard';
import { useAppSettings } from '@/hooks/useAppSettings';
import type { MemoryCard as CardType } from '@/types/game';
import type { CardStyleSettings } from '@/types/settings';

interface Props {
  cards: CardType[];
  columns: number;
  cardStyle: CardStyleSettings;
  onFlip: (cardId: string) => void;
}

/**
 * Estimativa do espaço ocupado por topBar + header + footer.
 * Usado apenas para dar uma altura mínima ao container e centralizar
 * o tabuleiro quando existem poucas cartas.
 */
const CHROME_HEIGHT_PORTRAIT = 220;
const CHROME_HEIGHT_LANDSCAPE = 160;

const HORIZONTAL_PADDING = 32;
const MAX_BOARD_WIDTH = 980;

const CARD_MARGIN = 4;
const CARD_OUTER_GAP = CARD_MARGIN * 2;

const MIN_CARD_SIZE = 48;
const MAX_CARD_SIZE_PORTRAIT = 180;
const MAX_CARD_SIZE_LANDSCAPE = 116;
const MAX_CARD_SIZE_WEB = 148;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getMaxCardSize(width: number, isLandscape: boolean) {
  if (width >= 900) {
    return MAX_CARD_SIZE_WEB;
  }

  return isLandscape ? MAX_CARD_SIZE_LANDSCAPE : MAX_CARD_SIZE_PORTRAIT;
}

function getSafeColumns({
  preferredColumns,
  cardsCount,
  availableWidth,
}: {
  preferredColumns: number;
  cardsCount: number;
  availableWidth: number;
}) {
  if (cardsCount <= 0) {
    return 1;
  }

  const normalizedPreferred = Number.isFinite(preferredColumns)
    ? Math.floor(preferredColumns)
    : 4;

  const safePreferred = clamp(normalizedPreferred, 1, 10);

  const maxColumnsByWidth = Math.max(
    1,
    Math.floor(availableWidth / (MIN_CARD_SIZE + CARD_OUTER_GAP)),
  );

  return clamp(
    Math.min(safePreferred, maxColumnsByWidth, cardsCount),
    1,
    Math.max(1, cardsCount),
  );
}

export const MemoryBoard = memo(
  ({ cards, columns, cardStyle, onFlip }: Props) => {
    const { settings } = useAppSettings();
    const { animation } = settings;

    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const metrics = useMemo(() => {
      const availableWidth = Math.max(
        MIN_CARD_SIZE + CARD_OUTER_GAP,
        Math.min(width - HORIZONTAL_PADDING, MAX_BOARD_WIDTH),
      );

      const safeColumns = getSafeColumns({
        preferredColumns: columns,
        cardsCount: cards.length,
        availableWidth,
      });

      const maxCardSize = getMaxCardSize(width, isLandscape);

      const rawCardSize = Math.floor(
        availableWidth / safeColumns - CARD_OUTER_GAP,
      );

      const cardSize = clamp(rawCardSize, MIN_CARD_SIZE, maxCardSize);

      const boardWidth = Math.min(
        availableWidth,
        safeColumns * (cardSize + CARD_OUTER_GAP),
      );

      const chromeHeight = isLandscape
        ? CHROME_HEIGHT_LANDSCAPE
        : CHROME_HEIGHT_PORTRAIT;

      const minBoardHeight = Math.max(0, height - chromeHeight);

      return {
        cardSize,
        boardWidth,
        minBoardHeight,
      };
    }, [cards.length, columns, height, isLandscape, width]);

    const animSettings = useMemo(
      () => ({
        enabled: animation.enabled,
        flipStyle: animation.flipStyle,
        flipSpeedMs: animation.flipSpeedMs,
        matchAnimation: animation.matchAnimation,
      }),
      [
        animation.enabled,
        animation.flipStyle,
        animation.flipSpeedMs,
        animation.matchAnimation,
      ],
    );

    if (cards.length === 0) {
      return (
        <View
          style={[
            styles.container,
            {
              minHeight: metrics.minBoardHeight,
            },
          ]}
        />
      );
    }

    return (
      <View
        style={[
          styles.container,
          {
            minHeight: metrics.minBoardHeight,
          },
        ]}
      >
        <View
          style={[
            styles.board,
            {
              width: metrics.boardWidth,
            },
          ]}
        >
          {cards.map((card) => (
            <MemoryCard
              key={card.id}
              card={card}
              size={metrics.cardSize}
              cardStyle={cardStyle}
              animSettings={animSettings}
              onPress={() => onFlip(card.id)}
            />
          ))}
        </View>
      </View>
    );
  },
);

MemoryBoard.displayName = 'MemoryBoard';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
});