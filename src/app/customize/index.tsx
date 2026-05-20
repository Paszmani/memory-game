import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ThemeForm } from '@/components/customize/ThemeForm';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { DIFFICULTIES } from '@/constants/difficulty';
import { useThemeManager } from '@/hooks/useThemeManager';
import { CreateThemeInput, CustomTheme } from '@/types/theme';

export default function CustomizeScreen() {
  const { themes, isLoading, addTheme, removeTheme } = useThemeManager();

  async function handleCreateTheme(input: CreateThemeInput) {
    await addTheme(input);
  }

  function handleDeleteTheme(theme: CustomTheme) {
    if (theme.isDefault) {
      Alert.alert('Tema padrão', 'O tema padrão não pode ser removido.');
      return;
    }

    Alert.alert(
      'Remover tema',
      `Deseja remover o tema "${theme.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            void removeTheme(theme.id);
          },
        },
      ],
    );
  }

  function startThemeGame(theme: CustomTheme) {
    const pairCount = Math.min(
      DIFFICULTIES.custom.pairCount,
      theme.cards.length,
    );

    
    if (pairCount < 2) {
      Alert.alert(
        'Tema incompleto',
        'Este tema precisa ter pelo menos 2 cartas.',
      );
      return;
    }

    router.push(`/game?difficulty=custom&themeId=${theme.id}`);
  }

  return (
    <ScreenContainer>
      <ThemeForm onSubmit={handleCreateTheme} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temas disponíveis</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          themes.map((theme) => (
            <View key={theme.id} style={styles.themeCard}>
              <View style={styles.themeInfo}>
                <Text style={styles.themeName}>{theme.name}</Text>
                <Text style={styles.themeMeta}>
                  {theme.cards.length} cartas cadastradas
                </Text>
              </View>

              <AppButton
                title="Jogar"
                onPress={() => startThemeGame(theme)}
              />

              {!theme.isDefault && (
                <AppButton
                  title="Remover"
                  onPress={() => handleDeleteTheme(theme)}
                  variant="danger"
                />
              )}
            </View>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  themeCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeInfo: {
    gap: 4,
  },
  themeName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  themeMeta: {
    color: colors.textMuted,
    fontSize: 14,
  },
});