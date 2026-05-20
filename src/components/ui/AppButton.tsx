import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  title:     string;
  onPress:   () => void;
  variant?:  Variant;
  size?:     Size;
  disabled?: boolean;
  fullWidth?: boolean;
  style?:    ViewStyle;
  icon?:     React.ReactNode;
}

const VARIANT_STYLES: Record<Variant, ViewStyle> = {
  primary:   { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceLight },
  danger:    { backgroundColor: colors.danger },
  ghost:     { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.border },
  success:   { backgroundColor: colors.success },
};

const SIZE_STYLES: Record<Size, { height: number; paddingH: number; fontSize: number; radius: number }> = {
  sm: { height: 40,  paddingH: 14, fontSize: 14, radius: 10 },
  md: { height: 52,  paddingH: 20, fontSize: 16, radius: 14 },
  lg: { height: 64,  paddingH: 28, fontSize: 18, radius: 18 },
  xl: { height: 80,  paddingH: 36, fontSize: 22, radius: 22 },
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
  const sizeConfig = SIZE_STYLES[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        VARIANT_STYLES[variant],
        {
          minHeight:     sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingH,
          borderRadius:  sizeConfig.radius,
          alignSelf:     fullWidth ? 'stretch' : 'auto',
          opacity:       (pressed && !disabled) ? 0.8 : disabled ? 0.4 : 1,
          transform:     [{ scale: (pressed && !disabled) ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {icon && <>{icon}</>}
      <Text
        style={[
          styles.label,
          {
            fontSize:  sizeConfig.fontSize,
            color:     variant === 'primary' ? colors.background : colors.text,
          },
        ]}
      >
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
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});