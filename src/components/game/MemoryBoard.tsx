import React, { memo } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
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

const H_PADDING    = 32;   // 16px cada lado
const CARD_MARGIN  = 4;    // margem de cada lado da carta

export const MemoryBoard = memo(({ cards, columns, cardStyle, onFlip }: Props) => {
  const { settings }  = useAppSettings();
  const { animation } = settings;
  const { width }     = useWindowDimensions();

  // Calcula tamanho explícito para todas as cartas ficarem iguais
  const totalGap  = CARD_MARGIN * 2 * columns;
  const cardSize  = Math.floor((width - H_PADDING - totalGap) / columns);

  return (
    <FlatList
      key={`board-${columns}`}
      data={cards}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}        // scroll gerenciado pelo pai
      removeClippedSubviews={false}
      renderItem={({ item }) => (
        <MemoryCard
          card={item}
          size={cardSize}
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
  content: { alignItems: 'center' },
});