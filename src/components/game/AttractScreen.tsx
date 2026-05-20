import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  message:    string;
  gameTitle:  string;
  onDismiss:  () => void;
}

export const AttractScreen = memo(({ message, gameTitle, onDismiss }: Props) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 500, useNativeDriver: true,
    }).start();

    // Pulso contínuo
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06, duration: 900, useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,    duration: 900, useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim, fadeAnim]);

  return (
    <Pressable style={styles.container} onPress={onDismiss}>
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
    backgroundColor: colors.overlay,
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          999,
  },
  content: {
    alignItems: 'center',
    gap:        32,
    padding:    40,
  },
  title: {
    color:         colors.text,
    fontSize:      48,
    fontWeight:    '900',
    textAlign:     'center',
    letterSpacing: -1,
  },
  touchIndicator: {
    width:           120,
    height:          120,
    borderRadius:    60,
    backgroundColor: colors.primaryGlow,
    borderWidth:     3,
    borderColor:     colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  touchIcon: {
    fontSize: 52,
  },
  message: {
    color:      colors.textSecondary,
    fontSize:   22,
    fontWeight: '600',
    textAlign:  'center',
  },
});