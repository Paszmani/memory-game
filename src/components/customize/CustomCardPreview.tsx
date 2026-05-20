import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { colors } from '@/constants/colors';
import { CustomThemeCard } from '@/types/theme';

interface Props {
  card:     CustomThemeCard;
  onRemove: () => void;
}

export const CustomCardPreview = memo(({ card, onRemove }: Props) => (
  <Pressable
    onLongPress={onRemove}
    style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    accessibilityHint="Segure para remover"
  >
    <View style={styles.media}>
      {card.imageUri ? (
        <Image
          source={{ uri: card.imageUri }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <Text style={styles.emoji}>{card.emoji}</Text>
      )}
    </View>

    <Text style={styles.label} numberOfLines={1}>{card.label}</Text>
    <Text style={styles.hint}>Segure p/ remover</Text>
  </Pressable>
));

CustomCardPreview.displayName = 'CustomCardPreview';

const styles = StyleSheet.create({
  container: {
    width:           '30%',
    minWidth:        95,
    backgroundColor: colors.surface,
    borderRadius:    16,
    padding:         10,
    alignItems:      'center',
    gap:             6,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  pressed: {
    opacity:   0.75,
    transform: [{ scale: 0.97 }],
  },
  media: {
    width:           62,
    height:          62,
    borderRadius:    12,
    overflow:        'hidden',
    backgroundColor: colors.surfaceLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  image: {
    width:  '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 38,
  },
  label: {
    color:      colors.text,
    fontWeight: '700',
    fontSize:   13,
    textAlign:  'center',
  },
  hint: {
    color:     colors.textMuted,
    fontSize:  10,
    textAlign: 'center',
  },
});