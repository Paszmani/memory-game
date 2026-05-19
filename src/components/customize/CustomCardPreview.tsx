import { Pressable, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';

import { colors } from '@/constants/colors';
import { CustomThemeCard } from '@/types/theme';

type CustomCardPreviewProps = {
  card: CustomThemeCard;
  onRemove: () => void;
};

export function CustomCardPreview({ card, onRemove }: CustomCardPreviewProps) {
  return (
    <Pressable onLongPress={onRemove} style={styles.container}>
      {card.imageUri ? (
        <Image
          source={{ uri: card.imageUri }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <Text style={styles.emoji}>{card.emoji}</Text>
      )}

      <Text style={styles.label} numberOfLines={1}>
        {card.label}
      </Text>
      <Text style={styles.hint}>Segure para remover</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '30%',
    minWidth: 92,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 58,
    height: 58,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 40,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
});