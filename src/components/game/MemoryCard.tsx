import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { CARD_BORDER_RADIUS } from '@/constants/defaultSettings';
import { colors }             from '@/constants/colors';
import { AnimationSettings, CardStyleSettings } from '@/types/settings';
import { MemoryCard as CardType } from '@/types/game';

interface Props {
  card:        CardType;
  onPress:     () => void;
  cardStyle:   CardStyleSettings;
  animSettings: Pick<AnimationSettings, 'enabled' | 'flipStyle' | 'flipSpeedMs'>;
}

export const MemoryCard = memo(({ card, onPress, cardStyle, animSettings }: Props) => {
  const { enabled, flipStyle, flipSpeedMs } = animSettings;
  const isVisible    = card.isFlipped || card.isMatched;
  const borderRadius = CARD_BORDER_RADIUS[cardStyle.shape] ?? 16;
  const animVal      = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    if (!enabled) {
      animVal.setValue(isVisible ? 1 : 0);
      return;
    }
    Animated.timing(animVal, {
      toValue:         isVisible ? 1 : 0,
      duration:        flipSpeedMs,
      useNativeDriver: flipStyle !== 'fade' && flipStyle !== 'zoom',
    }).start();
  }, [isVisible, animVal, enabled, flipSpeedMs, flipStyle]);

  const borderColor = card.isMatched ? cardStyle.matchedColor
    : isVisible ? cardStyle.borderColor
    : colors.border;

  const faceStyle = {
    backgroundColor: card.isMatched ? `${cardStyle.matchedColor}22` : cardStyle.frontColor,
    borderColor, borderRadius,
    borderWidth: cardStyle.borderWidth,
  };

  const backFaceStyle = {
    backgroundColor: cardStyle.backColor,
    borderColor, borderRadius,
    borderWidth: cardStyle.borderWidth,
  };

  // ── Fade / Zoom: abordagem de face única ──────────────────────────────────
  if (flipStyle === 'fade' || flipStyle === 'zoom') {
    const opacity = animVal;
    const scale   = flipStyle === 'zoom'
      ? animVal.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] })
      : 1;

    return (
      <Pressable
        onPress={onPress}
        disabled={card.isMatched || isVisible}
        style={styles.wrapper}
      >
        <Animated.View
          style={[
            styles.face,
            isVisible ? faceStyle : backFaceStyle,
            { opacity, transform: [{ scale: typeof scale === 'number' ? scale : scale }] },
          ]}
        >
          {isVisible ? <CardFront card={card} cardStyle={cardStyle} /> : <CardBack />}
        </Animated.View>
      </Pressable>
    );
  }

  // ── Horizontal / Vertical: abordagem de duas faces ───────────────────────
  const isHorizontal = flipStyle !== 'vertical';
  const axis         = isHorizontal ? 'rotateY' : 'rotateX';

  const frontRotate = animVal.interpolate({
    inputRange: [0, 1], outputRange: ['180deg', '0deg'],
  });
  const backRotate = animVal.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '180deg'],
  });
  const cardScale = animVal.interpolate({
    inputRange: [0, 0.5, 1], outputRange: [1, 1.04, 1],
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={card.isMatched || isVisible}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: cardScale }] }]}>
        {/* Verso */}
        <Animated.View
          style={[
            styles.face,
            backFaceStyle,
            { transform: [{ [axis]: backRotate }], backfaceVisibility: 'hidden' },
          ]}
        >
          <CardBack />
        </Animated.View>

        {/* Frente */}
        <Animated.View
          style={[
            styles.face,
            styles.frontAbsolute,
            faceStyle,
            { transform: [{ [axis]: frontRotate }], backfaceVisibility: 'hidden' },
          ]}
        >
          <CardFront card={card} cardStyle={cardStyle} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

MemoryCard.displayName = 'MemoryCard';

// ── Subcomponentes ────────────────────────────────────────────────────────────

function CardBack() {
  return <Text style={styles.questionMark}>?</Text>;
}

function CardFront({ card, cardStyle }: { card: CardType; cardStyle: CardStyleSettings }) {
  const emojiSize = Math.round(34 * cardStyle.emojiSizeScale);

  if (card.imageUri) {
    return (
      <Image
        source={{ uri: card.imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={100}
      />
    );
  }
  return <Text style={[styles.emoji, { fontSize: emojiSize }]}>{card.emoji}</Text>;
}

const styles = StyleSheet.create({
  wrapper:       { flex: 1, aspectRatio: 1, margin: 4 },
  container:     { flex: 1, position: 'relative' },
  face: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',
  },
  frontAbsolute: {},
  questionMark:  { fontSize: 26, fontWeight: '900', color: colors.textMuted },
  emoji:         { textAlign: 'center' },
  image:         { width: '90%', height: '90%' },
});