import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { formatSeconds } from '@/utils/format';

type GameHeaderProps = {
  moves: number;
  elapsedSeconds: number;
};

export function GameHeader({ moves, elapsedSeconds }: GameHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.label}>Tempo</Text>
        <Text style={styles.value}>{formatSeconds(elapsedSeconds)}</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.label}>Jogadas</Text>
        <Text style={styles.value}>{moves}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
});