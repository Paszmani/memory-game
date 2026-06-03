import React, { memo, useMemo, useRef } from 'react';

import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';

type Variant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'
  | 'success'
  | 'warning';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export const AppButton = memo(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    style,
    contentStyle,
  }: Props) => {
    const colors = useColors();
    const typography = useTypography();
    const { settings } = useAppSettings();

    const scale = useRef(new Animated.Value(1)).current;

    const radius = Math.max(8, settings.ui.globalRadius ?? 16);
    const buttonStyle = settings.ui.buttonStyle ?? 'filled';
    const useGlass = settings.ui.useGlassmorphism;

    function onIn() {
      if (disabled) return;

      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 60,
      }).start();
    }

    function onOut() {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 60,
      }).start();
    }

    const padding = {
      sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 13 },
      md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 },
      lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 17 },
      xl: { paddingVertical: 22, paddingHorizontal: 40, fontSize: 19 },
    }[size];

    const tone = useMemo(() => {
      switch (variant) {
        case 'secondary':
          return {
            backgroundColor: useGlass ? colors.glass : colors.surfaceElevated,
            borderColor: useGlass ? colors.glassBorder : colors.borderLight,
            textColor: colors.text,
          };

        case 'danger':
          return {
            backgroundColor: colors.danger,
            borderColor: colors.danger,
            textColor: '#FFFFFF',
          };

        case 'ghost':
          return {
            backgroundColor: 'transparent',
            borderColor: colors.border,
            textColor: colors.text,
          };

        case 'success':
          return {
            backgroundColor: colors.success,
            borderColor: colors.success,
            textColor: colors.background,
          };

        case 'warning':
          return {
            backgroundColor: colors.primarySurfaceStrong,
            borderColor: colors.primaryBorder,
            textColor: colors.primary,
          };

        case 'primary':
        default:
          return {
            backgroundColor: colors.buttonPrimaryBg,
            borderColor: colors.buttonPrimaryBorder,
            textColor: colors.buttonPrimaryText,
          };
      }
    }, [colors, useGlass, variant]);

    const visual = useMemo(() => {
      if (buttonStyle === 'outlined') {
        return {
          backgroundColor:
            variant === 'ghost'
              ? 'transparent'
              : useGlass
                ? colors.glass
                : 'transparent',
          borderColor: tone.borderColor,
          textColor:
            variant === 'primary' || variant === 'warning'
              ? colors.primary
              : tone.textColor,
        };
      }

      if (buttonStyle === 'flat') {
        return {
          backgroundColor:
            variant === 'primary'
              ? colors.primaryGlow
              : variant === 'secondary'
                ? colors.primarySurface
                : variant === 'ghost'
                  ? 'transparent'
                  : tone.backgroundColor,
          borderColor: 'transparent',
          textColor:
            variant === 'primary' || variant === 'warning'
              ? colors.primary
              : tone.textColor,
        };
      }

      return tone;
    }, [buttonStyle, colors, tone, useGlass, variant]);

    return (
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        disabled={disabled}
        style={[fullWidth && styles.fullWidth, style]}
      >
        <Animated.View
          style={[
            styles.base,
            fullWidth && styles.fullWidth,
            {
              backgroundColor: disabled ? colors.surface : visual.backgroundColor,
              borderColor: disabled ? colors.border : visual.borderColor,
              borderRadius: radius,
              paddingVertical: padding.paddingVertical,
              paddingHorizontal: padding.paddingHorizontal,
              opacity: disabled ? 0.5 : 1,
              transform: [{ scale }],
            },
            contentStyle,
          ]}
        >
          <Text
            style={[
              styles.label,
              typography.bold,
              {
                color: disabled ? colors.textMuted : visual.textColor,
                fontSize: padding.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        </Animated.View>
      </Pressable>
    );
  },
);

AppButton.displayName = 'AppButton';

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    minHeight: 46,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});