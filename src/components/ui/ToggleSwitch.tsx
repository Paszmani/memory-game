import React, { memo, useEffect, useRef } from 'react';

import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';

interface Props {
  value: boolean;
  onToggle: (value: boolean) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

const THUMB_SIZE = 24;
const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 30;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - 4;

export const ToggleSwitch = memo(
  ({ value, onToggle, label, hint, disabled }: Props) => {
    const colors = useColors();
    const typography = useTypography();

    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
      Animated.spring(anim, {
        toValue: value ? 1 : 0,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, [value, anim]);

    const translateX = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [2, TRAVEL],
    });

    const trackColor = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.surfaceLight, colors.primary],
    });

    return (
      <Pressable
        onPress={() => !disabled && onToggle(!value)}
        style={[styles.row, disabled && styles.disabled]}
        accessibilityRole="switch"
        accessibilityState={{
          checked: value,
          disabled,
        }}
      >
        {(label || hint) && (
          <View style={styles.textArea}>
            {!!label && (
              <Text
                style={[
                  styles.label,
                  typography.semiBold,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {label}
              </Text>
            )}

            {!!hint && (
              <Text
                style={[
                  styles.hint,
                  typography.regular,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {hint}
              </Text>
            )}
          </View>
        )}

        <Animated.View
          style={[
            styles.track,
            {
              backgroundColor: trackColor,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                backgroundColor: colors.text,
                transform: [{ translateX }],
              },
            ]}
          />
        </Animated.View>
      </Pressable>
    );
  },
);

ToggleSwitch.displayName = 'ToggleSwitch';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  disabled: {
    opacity: 0.4,
  },
  textArea: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});