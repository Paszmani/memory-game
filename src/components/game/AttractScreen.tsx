import React, { memo, useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  message:     string;
  gameTitle:   string;
  imageUri?:   string;      // ← NOVO
  onDismiss:   () => void;
}

export const AttractScreen = memo(({ message, gameTitle, imageUri, onDismiss }: Props) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim, fadeAnim]);

  return (
    <Pressable style={styles.container} onPress={onDismiss}>
      {/* Imagem de fundo personalizada */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : null}

      {/* Overlay escuro sobre a imagem */}
      <View style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: imageUri ? 'rgba(0,0,0,0.65)' : colors.overlay },
      ]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={styles.title}>{gameTitle}</Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.touchIndicator}>
            <Text style={styles.touchIcon}>👆</Text>
          </View>
        </Animated.View>

        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </Pressable>
  );
});

AttractScreen.displayName = 'AttractScreen';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 999,
  },
  content: { alignItems: 'center', gap: 32, padding: 40 },
  title: {
    color: colors.primary, fontSize: 48, fontWeight: '900',
    textAlign: 'center', letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  touchIndicator: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.primaryGlow,
    borderWidth: 3, borderColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  touchIcon: { fontSize: 52 },
  message: {
    color: colors.textSecondary, fontSize: 22,
    fontWeight: '600', textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});