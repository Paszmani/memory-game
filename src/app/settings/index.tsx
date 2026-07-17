import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { LeadFieldsEditor } from '@/components/customize/LeadFieldsEditor';
import { AppButton } from '@/components/ui/AppButton';
import { SectionCard } from '@/components/ui/SectionCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useThemes } from '@/contexts/ThemesContext';
import { DEFAULT_LEAD_FIELDS } from '@/constants/defaultSettings';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import { clearStoredLeads, exportLeads, getKiosk } from '@/services/leadService';
import { clearGameResults } from '@/services/scoreService';
import { exportSettingsFile, importSettingsFile } from '@/services/settingsTransfer';
import { clearCustomThemes } from '@/services/themeService';

export default function SettingsScreen() {
  const { settings, updateSettings, saveSettings, resetSettings } = useAppSettings();
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

  function handleExportTheme() {
    exportSettingsFile(settings)
      .then((result) => {
        if (result === 'downloaded') toast('Arquivo memoria-tema.json baixado.', 'info');
        else if (result === 'unsupported')
          toast('Compartilhamento indisponível neste dispositivo.', 'error');
        // 'shared': a folha nativa já foi exibida — sem toast por cima.
      })
      .catch(() => toast('Erro ao exportar o tema.', 'error'));
  }

  function handleImportTheme() {
    importSettingsFile()
      .then((result) => {
        if (result.status === 'ok') {
          return saveSettings(result.settings).then(() => toast('Tema importado e aplicado.', 'info'));
        }
        if (result.status === 'invalid') {
          toast('Arquivo inválido: use um JSON exportado pelo próprio jogo.', 'error');
        } else if (result.status === 'unsupported') {
          toast('Importação indisponível neste dispositivo.', 'error');
        }
      })
      .catch(() => toast('Erro ao importar o tema.', 'error'));
  }

  function handleExportLeads() {
    exportLeads()
      .then((result) => {
        if (result === 'kiosk') toast('Pasta de leads aberta no Explorador.', 'info');
        else if (result === 'downloaded') toast('CSV de leads baixado.', 'info');
        else if (result === 'empty') toast('Nenhum lead registrado ainda.', 'info');
        else if (result === 'unsupported')
          toast('Compartilhamento indisponível neste dispositivo.', 'error');
        // 'shared': a folha nativa já foi exibida — sem toast por cima.
      })
      .catch(() => toast('Erro ao exportar leads.', 'error'));
  }

  function handleClearLeads() {
    confirm({
      title: 'Apagar leads',
      message: 'Todos os leads deste dispositivo serão removidos.',
      confirmText: 'Apagar',
      destructive: true,
      onConfirm: () => {
        clearStoredLeads()
          .then(() => toast('Leads apagados.', 'info'))
          .catch(() => toast('Erro ao apagar leads.', 'error'));
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

      <SectionCard title="Captura de leads">
        <ToggleSwitch
          label="Pedir cadastro ao finalizar"
          hint="Ao completar o jogo, um formulário pede nome, e-mail e telefone antes da tela de parabéns."
          value={settings.totem.leadCaptureEnabled === true}
          onToggle={(value) => updateSettings({ totem: { leadCaptureEnabled: value } })}
        />

        <Text
          style={[
            styles.info,
            typography.regular,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {getKiosk()
            ? 'Os leads são gravados em data/leads (JSON + CSV) ao lado do app.'
            : 'Os leads ficam armazenados apenas neste dispositivo.'}
        </Text>

        <Text
          style={[
            styles.info,
            typography.semiBold,
            {
              color: colors.text,
            },
          ]}
        >
          Campos do formulário
        </Text>

        <LeadFieldsEditor
          fields={
            settings.totem.leadFields?.length ? settings.totem.leadFields : DEFAULT_LEAD_FIELDS
          }
          onChange={(leadFields) => updateSettings({ totem: { leadFields } })}
        />

        <View style={styles.actions}>
          <AppButton
            title={getKiosk() ? 'Abrir pasta de leads' : 'Exportar leads (CSV)'}
            variant="secondary"
            onPress={handleExportLeads}
            fullWidth
          />

          {!getKiosk() && (
            <AppButton
              title="Apagar leads"
              variant="danger"
              onPress={handleClearLeads}
              fullWidth
            />
          )}
        </View>
      </SectionCard>

      <SectionCard title="Tema (arquivo)">
        <Text
          style={[
            styles.info,
            typography.regular,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Salva toda a personalização visual (cores, textos, estilo das cartas, totem e campos
          do formulário) em um JSON para reaproveitar em outro evento ou máquina. Os temas de
          cartas (pares/imagens) não entram no arquivo.
        </Text>

        <View style={styles.actions}>
          <AppButton
            title="Exportar tema (JSON)"
            variant="secondary"
            onPress={handleExportTheme}
            fullWidth
          />

          <AppButton
            title="Importar tema"
            variant="secondary"
            onPress={handleImportTheme}
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