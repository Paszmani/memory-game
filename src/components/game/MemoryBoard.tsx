import React, { memo, useMemo } from 'react';

import {
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { MemoryCard } from '@/components/game/MemoryCard';
import { useAppSettings } from '@/hooks/useAppSettings';
import { CardStyleSettings } from '@/types/settings';
import { MemoryCard as CardType } from '@/types/game';

interface Props {
  cards: CardType[];
  columns: number;
  cardStyle: CardStyleSettings;
  onFlip: (cardId: string) => void;
}

const MAX_BOARD_WIDTH = 960;

const HORIZONTAL_PADDING_PORTRAIT = 32;
const HORIZONTAL_PADDING_LANDSCAPE = 16;

const CARD_MARGIN = 4;
const CARD_OUTER_GAP = CARD_MARGIN * 2;

const MIN_CARD_SIZE = 52;
const MAX_CARD_PORTRAIT = 180;
const MAX_CARD_LANDSCAPE = 110;
const MAX_CARD_WEB = 148;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getHorizontalPadding(isLandscape: boolean) {
  return isLandscape
    ? HORIZONTAL_PADDING_LANDSCAPE
    : HORIZONTAL_PADDING_PORTRAIT;
}

function getMaxCardSize(width: number, isLandscape: boolean) {
  if (width >= 900) {
    return MAX_CARD_WEB;
  }

  return isLandscape ? MAX_CARD_LANDSCAPE : MAX_CARD_PORTRAIT;
}

function normalizeColumns({
  preferredColumns,
  cardsCount,
  availableWidth,
}: {
  preferredColumns: number;
  cardsCount: number;
  availableWidth: number;
}) {
  if (cardsCount <= 1) {
    return cardsCount || 1;
  }

  const safePreferred = clamp(
    Number.isFinite(preferredColumns) ? Math.floor(preferredColumns) : 4,
    1,
    8,
  );

  const maxByWidth = Math.max(
    1,
    Math.floor(availableWidth / (MIN_CARD_SIZE + CARD_OUTER_GAP)),
  );

  return clamp(
    Math.min(safePreferred, maxByWidth, cardsCount),
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

    const boardMetrics = useMemo(() => {
      const horizontalPadding = getHorizontalPadding(isLandscape);

      const availableWidth = Math.max(
        MIN_CARD_SIZE + CARD_OUTER_GAP,
        Math.min(width - horizontalPadding, MAX_BOARD_WIDTH),
      );

      const effectiveColumns = normalizeColumns({
        preferredColumns: columns,
        cardsCount: cards.length,
        availableWidth,
      });

      const maxCardSize = getMaxCardSize(width, isLandscape);

      const rawCardSize = Math.floor(
        availableWidth / effectiveColumns - CARD_OUTER_GAP,
      );

      const cardSize = clamp(rawCardSize, MIN_CARD_SIZE, maxCardSize);

      const boardWidth = Math.min(
        availableWidth,
        effectiveColumns * (cardSize + CARD_OUTER_GAP),
      );

      return {
        cardSize,
        boardWidth,
        effectiveColumns,
      };
    }, [cards.length, columns, isLandscape, width]);

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
      return <View style={styles.emptyContainer} />;
    }

    return (
      <View style={styles.container}>
        <View
          style={[
            styles.board,
            {
              width: boardMetrics.boardWidth,
            },
          ]}
        >
          {cards.map((card) => (
            <MemoryCard
              key={card.id}
              card={card}
              size={boardMetrics.cardSize}
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

  emptyContainer: {
    width: '100%',
    minHeight: 180,
  },

  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
});
