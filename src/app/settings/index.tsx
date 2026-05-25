import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton }      from '@/components/ui/AppButton';
import { SaveBar }        from '@/components/ui/SaveBar';
import { SectionCard }    from '@/components/ui/SectionCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SliderInput }    from '@/components/ui/SliderInput';
import { ToggleSwitch }   from '@/components/ui/ToggleSwitch';
import { useToast }       from '@/components/ui/Toast';
import { colors }         from '@/constants/colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useSaveState }   from '@/hooks/useSaveState';
import { clearGameResults } from '@/services/scoreService';
import { clearCustomThemes } from '@/services/themeService';

export default function SettingsScreen() {
  const { settings, saveSettings, resetSettings } = useAppSettings();
  const { show: showToast } = useToast();

  // Seção totem tem estado próprio
  const { localValue: totem, status: totemStatus, update: updateTotem, save: saveTotem, reset: resetTotem } =
    useSaveState(settings.totem, async (v) => {
      await saveSettings({ ...settings, totem: v });
      showToast('Configurações salvas!', 'success');
    });

  async function handleResetAll() {
    Alert.alert('Redefinir tudo', 'Isso apaga todas as configurações.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Redefinir', style: 'destructive',
        onPress: async () => {
          await resetSettings();
          showToast('Configurações redefinidas.', 'info');
        },
      },
    ]);
  }

  async function handleClearData() {
    Alert.alert('Apagar dados', 'Recordes e temas personalizados serão apagados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar', style: 'destructive',
        onPress: async () => {
          await Promise.all([clearGameResults(), clearCustomThemes()]);
          showToast('Dados apagados.', 'info');
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      {/* Totem */}
      <SectionCard title="📺 Modo Totem">
        <ToggleSwitch
          label="Tela de atração"
          hint="Exibe animação de idle"
          value={totem.attractScreenEnabled}
          onToggle={(v) => updateTotem({ attractScreenEnabled: v })}
        />
        <ToggleSwitch
          label="Modo quiosque"
          hint="Bloqueia navegação do sistema"
          value={totem.kioskMode}
          onToggle={(v) => updateTotem({ kioskMode: v })}
        />

        <SliderInput
          label="Tempo de inatividade (attract)"
          value={totem.attractTimeoutSeconds}
          min={10}
          max={120}
          step={5}
          unit="s"
          onChange={(v) => updateTotem({ attractTimeoutSeconds: v })}
        />

        <SliderInput
          label="Auto-resetar após fim de jogo"
          value={totem.autoResetAfterFinishSeconds}
          min={0}
          max={60}
          step={5}
          unit="s"
          onChange={(v) => updateTotem({ autoResetAfterFinishSeconds: v })}
          formatValue={(v) => v === 0 ? 'Desligado' : `${v}s`}
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Mensagem de atração</Text>
          <TextInput
            value={totem.attractMessage}
            onChangeText={(t) => updateTotem({ attractMessage: t })}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <SaveBar status={totemStatus} onSave={saveTotem} onReset={resetTotem} />
      </SectionCard>

      {/* Dados */}
      <SectionCard title="💾 Dados Locais">
        <Text style={styles.infoText}>Temas e recordes ficam salvos apenas neste dispositivo.</Text>
        <AppButton title="🗑️ Apagar recordes e temas" onPress={handleClearData} variant="danger" fullWidth />
      </SectionCard>

      {/* Reset total */}
      <SectionCard title="⚙️ Avançado">
        <Text style={styles.infoText}>Restaura todas as configurações para os valores padrão.</Text>
        <AppButton title="↩️ Redefinir configurações" onPress={handleResetAll} variant="ghost" fullWidth />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field:      { gap: 8 },
  fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    minHeight:         52,
    backgroundColor:   colors.background,
    borderRadius:      14,
    paddingHorizontal: 16,
    color:             colors.text,
    borderWidth:       1,
    borderColor:       colors.border,
    fontSize:          16,
  },
  infoText: { color: colors.textMuted, fontSize: 14 },
});