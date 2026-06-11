import React, { memo } from 'react';

import {
  ImageBackground,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { useResolvedImageUri } from '@/hooks/useResolvedImageUri';
import type { BackgroundSettings } from '@/types/settings';

interface Props {
  settings: BackgroundSettings;
  children: React.ReactNode;
  style?: ViewStyle;
}

const GRADIENT_DIRECTIONS: Record<
  BackgroundSettings['gradientDirection'],
  string
> = {
  vertical: 'to bottom',
  horizontal: 'to right',
  diagonal: 'to bottom right',
};

function buildWebStyle(
  settings: BackgroundSettings,
  resolvedImageUri?: string,
): ViewStyle {
  if (settings.type === 'image' && resolvedImageUri) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,${settings.overlayOpacity}), rgba(0,0,0,${settings.overlayOpacity})), url("${resolvedImageUri}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    } as ViewStyle;
  }

  if (settings.type === 'gradient') {
    const direction = GRADIENT_DIRECTIONS[settings.gradientDirection] ?? 'to bottom';

    return {
      background: `linear-gradient(${direction}, ${settings.gradientStart}, ${settings.gradientEnd})`,
    } as ViewStyle;
  }

  return {
    backgroundColor: settings.solidColor,
  };
}

function getNativeBackgroundColor(settings: BackgroundSettings) {
  if (settings.type === 'gradient') {
    return settings.gradientStart;
  }

  return settings.solidColor;
}

export const GradientBackground = memo(
  ({ settings, children, style }: Props) => {
    const resolvedImageUri = useResolvedImageUri(settings.imageUri);

    if (
      settings.type === 'image' &&
      resolvedImageUri &&
      Platform.OS !== 'web'
    ) {
      return (
        <ImageBackground
          source={{ uri: resolvedImageUri }}
          style={[styles.container, style]}
          imageStyle={styles.image}
          resizeMode="cover"
        >
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: `rgba(0,0,0,${settings.overlayOpacity})`,
              },
            ]}
          >
            {children}
          </View>
        </ImageBackground>
      );
    }

    const dynamicStyle =
      Platform.OS === 'web'
        ? buildWebStyle(settings, resolvedImageUri)
        : {
            backgroundColor: getNativeBackgroundColor(settings),
          };

    return <View style={[styles.container, dynamicStyle, style]}>{children}</View>;
  },
);

GradientBackground.displayName = 'GradientBackground';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});