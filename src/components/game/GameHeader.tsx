import React, { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import type { GameBehaviorSettings } from '@/types/settings';
import { formatSeconds } from '@/utils/format';

interface Props {
  moves: number;
  elapsedSeconds: number;
  /** Tempo limite (s). >0 transforma o cronômetro em contagem regressiva. */
  timeLimitSeconds?: number;
  settings: Pick<GameBehaviorSettings, 'showTimer' | 'showMoves'>;
}

interface StatBoxProps {
  label: string;
  value: string;
  valueColor?: string;
}

const StatBox = memo(({ label, value, valueColor }: StatBoxProps) => {
  const colors = useColors();
  const typography = useTypography();
  const { settings } = useAppSettings();

  const radius = Math.max(12, settings.ui.globalRadius ?? 16);
  const useGlass = settings.ui.useGlassmorphism;

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: useGlass ? colors.glass : colors.surface,
          borderColor: colors.primaryBorder,
          borderRadius: radius,
        },
      ]}
    >
      <Text
        style={[
          styles.boxLabel,
          typography.semiBold,
          {
            color: colors.textMuted,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.boxValue,
          typography.black,
          {
            color: valueColor ?? colors.primary,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
});

StatBox.displayName = 'StatBox';

export const GameHeader = memo(
  ({ moves, elapsedSeconds, timeLimitSeconds, settings }: Props) => {
  const colors = useColors();

  // Com limite configurado, o cronômetro vira contagem regressiva (Restante);
  // sem limite, mantém o tempo decorrido (Tempo). Reaproveita elapsedSeconds.
  const hasLimit = (timeLimitSeconds ?? 0) > 0;
  const remaining = Math.max(0, (timeLimitSeconds ?? 0) - elapsedSeconds);

  const timerLabel = hasLimit ? 'Restante' : 'Tempo';
  const timerValue = formatSeconds(hasLimit ? remaining : elapsedSeconds);
  const timerColor = hasLimit && remaining <= 10 ? colors.danger : undefined;

  const items = [
    settings.showTimer && (
      <StatBox
        key="timer"
        label={timerLabel}
        value={timerValue}
        valueColor={timerColor}
      />
    ),

    settings.showMoves && (
      <StatBox key="moves" label="Jogadas" value={String(moves)} />
    ),
  ].filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return <View style={styles.container}>{items}</View>;
});

GameHeader.displayName = 'GameHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  box: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  boxLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  boxValue: {
    fontSize: 24,
  },
});