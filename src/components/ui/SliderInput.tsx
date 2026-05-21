import React, { memo, useCallback, useRef } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  label:      string;
  value:      number;
  min:        number;
  max:        number;
  step?:      number;
  unit?:      string;
  onChange:   (value: number) => void;
  style?:     ViewStyle;
  formatValue?: (v: number) => string;
}

export const SliderInput = memo(({
  label,
  value,
  min,
  max,
  step       = 1,
  unit       = '',
  onChange,
  style,
  formatValue,
}: Props) => {
  const trackWidth = useRef(0);
  const ratio      = (value - min) / (max - min);

  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const snapToStep = (v: number): number => {
    if (step <= 0) return clamp(v);
    return clamp(Math.round((v - min) / step) * step + min);
  };

  const handleTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const posToValue = (pageX: number, trackX: number): number => {
    const pos = pageX - trackX;
    const raw = (pos / trackWidth.current) * (max - min) + min;
    return snapToStep(raw);
  };

  const trackRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        trackRef.current?.measure((_x, _y, _w, _h, pageX) => {
          onChange(posToValue(e.nativeEvent.pageX, pageX));
        });
      },
      onPanResponderMove: (e) => {
        trackRef.current?.measure((_x, _y, _w, _h, pageX) => {
          onChange(posToValue(e.nativeEvent.pageX, pageX));
        });
      },
    }),
  ).current;

  const displayValue = formatValue
    ? formatValue(value)
    : `${value}${unit}`;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>{displayValue}</Text>
      </View>

      <View ref={trackRef} onLayout={handleTrackLayout} {...panResponder.panHandlers}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` as `${number}%` }]} />
          <View style={[styles.thumb, { left: `${ratio * 100}%` as `${number}%` }]} />
        </View>

        {/* Marcadores de min/max */}
        <View style={styles.range}>
          <Text style={styles.rangeText}>{min}{unit}</Text>
          <Text style={styles.rangeText}>{max}{unit}</Text>
        </View>
      </View>
    </View>
  );
});

SliderInput.displayName = 'SliderInput';

const THUMB = 22;

const styles = StyleSheet.create({
  container: { gap: 10 },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  valueText: {
    color:           colors.primary,
    fontSize:        14,
    fontWeight:      '700',
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical:   3,
    borderRadius:    8,
  },
  track: {
    height:          6,
    backgroundColor: colors.surfaceLight,
    borderRadius:    3,
    marginHorizontal: THUMB / 2,
    position:        'relative',
    justifyContent:  'center',
  },
  fill: {
    position:        'absolute',
    left:            0,
    top:             0,
    bottom:          0,
    backgroundColor: colors.primary,
    borderRadius:    3,
  },
  thumb: {
    position:        'absolute',
    width:           THUMB,
    height:          THUMB,
    borderRadius:    THUMB / 2,
    backgroundColor: colors.primary,
    marginLeft:      -(THUMB / 2),
    top:             -(THUMB / 2 - 3),
    shadowColor:     colors.primary,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.5,
    shadowRadius:    4,
    elevation:       4,
  },
  range: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      6,
  },
  rangeText: { color: colors.textMuted, fontSize: 11 },
});