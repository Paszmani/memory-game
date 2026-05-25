import React, { memo, useEffect, useMemo, useRef } from 'react';

import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';

import { CARD_BORDER_RADIUS } from '@/constants/defaultSettings';
import { colors } from '@/constants/colors';
import type { MemoryCard as MemoryCardType } from '@/types/game';
import type { AnimationSettings, CardStyleSettings } from '@/types/settings';

interface Props {
  card: MemoryCardType;
  onPress: () => void;
  cardStyle: CardStyleSettings;
  animationSettings?: AnimationSettings;
  animated?: boolean;
  showLabel?: boolean;
}

const FRONT_ROTATION = '0deg';
const BACK_ROTATION = '180deg';
const HALF_ROTATION = '90deg';

function getBackPattern(cardStyle: CardStyleSettings) {
  switch (cardStyle.backPattern) {
    case 'dots':
      return '•';
    case 'grid':
      return '▦';
    case 'emoji':
      return cardStyle.backPatternEmoji || '?';
    case 'solid':
    default:
      return '';
  }
}

export const MemoryCard = memo(
  ({
    card,
    onPress,
    cardStyle,
    animationSettings,
    animated = true,
    showLabel = false,
  }: Props) => {
    const isVisible = card.isFlipped || card.isMatched;

    const flipAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

    const borderRadius = CARD_BORDER_RADIUS[cardStyle.shape] ?? 16;

    const shouldAnimate = animated && (animationSettings?.enabled ?? true);
    const flipDurationMs = animationSettings?.flipSpeedMs ?? 300;

    useEffect(() => {
      if (!shouldAnimate) {
        flipAnim.setValue(isVisible ? 1 : 0);
        return;
      }

      Animated.timing(flipAnim, {
        toValue: isVisible ? 1 : 0,
        duration: flipDurationMs,
        useNativeDriver: true,
      }).start();
    }, [isVisible, flipAnim, shouldAnimate, flipDurationMs]);

    const frontRotate = flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [BACK_ROTATION, HALF_ROTATION, FRONT_ROTATION],
    });

    const backRotate = flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [FRONT_ROTATION, HALF_ROTATION, BACK_ROTATION],
    });

    const scale = flipAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.04, 1],
    });

    const borderColor = card.isMatched
      ? cardStyle.matchedColor
      : isVisible
        ? cardStyle.borderColor
        : colors.border;

    const backPattern = useMemo(() => getBackPattern(cardStyle), [cardStyle]);

    const borderWidth =
      cardStyle.borderStyleType === 'none'
        ? 0
        : cardStyle.borderStyleType === 'subtle'
          ? 1
          : cardStyle.borderStyleType === 'bold' ||
              cardStyle.borderStyleType === 'glow'
            ? Math.max(3, cardStyle.borderWidth)
            : cardStyle.borderWidth;

    const frontAnimatedStyle = {
      backfaceVisibility: 'hidden' as const,
      transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
    } as unknown as ViewStyle;

    const backAnimatedStyle = {
      backfaceVisibility: 'hidden' as const,
      transform: [{ perspective: 1000 }, { rotateY: backRotate }],
    } as unknown as ViewStyle;

    const containerAnimatedStyle = {
      transform: [{ scale }],
    } as unknown as ViewStyle;

    const shadowStyle =
      cardStyle.shadowEnabled || (card.isMatched && cardStyle.glowOnMatch)
        ? {
            shadowColor: card.isMatched ? cardStyle.matchedColor : '#000000',
            shadowOpacity: card.isMatched && cardStyle.glowOnMatch ? 0.45 : 0.22,
            shadowRadius: card.isMatched && cardStyle.glowOnMatch ? 14 : 8,
            shadowOffset: { width: 0, height: 6 },
            elevation: card.isMatched && cardStyle.glowOnMatch ? 8 : 4,
          }
        : undefined;

    return (
      <Pressable
        onPress={onPress}
        disabled={card.isMatched || isVisible}
        style={styles.wrapper}
      >
        <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
          <Animated.View
            style={[
              styles.face,
              backAnimatedStyle,
              shadowStyle,
              {
                backgroundColor: cardStyle.backColor,
                borderRadius,
                borderWidth,
                borderColor:
                  cardStyle.borderStyleType === 'glow'
                    ? cardStyle.borderColor
                    : colors.border,
              },
            ]}
          >
            {!!backPattern && (
              <Text
                style={[
                  styles.questionMark,
                  {
                    color: cardStyle.backPatternColor || cardStyle.textColor,
                    fontSize: 28 * cardStyle.emojiSizeScale,
                  },
                ]}
              >
                {backPattern}
              </Text>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.face,
              styles.front,
              frontAnimatedStyle,
              shadowStyle,
              {
                backgroundColor: card.isMatched
                  ? cardStyle.matchedColor
                  : cardStyle.frontColor,
                borderRadius,
                borderWidth,
                borderColor,
                opacity: card.isMatched ? cardStyle.matchedOpacity : 1,
              },
            ]}
          >
            {card.imageUri ? (
              <Image source={{ uri: card.imageUri }} style={styles.image} />
            ) : (
              <Text
                style={[
                  styles.emoji,
                  {
                    color: cardStyle.textColor,
                    fontSize: 36 * cardStyle.emojiSizeScale,
                  },
                ]}
              >
                {card.emoji}
              </Text>
            )}

            {showLabel && (
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color: cardStyle.textColor,
                  },
                ]}
              >
                {card.label}
              </Text>
            )}
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  },
);

MemoryCard.displayName = 'MemoryCard';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    aspectRatio: 1,
    margin: 5,
    minWidth: 64,
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
  },
  face: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  front: {},
  questionMark: {
    fontWeight: '900',
  },
  emoji: {
    textAlign: 'center',
  },
  image: {
    width: '88%',
    height: '88%',
  },
  label: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});