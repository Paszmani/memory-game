import { FlatList, StyleSheet } from 'react-native';

import { MemoryCard } from '@/components/game/MemoryCard';
import { MemoryCard as MemoryCardType } from '@/types/game';

type MemoryBoardProps = {
  cards: MemoryCardType[];
  columns: number;
  onFlipCard: (cardId: string) => void;
};

export function MemoryBoard({ cards, columns, onFlipCard }: MemoryBoardProps) {
  return (
    <FlatList
      key={columns}
      data={cards}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => (
        <MemoryCard card={item} onPress={() => onFlipCard(item.id)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
});