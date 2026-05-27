import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  label:    string;
  hint?:    string;
  value:    boolean;
  onToggle: (v: boolean) => void;
}

export const ToggleSwitch = memo(({ label, hint, value, onToggle }: Props) => {
  const colors   = useColors();
  const anim     = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue:         value ? 1 : 0,
      tension:         100, friction: 8,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const thumbX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });

  return (
    <Pressable style={styles.row} onPress={() => onToggle(!value)}>
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text> : null}
      </View>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbX }] }]} />
      </Animated.View>
    </Pressable>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

const styles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  textCol: { flex: 1, gap: 2 },
  label:   { fontSize: 15, fontWeight: '600' },
  hint:    { fontSize: 12 },
  track:   { width: 48, height: 28, borderRadius: 14, justifyContent: 'center' },
  thumb:   {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3, shadowRadius: 2, elevation: 2,
  },
});