import React, { memo } from 'react';

import { FlatList, StyleSheet, View } from 'react-native';

import { MemoryCard } from '@/components/game/MemoryCard';
import type { MemoryCard as MemoryCardType } from '@/types/game';
import type {
  AnimationSettings,
  CardStyleSettings,
  GridColumns,
} from '@/types/settings';

interface Props {
  cards: MemoryCardType[];
  columns: GridColumns;
  cardStyle: CardStyleSettings;
  animationSettings?: AnimationSettings;
  showLabels?: boolean;
  onFlip: (cardId: string) => void;
}

export const MemoryBoard = memo(
  ({
    cards,
    columns,
    cardStyle,
    animationSettings,
    showLabels = false,
    onFlip,
  }: Props) => {
    const safeColumns = Math.max(2, Math.min(6, columns));

    return (
      <View style={styles.container}>
        <FlatList
          key={`board-${safeColumns}`}
          data={cards}
          numColumns={safeColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          columnWrapperStyle={safeColumns > 1 ? styles.row : undefined}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.item, { width: `${100 / safeColumns}%` }]}>
              <MemoryCard
                card={item}
                cardStyle={cardStyle}
                animationSettings={animationSettings}
                showLabel={showLabels}
                onPress={() => onFlip(item.id)}
              />
            </View>
          )}
          removeClippedSubviews={false}
        />
      </View>
    );
  },
);

MemoryBoard.displayName = 'MemoryBoard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  content: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'center',
  },
  item: {
    flexGrow: 0,
    flexShrink: 0,
  },
});
