import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.title}>Jogo da Memória</Text>
        <Text style={styles.subtitle}>
          Encontre os pares, bata recordes e crie seus próprios temas com emojis
          ou imagens.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Iniciar partida</Text>

        <AppButton
          title="Jogar fácil"
          onPress={() => router.push('/game?difficulty=easy')}
        />
        <AppButton
          title="Jogar médio"
          onPress={() => router.push('/game?difficulty=medium')}
          variant="secondary"
        />
        <AppButton
          title="Jogar difícil"
          onPress={() => router.push('/game?difficulty=hard')}
          variant="secondary"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Outras opções</Text>

        <AppButton
          title="Customizar temas"
          onPress={() => router.push('/customize')}
          variant="secondary"
        />
        <AppButton
          title="Ver recordes"
          onPress={() => router.push('/records')}
          variant="secondary"
        />
        <AppButton
          title="Configurações"
          onPress={() => router.push('/settings')}
          variant="secondary"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
});