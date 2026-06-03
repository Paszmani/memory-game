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

interface Props {
  message: string;
  gameTitle: string;
  centerImageUri?: string;
  onDismiss: () => void;
}

export const AttractScreen = memo(({
  message,
  gameTitle,
  centerImageUri,
  onDismiss,
}: Props) => {
  const colors = useColors();
  const typography = useTypography();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [imageFailed, setImageFailed] = useState(false);

  const safeUri = useMemo(() => {
    if (typeof centerImageUri !== 'string') {
      return undefined;
    }

    const normalized = centerImageUri.trim();
    return normalized.length > 0 ? normalized : undefined;
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
      style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.82)' }]}
      onPress={onDismiss}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text
          style={[
            styles.title,
            typography.getFontStyle('black'),
            { color: colors.primary },
          ]}
        >
          {gameTitle}
        </Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
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
                  typography.getFontStyle('black'),
                  { color: colors.primary },
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
            typography.getFontStyle('semibold'),
            { color: colors.textSecondary },
          ]}
        >
          {message}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

AttractScreen.displayName = 'AttractScreen';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 34,
    textAlign: 'center',
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 999,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerImage: {
    width: '100%',
    height: '100%',
  },
  touchIcon: {
    fontSize: 48,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
  },
});
