import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { clearGameResults } from '@/services/scoreService';
import { clearCustomThemes } from '@/services/themeService';

export default function SettingsScreen() {
  function handleClearRecords() {
    Alert.alert(
      'Apagar recordes',
      'Essa ação remove todos os recordes salvos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            void clearGameResults();
            Alert.alert('Pronto', 'Recordes apagados.');
          },
        },
      ],
    );
  }

  function handleClearThemes() {
    Alert.alert(
      'Apagar temas customizados',
      'O tema padrão será mantido, mas todos os temas criados por você serão removidos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            void clearCustomThemes();
            Alert.alert('Pronto', 'Temas customizados apagados.');
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>
          Gerencie dados locais do app.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dados salvos</Text>
        <Text style={styles.description}>
          Os temas e recordes são salvos apenas neste dispositivo.
        </Text>

        <AppButton
          title="Apagar recordes"
          onPress={handleClearRecords}
          variant="danger"
        />

        <AppButton
          title="Apagar temas customizados"
          onPress={handleClearThemes}
          variant="danger"
        />
      </View>
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
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});