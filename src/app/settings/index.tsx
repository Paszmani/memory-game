import React from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton }       from '@/components/ui/AppButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SectionCard }     from '@/components/ui/SectionCard';
import { colors }          from '@/constants/colors';
import { useAppSettings }  from '@/hooks/useAppSettings';
import { clearGameResults } from '@/services/scoreService';
import { clearCustomThemes } from '@/services/themeService';

export default function SettingsScreen() {
  const { settings, updateSettings, resetSettings } = useAppSettings();
  const { gameBehavior, totem } = settings;

  function handleResetAll() {
    Alert.alert(
      'Redefinir tudo',
      'Isso apagará todas as configurações e voltará ao padrão.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Redefinir', style: 'destructive', onPress: () => void resetSettings() },
      ],
    );
  }

  function handleClearData() {
    Alert.alert(
      'Apagar dados do jogo',
      'Isso apagará recordes e temas personalizados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await Promise.all([clearGameResults(), clearCustomThemes()]);
            Alert.alert('Pronto', 'Dados apagados com sucesso.');
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer>
      {/* Comportamento do jogo */}
      <SectionCard title="Comportamento do Jogo">
        <SettingToggle
          label="Som habilitado"
          value={gameBehavior.soundEnabled}
          onToggle={(v) => updateSettings({ gameBehavior: { soundEnabled: v } })}
        />
        <SettingToggle
          label="Animações"
          value={gameBehavior.animationsEnabled}
          onToggle={(v) => updateSettings({ gameBehavior: { animationsEnabled: v } })}
        />
        <SettingToggle
          label="Mostrar cronômetro"
          value={gameBehavior.showTimer}
          onToggle={(v) => updateSettings({ gameBehavior: { showTimer: v } })}
        />
        <SettingToggle
          label="Mostrar jogadas"
          value={gameBehavior.showMoves}
          onToggle={(v) => updateSettings({ gameBehavior: { showMoves: v } })}
        />
        <SettingToggle
          label="Mostrar pontuação"
          value={gameBehavior.showScore}
          onToggle={(v) => updateSettings({ gameBehavior: { showScore: v } })}
        />
      </SectionCard>

      {/* Configurações de totem */}
      <SectionCard title="Modo Totem">
        <SettingToggle
          label="Tela de atração"
          value={totem.attractScreenEnabled}
          onToggle={(v) => updateSettings({ totem: { attractScreenEnabled: v } })}
        />
        <SettingToggle
          label="Modo quiosque"
          value={totem.kioskMode}
          onToggle={(v) => updateSettings({ totem: { kioskMode: v } })}
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Mensagem de atração</Text>
          <TextInput
            value={totem.attractMessage}
            onChangeText={(t) => updateSettings({ totem: { attractMessage: t } })}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </SectionCard>

      {/* Dados locais */}
      <SectionCard title="Dados Locais">
        <Text style={styles.infoText}>
          Temas e recordes são salvos apenas neste dispositivo.
        </Text>
        <AppButton
          title="🗑️ Apagar todos os dados do jogo"
          onPress={handleClearData}
          variant="danger"
          fullWidth
        />
      </SectionCard>

      {/* Reset */}
      <AppButton
        title="↩️ Redefinir configurações"
        onPress={handleResetAll}
        variant="ghost"
        fullWidth
      />
    </ScreenContainer>
  );
}

function SettingToggle({
  label, value, onToggle,
}: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <AppButton
        title={value ? 'Ligado' : 'Desligado'}
        onPress={() => onToggle(!value)}
        variant={value ? 'success' : 'secondary'}
        size="sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 6,
  },
  toggleLabel: { color: colors.text, fontSize: 15, flex: 1 },
  field:       { gap: 8 },
  fieldLabel:  { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    minHeight:        48,
    backgroundColor:  colors.background,
    borderRadius:     12,
    paddingHorizontal: 14,
    color:            colors.text,
    borderWidth:      1,
    borderColor:      colors.border,
    fontSize:         15,
  },
  infoText: { color: colors.textMuted, fontSize: 14 },
});