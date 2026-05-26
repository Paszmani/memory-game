import React, { memo, useMemo } from 'react';
import {
  FlatList, Platform, StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { MemoryCard }       from '@/components/game/MemoryCard';
import { useAppSettings }   from '@/hooks/useAppSettings';
import { CardStyleSettings } from '@/types/settings';
import { MemoryCard as CardType } from '@/types/game';

interface Props {
  cards:     CardType[];
  columns:   number;
  cardStyle: CardStyleSettings;
  onFlip:    (cardId: string) => void;
}

/** Espaço vertical ocupado por topBar + header + footer + safe areas */
const CHROME_H_PORTRAIT  = 210;
const CHROME_H_LANDSCAPE = 160;

const H_PADDING  = 32;
const CARD_GAP   = 8;
const MAX_CARD_P = 180;   // portrait max
const MAX_CARD_L = 110;   // landscape max
const MIN_CARD   = 48;

export const MemoryBoard = memo(({ cards, columns, cardStyle, onFlip }: Props) => {
  const { settings }      = useAppSettings();
  const { animation }     = settings;
  const { width, height } = useWindowDimensions();
  const isLandscape       = width > height;

  const cardSize = useMemo(() => {
    const chromeH  = isLandscape ? CHROME_H_LANDSCAPE : CHROME_H_PORTRAIT;
    const rows     = Math.ceil(cards.length / columns);
    const avW      = width - H_PADDING - CARD_GAP * columns;
    const avH      = height - chromeH - CARD_GAP * rows;

    const byWidth  = Math.floor(avW / columns);
    const byHeight = Math.floor(avH / rows);

    const maxSize  = isLandscape ? MAX_CARD_L : MAX_CARD_P;

    // Em landscape: tenta encaixar sem scroll; em portrait: prioriza largura
    const raw = isLandscape
      ? Math.min(byWidth, byHeight, maxSize)
      : Math.min(byWidth, maxSize);

    return Math.max(MIN_CARD, raw);
  }, [width, height, columns, cards.length, isLandscape]);

  const animSettings = {
    enabled:        animation.enabled,
    flipStyle:      animation.flipStyle,
    flipSpeedMs:    animation.flipSpeedMs,
    matchAnimation: animation.matchAnimation,
  };

  return (
    <FlatList
      key={`board-${columns}-${cardSize}`}
      data={cards}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.content,
        // Centra horizontalmente as cartas
        { paddingHorizontal: Math.max(0, (width - cardSize * columns - CARD_GAP * columns - 8) / 2) },
      ]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      removeClippedSubviews={false}
      renderItem={({ item }) => (
        <MemoryCard
          card={item}
          size={cardSize}
          cardStyle={cardStyle}
          animSettings={animSettings}
          onPress={() => onFlip(item.id)}
        />
      )}
    />
  );
});

MemoryBoard.displayName = 'MemoryBoard';

const styles = StyleSheet.create({
  content: { alignItems: 'center' },
});