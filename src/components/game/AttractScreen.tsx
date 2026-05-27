import React, { memo, useEffect, useRef } from 'react';
import {
  Animated, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useColors';

interface Props {
  message:              string;
  gameTitle:            string;
  centerImageUri?:      string;   // substitui emoji central
  onDismiss:            () => void;
}

export const AttractScreen = memo(({
  message, gameTitle, centerImageUri, onDismiss,
}: Props) => {
  const colors     = useColors();
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim, fadeAnim]);

  return (
    <Pressable
      style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.82)' }]}
      onPress={onDismiss}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: colors.primary }]}>{gameTitle}</Text>

        {/* Círculo central — emoji ou imagem customizada */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={[
            styles.circle,
            { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
          ]}>
            {centerImageUri ? (
              <Image
                source={{ uri: centerImageUri }}
                style={styles.centerImage}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.touchIcon}>👆</Text>
            )}
          </View>
        </Animated.View>

        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      </Animated.View>
    </Pressable>
  );
});

AttractScreen.displayName = 'AttractScreen';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  content:   { alignItems: 'center', gap: 36, padding: 40 },
  title: {
    fontSize: 48, fontWeight: '900',
    textAlign: 'center', letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  circle: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  centerImage: { width: 130, height: 130 },
  touchIcon:   { fontSize: 54 },
  message: {
    fontSize: 22, fontWeight: '600', textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
});