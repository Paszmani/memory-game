import React, { memo, useCallback, useRef } from 'react';
import {
  Animated, PanResponder, StyleSheet,
  Text, View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  label:        string;
  value:        number;
  min:          number;
  max:          number;
  step?:        number;
  unit?:        string;
  onChange:     (v: number) => void;
  formatValue?: (v: number) => string;
}

export const SliderInput = memo(({
  label, value, min, max, step = 1, unit = '', onChange, formatValue,
}: Props) => {
  const colors = useColors();

  const trackW = useRef(0);
  const baseX  = useRef(0);

  function clamp(v: number) {
    const snapped = Math.round(v / step) * step;
    return Math.max(min, Math.min(max, snapped));
  }

  const xFromValue = useCallback((v: number) =>
    ((v - min) / (max - min)) * (trackW.current || 200),
  [min, max]);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:  () => true,
      onMoveShouldSetPanResponder:   () => true,
      onPanResponderGrant: (_e, gs) => { baseX.current = xFromValue(value) - gs.x0; },
      onPanResponderMove: (_e, gs) => {
        const rawX  = gs.moveX + baseX.current;
        const ratio = Math.max(0, Math.min(1, rawX / (trackW.current || 200)));
        onChange(clamp(min + ratio * (max - min)));
      },
    }),
  ).current;

  const filled = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const display = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.val,   { color: colors.primary }]}>{display}</Text>
      </View>
      <View
        style={[styles.track, { backgroundColor: colors.surface }]}
        onLayout={(e) => { trackW.current = e.nativeEvent.layout.width; }}
        {...pan.panHandlers}
      >
        <View style={[styles.filled, { width: `${filled}%`, backgroundColor: colors.primary }]} />
        <View style={[styles.thumb, { left: `${filled}%`, borderColor: colors.primary }]} />
      </View>
    </View>
  );
});

SliderInput.displayName = 'SliderInput';

const styles = StyleSheet.create({
  wrap:   { gap: 10 },
  top:    { flexDirection: 'row', justifyContent: 'space-between' },
  label:  { fontSize: 14, fontWeight: '600' },
  val:    { fontSize: 14, fontWeight: '800' },
  track:  { height: 6, borderRadius: 3, position: 'relative', justifyContent: 'center' },
  filled: { height: 6, borderRadius: 3, position: 'absolute', left: 0 },
  thumb:  {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FFFFFF', borderWidth: 2,
    position: 'absolute', marginLeft: -10,
    top: -7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3, shadowRadius: 2, elevation: 2,
  },
});