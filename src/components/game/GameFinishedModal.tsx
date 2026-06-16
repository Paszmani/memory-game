import React, { memo, useEffect, useMemo, useRef } from 'react';

import { Image } from 'expo-image';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri';
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
    const scaleAnim = useRef(new Animated.Value(0.86)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const colors = useColors();
    const typography = useTypography();
    const { settings } = useAppSettings();

    const radius = Math.max(18, settings.ui.globalRadius + 10);
    const useGlass = settings.ui.useGlassmorphism;

    const finishTitle = settings.branding.finishTitle?.trim() || 'Parabéns!';
    const finishMessage =
      settings.branding.finishMessage?.trim() || 'Você completou o jogo!';
    const finishIcon = settings.branding.finishIcon?.trim() || '';

    const finishIconImageUri = useResolvedImageUri(
      settings.branding.finishIconImageUri,
    );

    const cardStyle = useMemo(
      () => ({
        backgroundColor: useGlass ? colors.glass : colors.surfaceElevated,
        borderColor: useGlass ? colors.glassBorder : colors.border,
        borderRadius: radius,
      }),
      [
        useGlass,
        colors.glass,
        colors.surfaceElevated,
        colors.glassBorder,
        colors.border,
        radius,
      ],
    );

    useEffect(() => {
      if (!visible) return;

      scaleAnim.setValue(0.86);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
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
              cardStyle,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.content}>
              {finishIconImageUri ? (
                <View
                  style={[
                    styles.iconImageWrap,
                    {
                      backgroundColor: colors.primaryGlow,
                      borderColor: colors.primaryBorder,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: finishIconImageUri }}
                    style={styles.iconImage}
                    contentFit="contain"
                    transition={160}
                    cachePolicy="memory-disk"
                  />
                </View>
              ) : finishIcon ? (
                <Text style={styles.emoji}>{finishIcon}</Text>
              ) : null}

              <Text
                style={[
                  styles.title,
                  typography.black,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {finishTitle}
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
                {finishMessage}
              </Text>

              <View
                style={[
                  styles.stats,
                  {
                    backgroundColor: useGlass ? colors.glass : colors.surface,
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
    maxWidth: 420,
    borderWidth: 1,
    overflow: 'hidden',
  },

  content: {
    padding: 28,
    gap: 20,
    alignItems: 'center',
  },

  emoji: {
    fontSize: 64,
    lineHeight: 76,
  },

  iconImageWrap: {
    width: 94,
    height: 94,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  iconImage: {
    width: 78,
    height: 78,
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