import React, { memo } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { BackgroundSettings } from '@/types/settings';

interface Props {
  settings: BackgroundSettings;
  children: React.ReactNode;
  style?:   ViewStyle;
}

const GRADIENT_DIRECTIONS: Record<string, string> = {
  vertical:   'to bottom',
  horizontal: 'to right',
  diagonal:   'to bottom right',
};

function buildWebStyle(settings: BackgroundSettings): object {
  if (settings.type === 'image' && settings.imageUri) {
    return {
      backgroundImage:    `url(${settings.imageUri})`,
      backgroundSize:     'cover',
      backgroundPosition: 'center',
    };
  }

  if (settings.type === 'gradient') {
    const direction = GRADIENT_DIRECTIONS[settings.gradientDirection] ?? 'to bottom';
    return {
      background: `linear-gradient(${direction}, ${settings.gradientStart}, ${settings.gradientEnd})`,
    };
  }

  return { backgroundColor: settings.solidColor };
}

export const GradientBackground = memo(({ settings, children, style }: Props) => {
  const dynamicStyle = Platform.OS === 'web'
    ? buildWebStyle(settings)
    : { backgroundColor: settings.solidColor };

  return (
    <View style={[styles.container, dynamicStyle as ViewStyle, style]}>
      {children}
    </View>
  );
});

GradientBackground.displayName = 'GradientBackground';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});