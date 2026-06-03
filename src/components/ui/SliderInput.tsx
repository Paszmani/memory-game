import React, { memo, useRef } from 'react';

import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  style?: ViewStyle;
  formatValue?: (value: number) => string;
}

export const SliderInput = memo(
  ({
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    onChange,
    style,
    formatValue,
  }: Props) => {
    const colors = useColors();
    const typography = useTypography();

    const trackWidth = useRef(0);
    const trackRef = useRef<View | null>(null);

    const safeRange = max - min || 1;
    const ratio = Math.max(0, Math.min(1, (value - min) / safeRange));

    const clamp = (nextValue: number) =>
      Math.max(min, Math.min(max, nextValue));

    const snapToStep = (nextValue: number): number => {
      if (step <= 0) return clamp(nextValue);

      return clamp(Math.round((nextValue - min) / step) * step + min);
    };

    const handleTrackLayout = (event: LayoutChangeEvent) => {
      trackWidth.current = event.nativeEvent.layout.width;
    };

    const posToValue = (pageX: number, trackX: number): number => {
      if (!trackWidth.current) return value;

      const pos = pageX - trackX;
      const raw = (pos / trackWidth.current) * (max - min) + min;

      return snapToStep(raw);
    };

    const updateFromPageX = (pageX: number) => {
      trackRef.current?.measure((_x, _y, _w, _h, trackPageX) => {
        onChange(posToValue(pageX, trackPageX));
      });
    };

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: (event) => {
          updateFromPageX(event.nativeEvent.pageX);
        },

        onPanResponderMove: (event) => {
          updateFromPageX(event.nativeEvent.pageX);
        },
      }),
    ).current;

    const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

    return (
      <View style={[styles.container, style]}>
        <View style={styles.header}>
          <Text
            style={[
              styles.label,
              typography.semiBold,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {label}
          </Text>

          <Text
            style={[
              styles.valueText,
              typography.bold,
              {
                color: colors.primary,
                backgroundColor: colors.primaryGlow,
              },
            ]}
          >
            {displayValue}
          </Text>
        </View>

        <View
          ref={trackRef}
          style={[
            styles.track,
            {
              backgroundColor: colors.surfaceLight,
            },
          ]}
          onLayout={handleTrackLayout}
          {...panResponder.panHandlers}
        >
          <View
            style={[
              styles.fill,
              {
                width: `${ratio * 100}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />

          <View
            style={[
              styles.thumb,
              {
                left: `${ratio * 100}%`,
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.range}>
          <Text
            style={[
              styles.rangeText,
              typography.regular,
              {
                color: colors.textMuted,
              },
            ]}
          >
            {min}
            {unit}
          </Text>

          <Text
            style={[
              styles.rangeText,
              typography.regular,
              {
                color: colors.textMuted,
              },
            ]}
          >
            {max}
            {unit}
          </Text>
        </View>
      </View>
    );
  },
);

SliderInput.displayName = 'SliderInput';

const THUMB = 22;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
  },
  valueText: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  track: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: THUMB / 2,
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    marginLeft: -(THUMB / 2),
    top: -(THUMB / 2 - 3),
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  range: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rangeText: {
    fontSize: 11,
  },
});