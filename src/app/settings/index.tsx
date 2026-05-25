import React, { useRef } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton }       from '@/components/ui/AppButton';
import { SaveBar }         from '@/components/ui/SaveBar';
import { SectionCard }     from '@/components/ui/SectionCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SliderInput }     from '@/components/ui/SliderInput';
import { ToggleSwitch }    from '@/components/ui/ToggleSwitch';
import { useToast }        from '@/components/ui/Toast';
import { colors }          from '@/constants/colors';
import { useAppSettings }  from '@/hooks/useAppSettings';
import { useSaveState }    from '@/hooks/useSaveState';
import { clearGameResults }  from '@/services/scoreService';
import { clearCustomThemes } from '@/services/themeService';

export default function SettingsScreen() {
  const { settings, saveSettings, resetSettings } = useAppSettings();
  const { show: toast } = useToast();
  const msgRef = useRef<TextInput>(null);

  const {
    localValue: totem, status: totemStatus,
    update: updateTotem, save: saveTotem, reset: resetTotem,
  } = useSaveState(settings.totem, async (v) => {
    await saveSettings({ ...settings, totem: v });
    toast('Configurações salvas!', 'success');
  });

  // ── Apagar temas ────────────────────────────────────────────────────────
  function handleClearThemes() {
    Alert.alert(
      'Apagar temas',
      'Todos os temas personalizados serão removidos. O tema padrão será mantido.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            clearCustomThemes()
              .then(() => toast('Temas apagados.', 'info'))
              .catch(() => toast('Erro ao apagar temas.', 'error'));
          },
        },
      ],
    );
  }

  // ── Apagar histórico ────────────────────────────────────────────────────
  function handleClearHistory() {
    Alert.alert('Apagar histórico', 'Todas as partidas serão removidas.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => {
          clearGameResults()
            .then(() => toast('Histórico apagado.', 'info'))
            .catch(() => toast('Erro ao apagar histórico.', 'error'));
        },
      },
    ]);
  }

  // ── Redefinir configurações ─────────────────────────────────────────────
  function handleReset() {
    Alert.alert(
      'Redefinir configurações',
      'Todas as personalizações voltarão ao padrão.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Redefinir',
          style: 'destructive',
          onPress: () => {
            resetSettings()
              .then(() => toast('Configurações redefinidas.', 'info'))
              .catch(() => toast('Erro ao redefinir.', 'error'));
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer>
      {/* ── Totem ────────────────────────────────────────────────── */}
      <SectionCard title="📺 Modo Totem">
        <ToggleSwitch
          label="Tela de atração"
          hint="Exibe animação quando o totem está inativo"
          value={totem.attractScreenEnabled}
          onToggle={(v) => updateTotem({ attractScreenEnabled: v })}
        />
        <ToggleSwitch
          label="Modo quiosque"
          hint="Bloqueia gestos de navegação do sistema"
          value={totem.kioskMode}
          onToggle={(v) => updateTotem({ kioskMode: v })}
        />
        <SliderInput
          label="Tempo de inatividade"
          value={totem.attractTimeoutSeconds}
          min={10} max={120} step={5} unit="s"
          onChange={(v) => updateTotem({ attractTimeoutSeconds: v })}
        />
        <SliderInput
          label="Auto-resetar após fim de jogo"
          value={totem.autoResetAfterFinishSeconds}
          min={0} max={60} step={5}
          onChange={(v) => updateTotem({ autoResetAfterFinishSeconds: v })}
          formatValue={(v) => v === 0 ? 'Desligado' : `${v}s`}
        />
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Mensagem de atração</Text>
          <TextInput
            ref={msgRef}
            value={totem.attractMessage}
            onChangeText={(t) => updateTotem({ attractMessage: t })}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
          />
        </View>
        <SaveBar status={totemStatus} onSave={saveTotem} onReset={resetTotem} />
      </SectionCard>

      {/* ── Dados ────────────────────────────────────────────────── */}
      <SectionCard title="💾 Dados Locais">
        <Text style={styles.info}>
          Temas e histórico ficam armazenados apenas neste dispositivo.
        </Text>
        <AppButton
          title="🗑️ Apagar temas"
          onPress={handleClearThemes}
          variant="danger"
          fullWidth
        />
        <AppButton
          title="🗑️ Apagar histórico"
          onPress={handleClearHistory}
          variant="danger"
          fullWidth
        />
      </SectionCard>

      {/* ── Avançado ─────────────────────────────────────────────── */}
      <SectionCard title="⚙️ Avançado">
        <Text style={styles.info}>
          Restaura todas as cores, estilos e textos para os valores originais.
        </Text>
        <AppButton
          title="↩️ Redefinir configurações"
          onPress={handleReset}
          variant="ghost"
          fullWidth
        />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field:      { gap: 8 },
  fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    minHeight: 52, backgroundColor: colors.background,
    borderRadius: 14, paddingHorizontal: 16,
    color: colors.text, borderWidth: 1, borderColor: colors.border, fontSize: 16,
  },
  info: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
});