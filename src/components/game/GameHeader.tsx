import React, { memo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/useColors';
import type { GameBehaviorSettings } from '@/types/settings';
import { formatSeconds } from '@/utils/format';

interface Props {
  moves: number;
  elapsedSeconds: number;
  settings: Pick<GameBehaviorSettings, 'showTimer' | 'showMoves'>;
}

interface StatBoxProps {
  label: string;
  value: string;
}

const StatBox = memo(({ label, value }: StatBoxProps) => {
  const colors = useColors();

  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primaryBorder,
        },
      ]}
    >
      <Text style={[styles.boxLabel, { color: colors.textMuted }]}>
        {label}
      </Text>

      <Text style={[styles.boxValue, { color: colors.primary }]}>
        {value}
      </Text>
    </View>
  );
});

StatBox.displayName = 'StatBox';

export const GameHeader = memo(({ moves, elapsedSeconds, settings }: Props) => {
  const items = [
    settings.showTimer && (
      <StatBox key="timer" label="Tempo" value={formatSeconds(elapsedSeconds)} />
    ),
    settings.showMoves && (
      <StatBox key="moves" label="Jogadas" value={String(moves)} />
    ),
  ].filter(Boolean);

  if (items.length === 0) return null;

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
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  boxValue: {
    fontSize: 24,
    fontWeight: '900',
  },
});