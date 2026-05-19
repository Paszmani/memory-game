import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { DIFFICULTIES } from '@/constants/difficulty';
import { useRecords } from '@/hooks/useRecords';
import { formatDateTime, formatSeconds } from '@/utils/format';

export default function RecordsScreen() {
  const { records, isLoading, clearRecords } = useRecords();

  function handleClearRecords() {
    Alert.alert(
      'Limpar recordes',
      'Tem certeza que deseja apagar todos os recordes?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            void clearRecords();
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Recordes</Text>
        <Text style={styles.subtitle}>
          Os melhores resultados ficam salvos neste dispositivo.
        </Text>
      </View>

      {isLoading ? (
        <Text style={styles.emptyText}>Carregando recordes...</Text>
      ) : records.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum recorde salvo ainda.</Text>
      ) : (
        records.map((record, index) => (
          <View key={record.id} style={styles.recordCard}>
            <Text style={styles.position}>#{index + 1}</Text>

            <View style={styles.recordInfo}>
              <Text style={styles.themeName}>{record.themeName}</Text>
              <Text style={styles.meta}>
                Dificuldade: {DIFFICULTIES[record.difficulty].label}
              </Text>
              <Text style={styles.meta}>
                Tempo: {formatSeconds(record.timeInSeconds)}
              </Text>
              <Text style={styles.meta}>Jogadas: {record.moves}</Text>
              <Text style={styles.meta}>
                Data: {formatDateTime(record.finishedAt)}
              </Text>
            </View>

            <Text style={styles.score}>{record.score}</Text>
          </View>
        ))
      )}

      {records.length > 0 && (
        <AppButton
          title="Limpar recordes"
          onPress={handleClearRecords}
          variant="danger"
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  position: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  recordInfo: {
    gap: 3,
  },
  themeName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 14,
  },
  score: {
    color: colors.success,
    fontSize: 24,
    fontWeight: '900',
  },
});