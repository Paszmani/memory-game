import { Modal, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { colors } from '@/constants/colors';
import { formatSeconds } from '@/utils/format';

type GameFinishedModalProps = {
  visible: boolean;
  moves: number;
  elapsedSeconds: number;
  score: number;
  onRestart: () => void;
  onGoHome: () => void;
};

export function GameFinishedModal({
  visible,
  moves,
  elapsedSeconds,
  score,
  onRestart,
  onGoHome,
}: GameFinishedModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Parabéns!</Text>
          <Text style={styles.subtitle}>Você finalizou o jogo.</Text>

          <View style={styles.stats}>
            <Text style={styles.stat}>Tempo: {formatSeconds(elapsedSeconds)}</Text>
            <Text style={styles.stat}>Jogadas: {moves}</Text>
            <Text style={styles.stat}>Pontuação: {score}</Text>
          </View>

          <AppButton title="Jogar novamente" onPress={onRestart} />
          <AppButton title="Voltar ao início" onPress={onGoHome} variant="secondary" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  stats: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  stat: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});