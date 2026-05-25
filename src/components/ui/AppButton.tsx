import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  title:      string;
  onPress:    () => void;
  variant?:   Variant;
  size?:      Size;
  disabled?:  boolean;
  fullWidth?: boolean;
  style?:     ViewStyle;
  icon?:      React.ReactNode;
}

const BG: Record<Variant, string> = {
  primary:   colors.primary,
  secondary: colors.surfaceLight,
  danger:    colors.danger,
  ghost:     'transparent',
  success:   colors.success,
  warning:   colors.warning,
};

// Variantes com fundo claro precisam de texto escuro
const DARK_TEXT_VARIANTS = new Set<Variant>(['primary', 'success', 'warning']);

const BORDER: Partial<Record<Variant, object>> = {
  ghost: { borderWidth: 2, borderColor: colors.border },
};

const SIZE: Record<Size, { height: number; paddingH: number; fontSize: number; radius: number }> = {
  sm: { height: 38,  paddingH: 14, fontSize: 13, radius: 10 },
  md: { height: 52,  paddingH: 20, fontSize: 16, radius: 14 },
  lg: { height: 60,  paddingH: 28, fontSize: 18, radius: 18 },
  xl: { height: 72,  paddingH: 36, fontSize: 20, radius: 20 },
};

export const AppButton = memo(({
  title,
  onPress,
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  fullWidth = false,
  style,
  icon,
}: Props) => {
  const sz         = SIZE[size];
  const textColor  = DARK_TEXT_VARIANTS.has(variant) ? colors.background : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: BG[variant], ...BORDER[variant] },
        {
          minHeight:         sz.height,
          paddingHorizontal: sz.paddingH,
          borderRadius:      sz.radius,
          alignSelf:         fullWidth ? 'stretch' : 'auto',
          opacity:           disabled ? 0.4 : pressed ? 0.82 : 1,
          transform:         [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, { fontSize: sz.fontSize, color: textColor }]}>
        {title}
      </Text>
    </Pressable>
  );
});

AppButton.displayName = 'AppButton';

const styles = StyleSheet.create({
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
  },
  label: {
    fontWeight:    '700',
    letterSpacing: 0.2,
  },
});