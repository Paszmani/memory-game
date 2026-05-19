import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { colors } from '@/constants/colors';
import { MemoryCard as MemoryCardType } from '@/types/game';

type MemoryCardProps = {
  card: MemoryCardType;
  onPress: () => void;
};

export function MemoryCard({ card, onPress }: MemoryCardProps) {
  const isVisible = card.isFlipped || card.isMatched;

  return (
    <Pressable
      onPress={onPress}
      disabled={card.isMatched}
      style={({ pressed }) => [
        styles.card,
        isVisible ? styles.front : styles.back,
        card.isMatched && styles.matched,
        pressed && !card.isMatched && styles.pressed,
      ]}
    >
      {isVisible ? (
        card.imageUri ? (
          <Image
            source={{ uri: card.imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={120}
          />
        ) : (
          <Text style={styles.emoji}>{card.emoji}</Text>
        )
      ) : (
        <View style={styles.hiddenMark}>
          <Text style={styles.hiddenText}>?</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    margin: 5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  front: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primary,
  },
  back: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  matched: {
    borderColor: colors.success,
    opacity: 0.8,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  emoji: {
    fontSize: 34,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hiddenMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
});