import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Image } from 'expo-image';

import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri';

interface Props {
  message: string;
  gameTitle: string;
  centerImageUri?: string;
  onDismiss: () => void;
}

export const AttractScreen = memo(
  ({ message, gameTitle, centerImageUri, onDismiss }: Props) => {
    const colors = useColors();
    const resolvedCenterImageUri = useResolvedImageUri(centerImageUri);
    const typography = useTypography();

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [imageFailed, setImageFailed] = useState(false);

    const safeUri = useMemo(() => {
      if (typeof centerImageUri !== 'string') return undefined;

      const trimmed = centerImageUri.trim();

      return trimmed.length > 0 ? trimmed : undefined;
    }, [centerImageUri]);

    useEffect(() => {
      setImageFailed(false);
    }, [safeUri]);

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      );

      pulse.start();

      return () => pulse.stop();
    }, [fadeAnim, pulseAnim]);

    const showImage = !!safeUri && !imageFailed;

    return (
      <Pressable
        style={[
          styles.container,
          {
            backgroundColor: colors.overlay,
          },
        ]}
        onPress={onDismiss}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {!!gameTitle && (
            <Text
              style={[
                styles.title,
                typography.black,
                {
                  color: colors.primary,
                },
              ]}
            >
              {gameTitle}
            </Text>
          )}

          <Animated.View
            style={[
              styles.circleWrapper,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.circle,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryGlow,
                },
              ]}
            >
              {showImage ? (
                <Image
                  source={safeUri}
                  style={styles.centerImage}
                  contentFit="cover"
                  transition={120}
                  cachePolicy="memory-disk"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <Text
                  style={[
                    styles.touchIcon,
                    typography.black,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  ▶
                </Text>
              )}
            </View>
          </Animated.View>

          <Text
            style={[
              styles.message,
              typography.semiBold,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {message}
          </Text>
        </Animated.View>
      </Pressable>
    );
  },
);

AttractScreen.displayName = 'AttractScreen';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    gap: 28,
  },
  title: {
    fontSize: 38,
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 8,
  },
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerImage: {
    width: '100%',
    height: '100%',
  },
  touchIcon: {
    fontSize: 48,
  },
  message: {
    fontSize: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 4,
  },
});