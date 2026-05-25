import React, { memo } from 'react';
import { FlatList, StyleSheet } from 'react-native';

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

export const MemoryBoard = memo(({ cards, columns, cardStyle, onFlip }: Props) => {
  const { settings } = useAppSettings();
  const { animation } = settings;

  return (
    <FlatList
      key={`board-${columns}`}
      data={cards}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      scrollEnabled={false}
      removeClippedSubviews={false}
      renderItem={({ item }) => (
        <MemoryCard
          card={item}
          cardStyle={cardStyle}
          animSettings={{
            enabled:     animation.enabled,
            flipStyle:   animation.flipStyle,
            flipSpeedMs: animation.flipSpeedMs,
          }}
          onPress={() => onFlip(item.id)}
        />
      )}
    />
  );
});

MemoryBoard.displayName = 'MemoryBoard';

const styles = StyleSheet.create({
  content: { paddingBottom: 4 },
});