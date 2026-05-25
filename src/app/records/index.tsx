import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton }       from '@/components/ui/AppButton';
import { SectionCard }     from '@/components/ui/SectionCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors }          from '@/constants/colors';
import { useRecords }      from '@/hooks/useRecords';
import { formatDateTime, formatSeconds } from '@/utils/format';

export default function RecordsScreen() {
  const { records, isLoading, clearRecords } = useRecords();

  function handleClear() {
    Alert.alert('Limpar histórico', 'Deseja apagar todas as partidas?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: clearRecords },
    ]);
  }

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={styles.title}>Histórico de Partidas</Text>
        <Text style={styles.subtitle}>{records.length} partida(s) registrada(s)</Text>
      </SectionCard>

      {isLoading ? (
        <Text style={styles.empty}>Carregando...</Text>
      ) : records.length === 0 ? (
        <Text style={styles.empty}>Nenhuma partida ainda. Vamos jogar!</Text>
      ) : (
        records.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardTheme}>{r.themeName}</Text>
              <Text style={styles.cardMeta}>
                {formatSeconds(r.timeInSeconds)} · {r.moves} jogadas
              </Text>
              <Text style={styles.cardDate}>{formatDateTime(r.finishedAt)}</Text>
            </View>
            <Text style={styles.cardIcon}>🎯</Text>
          </View>
        ))
      )}

      {records.length > 0 && (
        <AppButton title="🗑️ Limpar histórico" onPress={handleClear} variant="danger" />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title:    { color: colors.primary, fontSize: 26, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  empty:    { color: colors.textMuted, fontSize: 16, textAlign: 'center', paddingVertical: 32 },
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderRadius:    18,
    padding:         16,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  cardLeft:  { flex: 1, gap: 3 },
  cardTheme: { color: colors.text,          fontSize: 16, fontWeight: '700' },
  cardMeta:  { color: colors.textSecondary, fontSize: 13 },
  cardDate:  { color: colors.textMuted,     fontSize: 12 },
  cardIcon:  { fontSize: 28 },
});