import React, { memo, useMemo } from 'react';

import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { MemoryCard } from '@/components/game/MemoryCard';
import { CARD_SIZE_SCALE } from '@/constants/defaultSettings';
import { useAppSettings } from '@/hooks/useAppSettings';
import type { MemoryCard as CardType } from '@/types/game';
import type { CardSizeOption, CardStyleSettings } from '@/types/settings';

interface Props {
  cards: CardType[];
  columns: number;
  cardStyle: CardStyleSettings;
  onFlip: (cardId: string) => void;
}

const CHROME_HEIGHT_PORTRAIT = 220;
const CHROME_HEIGHT_LANDSCAPE = 160;

const HORIZONTAL_PADDING = 32;
const MAX_BOARD_WIDTH = 980;

const CARD_MARGIN = 4;
const CARD_OUTER_GAP = CARD_MARGIN * 2;

const BASE_MIN_CARD_SIZE = 48;
const BASE_MAX_CARD_SIZE_PORTRAIT = 180;
const BASE_MAX_CARD_SIZE_LANDSCAPE = 116;
const BASE_MAX_CARD_SIZE_WEB = 148;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCardSizeOption(cardSize?: CardSizeOption): CardSizeOption {
  if (cardSize === 'small' || cardSize === 'large') {
    return cardSize;
  }

  return 'medium';
}

function getCardSizeScale(cardSize?: CardSizeOption) {
  const option = getCardSizeOption(cardSize);

  return CARD_SIZE_SCALE[option] ?? CARD_SIZE_SCALE.medium;
}

function getAdjustedColumns({
  preferredColumns,
  cardsCount,
  cardSize,
  isLandscape,
}: {
  preferredColumns: number;
  cardsCount: number;
  cardSize?: CardSizeOption;
  isLandscape: boolean;
}) {
  const option = getCardSizeOption(cardSize);

  const baseColumns = clamp(
    Number.isFinite(preferredColumns) ? Math.floor(preferredColumns) : 4,
    1,
    10,
  );

  let adjusted = baseColumns;

  if (option === 'small') {
    adjusted = baseColumns + (isLandscape ? 2 : 1);
  }

  if (option === 'large') {
    adjusted = baseColumns - (isLandscape ? 2 : 1);
  }

  return clamp(adjusted, 1, Math.max(1, cardsCount));
}

function getMaxCardSize({
  width,
  isLandscape,
  scale,
}: {
  width: number;
  isLandscape: boolean;
  scale: number;
}) {
  if (width >= 900) {
    return Math.round(BASE_MAX_CARD_SIZE_WEB * scale);
  }

  if (isLandscape) {
    return Math.round(BASE_MAX_CARD_SIZE_LANDSCAPE * scale);
  }

  return Math.round(BASE_MAX_CARD_SIZE_PORTRAIT * scale);
}

function getSafeColumns({
  preferredColumns,
  cardsCount,
  availableWidth,
  minCardSize,
}: {
  preferredColumns: number;
  cardsCount: number;
  availableWidth: number;
  minCardSize: number;
}) {
  if (cardsCount <= 0) {
    return 1;
  }

  const maxColumnsByWidth = Math.max(
    1,
    Math.floor(availableWidth / (minCardSize + CARD_OUTER_GAP)),
  );

  return clamp(
    Math.min(preferredColumns, maxColumnsByWidth, cardsCount),
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
      const cardSizeOption = getCardSizeOption(cardStyle.cardSize);
      const scale = getCardSizeScale(cardSizeOption);

      const availableWidth = Math.max(
        BASE_MIN_CARD_SIZE + CARD_OUTER_GAP,
        Math.min(width - HORIZONTAL_PADDING, MAX_BOARD_WIDTH),
      );

      const minCardSize = Math.round(
        BASE_MIN_CARD_SIZE * (cardSizeOption === 'small' ? 0.9 : 1),
      );

      const adjustedColumns = getAdjustedColumns({
        preferredColumns: columns,
        cardsCount: cards.length,
        cardSize: cardSizeOption,
        isLandscape,
      });

      const safeColumns = getSafeColumns({
        preferredColumns: adjustedColumns,
        cardsCount: cards.length,
        availableWidth,
        minCardSize,
      });

      const maxCardSize = getMaxCardSize({
        width,
        isLandscape,
        scale,
      });

      const rawCardSize = Math.floor(
        availableWidth / safeColumns - CARD_OUTER_GAP,
      );

      const cardSize = clamp(rawCardSize, minCardSize, maxCardSize);

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
    }, [
      cardStyle.cardSize,
      cards.length,
      columns,
      height,
      isLandscape,
      width,
    ]);

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