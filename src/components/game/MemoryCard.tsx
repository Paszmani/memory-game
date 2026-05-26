import React, { memo, useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { CARD_BORDER_RADIUS } from '@/constants/defaultSettings';
import { colors }             from '@/constants/colors';
import { AnimationSettings, CardStyleSettings } from '@/types/settings';
import { MemoryCard as CardType }               from '@/types/game';

interface Props {
  card:        CardType;
  onPress:     () => void;
  cardStyle:   CardStyleSettings;
  animSettings: Pick<AnimationSettings, 'enabled' | 'flipStyle' | 'flipSpeedMs'>;
  size:        number;
}

export const MemoryCard = memo(({ card, onPress, cardStyle, animSettings, size }: Props) => {
  const { enabled, flipStyle, flipSpeedMs } = animSettings;
  const isVisible    = card.isFlipped || card.isMatched;
  const borderRadius = CARD_BORDER_RADIUS[cardStyle.shape] ?? 16;
  const emojiSize    = Math.round(size * 0.42 * cardStyle.emojiSizeScale);

  // ── Animated value (0 = back, 1 = front) ─────────────────────────────
  const anim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    if (!enabled) { anim.setValue(isVisible ? 1 : 0); return; }
    Animated.timing(anim, {
      toValue:         isVisible ? 1 : 0,
      duration:        flipSpeedMs,
      useNativeDriver: false, // false para suportar rotateY/X no web
    }).start();
  }, [isVisible, anim, enabled, flipSpeedMs, flipStyle]);

  const borderColor = card.isMatched ? cardStyle.matchedColor
    : isVisible    ? cardStyle.borderColor
    : colors.border;

  const cardBoxStyle = {
    width: size, height: size, borderRadius,
    borderWidth: cardStyle.borderWidth,
  };

  // ── Fade / Zoom: face única ──────────────────────────────────────────
  if (!enabled || flipStyle === 'fade' || flipStyle === 'zoom') {
    const opacity = anim;
    const scale   = flipStyle === 'zoom'
      ? anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] })
      : new Animated.Value(1);

    return (
      <Pressable onPress={onPress} disabled={card.isMatched || isVisible} style={styles.wrapper}>
        <Animated.View style={[
          styles.face, cardBoxStyle,
          {
            backgroundColor: isVisible
              ? card.isMatched ? `${cardStyle.matchedColor}22` : cardStyle.frontColor
              : cardStyle.backColor,
            borderColor,
            opacity,
            transform: [{ scale: scale as unknown as number }],
          },
        ]}>
          {isVisible
            ? <FrontContent card={card} emojiSize={emojiSize} size={size} />
            : <BackContent />}
        </Animated.View>
      </Pressable>
    );
  }

  // ── Horizontal / Vertical: duas faces ───────────────────────────────
  const axis = flipStyle === 'vertical' ? 'rotateX' : 'rotateY';

  const backRotate  = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '180deg'] });
  const frontRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'  ] });
  const scaleAnim   = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.04, 1] });

  return (
    <Pressable onPress={onPress} disabled={card.isMatched || isVisible} style={styles.wrapper}>
      <Animated.View style={[
        styles.relative,
        { width: size, height: size },
        { transform: [{ scale: scaleAnim }] },
        Platform.OS === 'web' && styles.perspective,
      ]}>
        {/* Verso */}
        <Animated.View style={[
          styles.face, styles.absolute, cardBoxStyle,
          { backgroundColor: cardStyle.backColor, borderColor },
          { transform: [{ [axis]: backRotate }], backfaceVisibility: 'hidden' },
        ]}>
          <BackContent />
        </Animated.View>

        {/* Frente */}
        <Animated.View style={[
          styles.face, styles.absolute, cardBoxStyle,
          {
            backgroundColor: card.isMatched
              ? `${cardStyle.matchedColor}22`
              : cardStyle.frontColor,
            borderColor,
          },
          { transform: [{ [axis]: frontRotate }], backfaceVisibility: 'hidden' },
        ]}>
          <FrontContent card={card} emojiSize={emojiSize} size={size} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

MemoryCard.displayName = 'MemoryCard';

// ── Sub-componentes ────────────────────────────────────────────────────────

function BackContent() {
  return <Text style={styles.questionMark}>?</Text>;
}

function FrontContent({ card, emojiSize, size }: {
  card: CardType; emojiSize: number; size: number;
}) {
  if (card.imageUri) {
    return (
      <Image
        source={{ uri: card.imageUri }}
        style={{ width: size - 8, height: size - 8 }}
        contentFit="cover"
        cachePolicy="memory"
        transition={0}
      />
    );
  }
  return <Text style={{ fontSize: emojiSize, textAlign: 'center' }}>{card.emoji}</Text>;
}

const styles = StyleSheet.create({
  wrapper:      { margin: 4 },
  relative:     { position: 'relative' },
  perspective:  Platform.OS === 'web'
    ? ({ perspective: 800 } as object)
    : {},
  face: {
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',
  },
  absolute:     { position: 'absolute', top: 0, left: 0 },
  questionMark: { fontSize: 22, fontWeight: '900', color: colors.textMuted },
});