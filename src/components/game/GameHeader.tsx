import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { GameBehaviorSettings } from '@/types/settings';
import { formatSeconds, formatScore } from '@/utils/format';

interface Props {
  moves:          number;
  elapsedSeconds: number;
  score:          number;
  settings:       Pick<GameBehaviorSettings, 'showTimer' | 'showMoves' | 'showScore'>;
}

interface StatBoxProps {
  label: string;
  value: string;
  accent?: string;
}

const StatBox = memo(({ label, value, accent }: StatBoxProps) => (
  <View style={styles.box}>
    <Text style={styles.boxLabel}>{label}</Text>
    <Text style={[styles.boxValue, accent ? { color: accent } : null]}>
      {value}
    </Text>
  </View>
));

StatBox.displayName = 'StatBox';

export const GameHeader = memo(({ moves, elapsedSeconds, score, settings }: Props) => {
  const visibleStats = [
    settings.showTimer && (
      <StatBox key="time"  label="Tempo"    value={formatSeconds(elapsedSeconds)} />
    ),
    settings.showMoves && (
      <StatBox key="moves" label="Jogadas"  value={String(moves)} />
    ),
    settings.showScore && (
      <StatBox key="score" label="Pontos"   value={formatScore(score)} accent={colors.primary} />
    ),
  ].filter(Boolean);

  if (visibleStats.length === 0) return null;

  return (
    <View style={styles.container}>
      {visibleStats}
    </View>
  );
});

GameHeader.displayName = 'GameHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap:           10,
  },
  box: {
    flex:            1,
    backgroundColor: colors.surface,
    borderRadius:    16,
    paddingVertical:   12,
    paddingHorizontal: 14,
    borderWidth:     1,
    borderColor:     colors.border,
    alignItems:      'center',
    gap:             2,
  },
  boxLabel: {
    color:      colors.textMuted,
    fontSize:   11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  boxValue: {
    color:      colors.text,
    fontSize:   22,
    fontWeight: '800',
  },
});