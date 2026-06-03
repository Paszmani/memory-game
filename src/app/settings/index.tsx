import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { SectionCard } from '@/components/ui/SectionCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useThemes } from '@/contexts/ThemesContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import { clearGameResults } from '@/services/scoreService';
import { clearCustomThemes } from '@/services/themeService';

export default function SettingsScreen() {
  const { resetSettings } = useAppSettings();
  const { reload: reloadThemes } = useThemes();

  const { show: toast } = useToast();
  const { confirm } = useConfirm();

  const colors = useColors();
  const typography = useTypography();

  function handleClearThemes() {
    confirm({
      title: 'Apagar temas',
      message: 'Todos os temas personalizados serão removidos.',
      confirmText: 'Apagar',
      destructive: true,
      onConfirm: () => {
        clearCustomThemes()
          .then(() => reloadThemes())
          .then(() => toast('Temas apagados.', 'info'))
          .catch(() => toast('Erro ao apagar temas.', 'error'));
      },
    });
  }

  function handleClearHistory() {
    confirm({
      title: 'Apagar histórico',
      message: 'Todas as partidas serão removidas.',
      confirmText: 'Apagar',
      destructive: true,
      onConfirm: () => {
        clearGameResults()
          .then(() => toast('Histórico apagado.', 'info'))
          .catch(() => toast('Erro ao apagar histórico.', 'error'));
      },
    });
  }

  function handleResetSettings() {
    confirm({
      title: 'Redefinir configurações',
      message: 'Todas as personalizações voltarão ao padrão de fábrica.',
      confirmText: 'Redefinir',
      destructive: true,
      onConfirm: () => {
        resetSettings()
          .then(() => toast('Configurações redefinidas.', 'info'))
          .catch(() => toast('Erro ao redefinir configurações.', 'error'));
      },
    });
  }

  return (
    <ScreenContainer>
      <SectionCard title="Dados">
        <Text
          style={[
            styles.info,
            typography.regular,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Temas e histórico são armazenados apenas neste dispositivo.
        </Text>

        <View style={styles.actions}>
          <AppButton
            title="Apagar temas personalizados"
            variant="danger"
            onPress={handleClearThemes}
            fullWidth
          />

          <AppButton
            title="Apagar histórico"
            variant="danger"
            onPress={handleClearHistory}
            fullWidth
          />
        </View>
      </SectionCard>

      <SectionCard title="Avançado">
        <Text
          style={[
            styles.info,
            typography.regular,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Restaura todas as cores, estilos, textos e opções visuais para os
          valores originais.
        </Text>

        <AppButton
          title="Redefinir configurações"
          variant="warning"
          onPress={handleResetSettings}
          fullWidth
        />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  info: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
});