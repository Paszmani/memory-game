import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors }          from '@/constants/colors';
import { GameBehaviorSettings } from '@/types/settings';
import { formatSeconds }   from '@/utils/format';

interface Props {
  moves:          number;
  elapsedSeconds: number;
  settings:       Pick<GameBehaviorSettings, 'showTimer' | 'showMoves'>;
}

interface StatBoxProps { label: string; value: string }

const StatBox = memo(({ label, value }: StatBoxProps) => (
  <View style={styles.box}>
    <Text style={styles.boxLabel}>{label}</Text>
    <Text style={styles.boxValue}>{value}</Text>
  </View>
));
StatBox.displayName = 'StatBox';

export const GameHeader = memo(({ moves, elapsedSeconds, settings }: Props) => {
  const items = [
    settings.showTimer && <StatBox key="t" label="TEMPO"   value={formatSeconds(elapsedSeconds)} />,
    settings.showMoves && <StatBox key="m" label="JOGADAS" value={String(moves)} />,
  ].filter(Boolean);

  if (items.length === 0) return null;

  return <View style={styles.container}>{items}</View>;
});

GameHeader.displayName = 'GameHeader';

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10 },
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
  boxLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  boxValue: { color: colors.primary,   fontSize: 24, fontWeight: '900' },
});