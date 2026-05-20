import React, { memo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { MemoryCard } from '@/components/game/MemoryCard';
import { CardStyleSettings } from '@/types/settings';
import { MemoryCard as MemoryCardType } from '@/types/game';

interface Props {
  cards:     MemoryCardType[];
  columns:   number;
  cardStyle: CardStyleSettings;
  onFlip:    (cardId: string) => void;
}

export const MemoryBoard = memo(({ cards, columns, cardStyle, onFlip }: Props) => (
  <FlatList
    key={`board-${columns}`}
    data={cards}
    numColumns={columns}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.content}
    scrollEnabled={false}
    renderItem={({ item }) => (
      <MemoryCard
        card={item}
        cardStyle={cardStyle}
        onPress={() => onFlip(item.id)}
      />
    )}
    removeClippedSubviews={false}
  />
));

MemoryBoard.displayName = 'MemoryBoard';

const styles = StyleSheet.create({
  content: {
    paddingBottom: 8,
  },
});