import React, { memo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { useColors }        from '@/hooks/useColors';
import { useAppSettings }   from '@/hooks/useAppSettings';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  title:     string;
  onPress:   () => void;
  variant?:  Variant;
  size?:     Size;
  fullWidth?: boolean;
  disabled?:  boolean;
}

export const AppButton = memo(({
  title, onPress, variant = 'primary',
  size = 'md', fullWidth = false, disabled = false,
}: Props) => {
  const colors   = useColors();
  const { settings } = useAppSettings();
  const scale    = useRef(new Animated.Value(1)).current;

  function onIn()  { Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 60 }).start(); }
  function onOut() { Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 60 }).start(); }

  const PAD: Record<Size, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
    sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 13 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17 },
    xl: { paddingVertical: 22, paddingHorizontal: 40, fontSize: 19 },
  };

  const BG: Record<Variant, string> = {
    primary:   colors.primary,
    secondary: colors.surface,
    danger:    '#EF4444',
    ghost:     'transparent',
    success:   '#22C55E',
    warning:   '#F59E0B',
  };

  const BORDER: Record<Variant, string> = {
    primary:   colors.primary,
    secondary: colors.border,
    danger:    '#EF4444',
    ghost:     colors.border,
    success:   '#22C55E',
    warning:   '#F59E0B',
  };

  // Texto escuro em fundos claros
  const darkText = variant === 'primary' || variant === 'success' || variant === 'warning';
  const TEXT_COLOR = darkText ? '#0A0A0A' : colors.text;

  const rad = settings.ui.globalRadius ?? 16;
  const p   = PAD[size];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onIn}
      onPressOut={onOut}
      disabled={disabled}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <Animated.View style={[
        styles.base,
        {
          backgroundColor: disabled ? colors.surface : BG[variant],
          borderColor:      disabled ? colors.border  : BORDER[variant],
          borderRadius:     rad,
          paddingVertical:  p.paddingVertical,
          paddingHorizontal: p.paddingHorizontal,
          opacity:          disabled ? 0.5 : 1,
          transform:        [{ scale }],
        },
      ]}>
        <Text style={[styles.label, { fontSize: p.fontSize, color: disabled ? colors.textMuted : TEXT_COLOR }]}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

AppButton.displayName = 'AppButton';

const styles = StyleSheet.create({
  base:  { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  label: { fontWeight: '800', textAlign: 'center' },
});