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
  size: number;
}

export const MemoryCard = memo(({ card, onPress, cardStyle, animSettings, size }: Props) => {
  const { enabled, flipStyle, flipSpeedMs, matchAnimation } = animSettings;
  const isVisible    = card.isFlipped || card.isMatched;
  const borderRadius = CARD_BORDER_RADIUS[cardStyle.shape] ?? 16;
  const emojiSize    = Math.round(size * 0.40 * cardStyle.emojiSizeScale);

  const flipAnim  = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const matchScale = useRef(new Animated.Value(1)).current;
  const matchGlow  = useRef(new Animated.Value(0)).current;
  const prevMatched = useRef(card.isMatched);

  useEffect(() => {
    if (!enabled) { flipAnim.setValue(isVisible ? 1 : 0); return; }
    Animated.timing(flipAnim, {
      toValue: isVisible ? 1 : 0, duration: flipSpeedMs, useNativeDriver: false,
    }).start();
  }, [isVisible, flipAnim, enabled, flipSpeedMs]);

  useEffect(() => {
    if (!card.isMatched || prevMatched.current) {
      prevMatched.current = card.isMatched; return;
    }
    prevMatched.current = true;
    if (!enabled || matchAnimation === 'none') return;

    if (matchAnimation === 'bounce') {
      Animated.sequence([
        Animated.timing(matchScale, { toValue: 1.28, duration: 140, useNativeDriver: false }),
        Animated.spring(matchScale,  { toValue: 1, useNativeDriver: false, damping: 8, stiffness: 200 }),
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
        Animated.timing(matchGlow, { toValue: 0, duration: 500, useNativeDriver: false }),
      ]).start();
    }
  }, [card.isMatched, enabled, matchAnimation, matchScale, matchGlow]);

  const borderColor = card.isMatched ? cardStyle.matchedColor
    : isVisible    ? cardStyle.borderColor
    : colors.border;

  const faceBase = { width: size, height: size, borderRadius, borderWidth: cardStyle.borderWidth, borderColor };

  const glowRadius = matchGlow.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });

  const glowStyle = card.isMatched && cardStyle.glowOnMatch ? {
    shadowColor:   cardStyle.matchedColor,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius:  glowRadius as unknown as number,
    elevation:     8,
  } : {};

  // ── Fade / Zoom ──────────────────────────────────────────────────────
  if (flipStyle === 'fade' || flipStyle === 'zoom') {
    const backOpacity  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const frontOpacity = flipAnim;
    const backScale    = flipStyle === 'zoom'
      ? flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.65] }) : 1;
    const frontScale   = flipStyle === 'zoom'
      ? flipAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) : 1;

    return (
      <Pressable onPress={onPress} disabled={card.isMatched || isVisible} style={styles.wrapper}>
        <Animated.View style={[styles.relative, { width: size, height: size }, { transform: [{ scale: matchScale }] }, glowStyle]}>
          <Animated.View style={[styles.face, styles.abs, faceBase, { backgroundColor: cardStyle.backColor },
            { opacity: backOpacity, transform: [{ scale: typeof backScale === 'number' ? backScale : backScale as never }] }]}>
            <BackFace cardStyle={cardStyle} size={size} />
          </Animated.View>
          <Animated.View style={[styles.face, styles.abs, faceBase,
            { backgroundColor: card.isMatched ? `${cardStyle.matchedColor}22` : cardStyle.frontColor },
            { opacity: frontOpacity, transform: [{ scale: typeof frontScale === 'number' ? frontScale : frontScale as never }] }]}>
            <FrontContent card={card} emojiSize={emojiSize} size={size} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }

  // ── Rotação 3D ──────────────────────────────────────────────────────
  const axis       = flipStyle === 'vertical' ? 'rotateX' : 'rotateY';
  const backRot    = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '180deg'] });
  const frontRot   = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'  ] });
  const flipScale  = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.05, 1] });

  return (
    <Pressable onPress={onPress} disabled={card.isMatched || isVisible} style={styles.wrapper}>
      <Animated.View style={[
        styles.relative, { width: size, height: size },
        { transform: [{ scale: matchScale }] },
        Platform.OS === 'web' && ({ perspective: 1000 } as object),
        glowStyle,
      ]}>
        <Animated.View style={[styles.face, styles.abs, faceBase,
          { backgroundColor: cardStyle.backColor },
          ({ transform: [{ scale: flipScale }, { [axis]: backRot }], backfaceVisibility: 'hidden' } as any)]}>
          <BackFace cardStyle={cardStyle} size={size} />
        </Animated.View>
        <Animated.View style={[styles.face, styles.abs, faceBase,
          { backgroundColor: card.isMatched ? `${cardStyle.matchedColor}22` : cardStyle.frontColor },
          ({ transform: [{ scale: flipScale }, { [axis]: frontRot }], backfaceVisibility: 'hidden' } as any)]}>
          <FrontContent card={card} emojiSize={emojiSize} size={size} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

MemoryCard.displayName = 'MemoryCard';

/** Verso da carta — suporta cor, padrão ou imagem */
function BackFace({ cardStyle, size }: { cardStyle: CardStyleSettings; size: number }) {
  if (cardStyle.backPattern === 'image' && cardStyle.backImageUri) {
    return (
      <Image
        source={{ uri: cardStyle.backImageUri }}
        style={{ width: size - 8, height: size - 8 }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    );
  }
  return <Text style={styles.qMark}>?</Text>;
}

function FrontContent({ card, emojiSize, size }: { card: CardType; emojiSize: number; size: number }) {
  if (card.imageUri) {
    return (
      <Image
        source={{ uri: card.imageUri }}
        style={{ width: size - 8, height: size - 8, borderRadius: 4 }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
    );
  }
  return <Text style={{ fontSize: emojiSize, textAlign: 'center' }}>{card.emoji}</Text>;
}

const styles = StyleSheet.create({
  wrapper:  { margin: 4 },
  relative: { position: 'relative' },
  abs:      { position: 'absolute', top: 0, left: 0 },
  face:     { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  qMark:    { fontSize: 22, fontWeight: '900', color: colors.textMuted },
});