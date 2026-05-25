import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  value:    boolean;
  onToggle: (value: boolean) => void;
  label?:   string;
  hint?:    string;
  disabled?: boolean;
}

const THUMB_SIZE  = 24;
const TRACK_W     = 52;
const TRACK_H     = 30;
const TRAVEL      = TRACK_W - THUMB_SIZE - 4;

export const ToggleSwitch = memo(({ value, onToggle, label, hint, disabled }: Props) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue:         value ? 1 : 0,
      tension:         120,
      friction:        8,
      useNativeDriver: true,
    }).start();
  }, [value, anim]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, TRAVEL] });
  const trackColor = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.surfaceLight, colors.primary] });

  return (
    <Pressable
      onPress={() => !disabled && onToggle(!value)}
      style={[styles.row, disabled && styles.disabled]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      {(label || hint) && (
        <View style={styles.textArea}>
          {label && <Text style={styles.label}>{label}</Text>}
          {hint  && <Text style={styles.hint}>{hint}</Text>}
        </View>
      )}

      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </Pressable>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap:            12,
  },
  disabled: { opacity: 0.4 },
  textArea: { flex: 1, gap: 2 },
  label: {
    color:      colors.text,
    fontSize:   15,
    fontWeight: '600',
  },
  hint: {
    color:    colors.textMuted,
    fontSize: 12,
  },
  track: {
    width:        TRACK_W,
    height:       TRACK_H,
    borderRadius: TRACK_H / 2,
    justifyContent: 'center',
  },
  thumb: {
    width:        THUMB_SIZE,
    height:       THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.text,
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation:    2,
  },
});