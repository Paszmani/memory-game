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
  animSettings: Pick<AnimationSettings,
    'enabled' | 'flipStyle' | 'flipSpeedMs' | 'matchAnimation'>;
  size:        number;
}

export const MemoryCard = memo(({ card, onPress, cardStyle, animSettings, size }: Props) => {
  const { enabled, flipStyle, flipSpeedMs, matchAnimation } = animSettings;
  const isVisible    = card.isFlipped || card.isMatched;
  const borderRadius = CARD_BORDER_RADIUS[cardStyle.shape] ?? 16;
  const emojiSize    = Math.round(size * 0.40 * cardStyle.emojiSizeScale);

  // ── Flip animation (0 = verso, 1 = frente) ─────────────────────────
  const flipAnim  = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    if (!enabled) { flipAnim.setValue(isVisible ? 1 : 0); return; }
    Animated.timing(flipAnim, {
      toValue:         isVisible ? 1 : 0,
      duration:        flipSpeedMs,
      useNativeDriver: false,
    }).start();
  }, [isVisible, flipAnim, enabled, flipSpeedMs]);

  // ── Match animation ────────────────────────────────────────────────
  const matchScale = useRef(new Animated.Value(1)).current;
  const matchGlow  = useRef(new Animated.Value(0)).current;
  const prevMatched = useRef(card.isMatched);

  useEffect(() => {
    if (!card.isMatched || prevMatched.current) { prevMatched.current = card.isMatched; return; }
    prevMatched.current = true;

    if (!enabled || matchAnimation === 'none') return;

    if (matchAnimation === 'bounce') {
      Animated.sequence([
        Animated.timing(matchScale, { toValue: 1.28, duration: 140, useNativeDriver: false }),
        Animated.spring(matchScale,  { toValue: 1,    useNativeDriver: false, damping: 8, stiffness: 200 }),
      ]).start();
    } else if (matchAnimation === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(matchScale, { toValue: 1.12, duration: 180, useNativeDriver: false }),
          Animated.timing(matchScale, { toValue: 0.94, duration: 180, useNativeDriver: false }),
        ]),
        { iterations: 2 },
      ).start(() => Animated.spring(matchScale, { toValue: 1, useNativeDriver: false }).start());
    } else if (matchAnimation === 'glow') {
      Animated.sequence([
        Animated.timing(matchGlow, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.timing(matchGlow, { toValue: 0, duration: 400, useNativeDriver: false }),
      ]).start();
    }
  }, [card.isMatched, enabled, matchAnimation, matchScale, matchGlow]);

  const glowShadow = matchGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });

  const borderColor = card.isMatched ? cardStyle.matchedColor
    : isVisible    ? cardStyle.borderColor
    : colors.border;

  const faceBase = {
    width: size, height: size, borderRadius,
    borderWidth: cardStyle.borderWidth, borderColor,
  };

  // ── FADE / ZOOM (duas faces sobrepostas) ──────────────────────────
  if (flipStyle === 'fade' || flipStyle === 'zoom') {
    const backOpacity  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const frontOpacity = flipAnim;
    const backScale    = flipStyle === 'zoom'
      ? flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.65] })
      : 1;
    const frontScale   = flipStyle === 'zoom'
      ? flipAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] })
      : 1;

    return (
      <Pressable onPress={onPress} disabled={card.isMatched || isVisible} style={styles.wrapper}>
        <Animated.View style={[
          styles.relative,
          { width: size, height: size },
          { transform: [{ scale: matchScale }] },
          card.isMatched && cardStyle.glowOnMatch && {
            shadowColor:   cardStyle.matchedColor,
            shadowOffset:  { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius:  glowShadow as unknown as number,
            elevation:     6,
          },
        ]}>
          {/* Verso */}
          <Animated.View style={[
            styles.face, styles.abs, faceBase,
            { backgroundColor: cardStyle.backColor },
            { opacity: backOpacity, transform: [{ scale: typeof backScale === 'number' ? backScale : backScale as never }] },
          ]}>
            <BackContent />
          </Animated.View>
          {/* Frente */}
          <Animated.View style={[
            styles.face, styles.abs, faceBase,
            {
              backgroundColor: card.isMatched
                ? `${cardStyle.matchedColor}22`
                : cardStyle.frontColor,
            },
            { opacity: frontOpacity, transform: [{ scale: typeof frontScale === 'number' ? frontScale : frontScale as never }] },
          ]}>
            <FrontContent card={card} emojiSize={emojiSize} size={size} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }

  // ── HORIZONTAL / VERTICAL (rotação 3D) ───────────────────────────
  const axis        = flipStyle === 'vertical' ? 'rotateX' : 'rotateY';
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '180deg'] });
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'  ] });
  const flipScale   = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.05, 1] });

  return (
    <Pressable onPress={onPress} disabled={card.isMatched || isVisible} style={styles.wrapper}>
      <Animated.View style={[
        styles.relative,
        { width: size, height: size },
        { transform: [{ scale: matchScale }] },
        Platform.OS === 'web' && (styles.perspective as object),
        card.isMatched && cardStyle.glowOnMatch && {
          shadowColor:   cardStyle.matchedColor,
          shadowOffset:  { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius:  glowShadow as unknown as number,
          elevation:     6,
        },
      ]}>
        {/* Verso */}
        <Animated.View style={[
          styles.face, styles.abs, faceBase,
          { backgroundColor: cardStyle.backColor },
          {
            transform:          [{ scale: flipScale }, { [axis]: backRotate } as any],
            backfaceVisibility: 'hidden',
          },
        ]}>
          <BackContent />
        </Animated.View>

        {/* Frente */}
        <Animated.View style={[
          styles.face, styles.abs, faceBase,
          {
            backgroundColor: card.isMatched
              ? `${cardStyle.matchedColor}22`
              : cardStyle.frontColor,
          },
          {
            transform:          [{ scale: flipScale }, { [axis]: frontRotate } as any],
            backfaceVisibility: 'hidden',
          },
        ]}>
          <FrontContent card={card} emojiSize={emojiSize} size={size} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

MemoryCard.displayName = 'MemoryCard';

function BackContent() {
  return <Text style={styles.qMark}>?</Text>;
}

function FrontContent({ card, emojiSize, size }: {
  card: CardType; emojiSize: number; size: number;
}) {
  if (card.imageUri) {
    return (
      <Image
        source={{ uri: card.imageUri }}
        style={{ width: size - 10, height: size - 10, borderRadius: 4 }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
    );
  }
  return <Text style={{ fontSize: emojiSize, textAlign: 'center' }}>{card.emoji}</Text>;
}

const styles = StyleSheet.create({
  wrapper:     { margin: 4 },
  relative:    { position: 'relative' },
  abs:         { position: 'absolute', top: 0, left: 0 },
  face:        { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  perspective: { perspective: 1000 } as object,
  qMark:       { fontSize: 22, fontWeight: '900', color: colors.textMuted },
});