import React, { memo, useEffect, useMemo, useRef } from 'react';

import { Animated, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface Props {
  status: SaveStatus;
  onSave: () => void;
  onReset?: () => void;
}

export const SaveBar = memo(({ status, onSave, onReset }: Props) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const colors = useColors();
  const typography = useTypography();
  const { settings } = useAppSettings();

  const isVisible = status !== 'idle';
  const radius = Math.max(12, settings.ui.globalRadius ?? 16);
  const useGlass = settings.ui.useGlassmorphism;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isVisible ? 1 : 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  const statusMap = useMemo(
    () => ({
      idle: {
        label: '',
        color: colors.textMuted,
        icon: '',
      },
      dirty: {
        label: 'Alterações não salvas',
        color: colors.primary,
        icon: '●',
      },
      saving: {
        label: 'Salvando...',
        color: colors.textSecondary,
        icon: '⟳',
      },
      saved: {
        label: 'Salvo com sucesso!',
        color: colors.primary,
        icon: '✓',
      },
      error: {
        label: 'Erro ao salvar',
        color: colors.danger,
        icon: '✗',
      },
    }),
    [colors],
  );

  if (status === 'idle') {
    return null;
  }

  const cfg = statusMap[status];

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          borderColor: cfg.color,
          borderRadius: radius,
          backgroundColor: useGlass ? colors.glass : colors.surface,
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.left}>
        <Text
          style={[
            styles.icon,
            typography.bold,
            {
              color: cfg.color,
            },
          ]}
        >
          {cfg.icon}
        </Text>

        <Text
          style={[
            styles.statusText,
            typography.semiBold,
            {
              color: cfg.color,
            },
          ]}
        >
          {cfg.label}
        </Text>
      </View>

      <View style={styles.right}>
        {onReset && status === 'dirty' && (
          <AppButton
            title="Descartar"
            variant="ghost"
            size="sm"
            onPress={onReset}
          />
        )}

        {(status === 'dirty' || status === 'error') && (
          <AppButton title="Salvar" size="sm" onPress={onSave} />
        )}
      </View>
    </Animated.View>
  );
});

SaveBar.displayName = 'SaveBar';

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  icon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 13,
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    gap: 8,
  },
});