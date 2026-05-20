import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { CARD_BORDER_RADIUS } from '@/constants/defaultSettings';
import { CardStyleSettings } from '@/types/settings';
import { MemoryCard as MemoryCardType } from '@/types/game';

interface Props {
  card:      MemoryCardType;
  onPress:   () => void;
  cardStyle: CardStyleSettings;
  animated?: boolean;
}

const FLIP_DURATION_MS  = 300;
const FRONT_ROTATION    = '0deg';
const BACK_ROTATION     = '180deg';
const HALF_ROTATION     = '90deg';

export const MemoryCard = memo(({ card, onPress, cardStyle, animated = true }: Props) => {
  const flipAnim    = useRef(new Animated.Value(card.isFlipped || card.isMatched ? 1 : 0)).current;
  const isVisible   = card.isFlipped || card.isMatched;
  const borderRadius = CARD_BORDER_RADIUS[cardStyle.shape] ?? 16;

  useEffect(() => {
    if (!animated) {
      flipAnim.setValue(isVisible ? 1 : 0);
      return;
    }

    Animated.timing(flipAnim, {
      toValue:         isVisible ? 1 : 0,
      duration:        FLIP_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [isVisible, flipAnim, animated]);

  const frontRotate = flipAnim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [BACK_ROTATION, HALF_ROTATION, FRONT_ROTATION],
  });

  const backRotate = flipAnim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [FRONT_ROTATION, HALF_ROTATION, BACK_ROTATION],
  });

  const scale = flipAnim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });

  const borderColor = card.isMatched
    ? cardStyle.matchedColor
    : isVisible
      ? cardStyle.borderColor
      : colors.border;

  return (
    <Pressable
      onPress={onPress}
      disabled={card.isMatched || isVisible}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel={isVisible ? card.label : 'Carta virada'}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          { transform: [{ scale }] },
        ]}
      >
        {/* Verso */}
        <Animated.View
          style={[
            styles.face,
            {
              backgroundColor: cardStyle.backColor,
              borderColor,
              borderRadius,
              borderWidth:     cardStyle.borderWidth,
              transform:       [{ rotateY: backRotate }],
            },
          ]}
        >
          <Text style={styles.questionMark}>?</Text>
        </Animated.View>

        {/* Frente */}
        <Animated.View
          style={[
            styles.face,
            styles.front,
            {
              backgroundColor: card.isMatched
                ? `${cardStyle.matchedColor}22`
                : cardStyle.frontColor,
              borderColor,
              borderRadius,
              borderWidth:     cardStyle.borderWidth,
              transform:       [{ rotateY: frontRotate }],
            },
          ]}
        >
          {card.imageUri ? (
            <Image
              source={{ uri: card.imageUri }}
              style={[styles.image, { borderRadius: borderRadius - 2 }]}
              contentFit="cover"
              transition={120}
            />
          ) : (
            <Text style={styles.emoji}>{card.emoji}</Text>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

MemoryCard.displayName = 'MemoryCard';

import { colors } from '@/constants/colors';

const styles = StyleSheet.create({
  wrapper: {
    flex:        1,
    aspectRatio: 1,
    margin:      5,
  },
  cardContainer: {
    flex:     1,
    position: 'relative',
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    alignItems:      'center',
    justifyContent:  'center',
    backfaceVisibility: 'hidden',
    overflow:        'hidden',
  },
  front: {
    // posicionada sobre o verso
  },
  questionMark: {
    fontSize:   28,
    fontWeight: '900',
    color:      colors.textMuted,
  },
  emoji: {
    fontSize: 36,
  },
  image: {
    width:  '90%',
    height: '90%',
  },
});