import React, { memo, useEffect, useRef } from 'react';

import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import { formatSeconds } from '@/utils/format';

interface Props {
  visible: boolean;
  moves: number;
  elapsedSeconds: number;
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameFinishedModal = memo(
  ({ visible, moves, elapsedSeconds, onRestart, onGoHome }: Props) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const colors = useColors();
    const typography = useTypography();
    const { settings } = useAppSettings();

    const radius = Math.max(18, settings.ui.globalRadius + 10);
    const useGlass = settings.ui.useGlassmorphism;

    useEffect(() => {
      if (!visible) return;

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),

        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, [visible, scaleAnim, opacityAnim]);

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: colors.overlay,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: useGlass ? colors.glass : colors.surfaceElevated,
                borderColor: useGlass ? colors.glassBorder : colors.primaryBorder,
                borderRadius: radius,
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.emoji}>🎉</Text>

            <Text
              style={[
                styles.title,
                typography.black,
                {
                  color: colors.primary,
                },
              ]}
            >
              Parabéns!
            </Text>

            <Text
              style={[
                styles.subtitle,
                typography.regular,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Você completou o jogo!
            </Text>

            <View
              style={[
                styles.stats,
                {
                  backgroundColor: useGlass ? colors.primaryGlow : colors.surface,
                  borderColor: colors.border,
                  borderRadius: Math.max(14, settings.ui.globalRadius),
                },
              ]}
            >
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    typography.black,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {formatSeconds(elapsedSeconds)}
                </Text>

                <Text
                  style={[
                    styles.statLabel,
                    typography.bold,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  TEMPO
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />

              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    typography.black,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {moves}
                </Text>

                <Text
                  style={[
                    styles.statLabel,
                    typography.bold,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  JOGADAS
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <AppButton title="Jogar novamente" onPress={onRestart} fullWidth />

              <AppButton
                title="Voltar ao início"
                variant="secondary"
                onPress={onGoHome}
                fullWidth
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

GameFinishedModal.displayName = 'GameFinishedModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 28,
    gap: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 34,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    padding: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 44,
  },
  statValue: {
    fontSize: 28,
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
});