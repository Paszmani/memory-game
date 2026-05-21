import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton }       from '@/components/ui/AppButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionCard }     from '@/components/ui/SectionCard';
import { colors }          from '@/constants/colors';
import { DIFFICULTIES }    from '@/constants/difficulty';
import { useRecords }      from '@/hooks/useRecords';
import { formatDateTime, formatScore, formatSeconds } from '@/utils/format';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RecordsScreen() {
  const { records, isLoading, clearRecords } = useRecords();

  function handleClear() {
    Alert.alert(
      'Limpar recordes',
      'Deseja apagar todos os recordes salvos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: clearRecords },
      ],
    );
  }

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={styles.title}>🏆 Recordes</Text>
        <Text style={styles.subtitle}>
          Os melhores resultados salvos neste dispositivo.
        </Text>
      </SectionCard>

      {isLoading ? (
        <Text style={styles.emptyText}>Carregando...</Text>
      ) : records.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum recorde ainda. Jogue para aparecer aqui!</Text>
      ) : (
        records.map((record, index) => (
          <View key={record.id} style={styles.card}>
            <Text style={styles.medal}>{MEDALS[index] ?? `#${index + 1}`}</Text>

            <View style={styles.info}>
              <Text style={styles.themeName}>{record.themeName}</Text>
              <Text style={styles.meta}>
                {DIFFICULTIES[record.difficulty].label} · {formatSeconds(record.timeInSeconds)} · {record.moves} jogadas
              </Text>
              <Text style={styles.date}>{formatDateTime(record.finishedAt)}</Text>
            </View>

            <Text style={styles.score}>{formatScore(record.score)}</Text>
          </View>
        ))
      )}

      {records.length > 0 && (
        <AppButton title="🗑️ Limpar recordes" onPress={handleClear} variant="danger" />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title:    { color: colors.text,    fontSize: 28, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 15 },
  emptyText:{ color: colors.textMuted, fontSize: 16, textAlign: 'center', paddingVertical: 20 },
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    backgroundColor: colors.surface,
    borderRadius:    18,
    padding:         16,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  medal:    { fontSize: 28 },
  info:     { flex: 1, gap: 3 },
  themeName:{ color: colors.text,         fontSize: 16, fontWeight: '700' },
  meta:     { color: colors.textSecondary, fontSize: 13 },
  date:     { color: colors.textMuted,    fontSize: 12 },
  score:    { color: colors.primary,      fontSize: 22, fontWeight: '900' },
});