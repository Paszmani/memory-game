import React, { memo } from 'react';

import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';

interface Props {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SectionCard = memo(({ title, children, style }: Props) => {
  const colors = useColors();
  const typography = useTypography();
  const { settings } = useAppSettings();

  const radius = Math.max(12, settings.ui.globalRadius ?? 16);
  const useGlass = settings.ui.useGlassmorphism;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: useGlass ? colors.glass : colors.surface,
          borderColor: useGlass ? colors.glassBorder : colors.border,
          borderRadius: radius + 6,
        },
        style,
      ]}
    >
      {!!title && (
        <Text
          style={[
            styles.title,
            typography.bold,
            {
              color: colors.text,
            },
          ]}
        >
          {title}
        </Text>
      )}

      {children}
    </View>
  );
});

SectionCard.displayName = 'SectionCard';

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 14,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 2,
  },
});