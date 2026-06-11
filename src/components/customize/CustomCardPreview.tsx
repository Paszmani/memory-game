import React, { memo } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { colors } from '@/constants/colors';
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri';
import type { CustomThemeCard } from '@/types/theme';

interface Props {
  card: CustomThemeCard;
  onRemove: () => void;
}

export const CustomCardPreview = memo(({ card, onRemove }: Props) => {
  const resolvedImageUri = useResolvedImageUri(card.imageUri);

  return (
    <View style={styles.card}>
      <Pressable onPress={onRemove} style={styles.removeButton}>
        <Text style={styles.removeText}>×</Text>
      </Pressable>

      {resolvedImageUri ? (
        <Image
          source={{ uri: resolvedImageUri }}
          style={styles.image}
          contentFit="cover"
          contentPosition="center"
          cachePolicy="memory-disk"
          transition={0}
        />
      ) : (
        <Text style={styles.emoji}>{card.emoji ?? card.label}</Text>
      )}
    </View>
  );
});

CustomCardPreview.displayName = 'CustomCardPreview';

const styles = StyleSheet.create({
  card: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    color: colors.text,
    fontSize: 30,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
});