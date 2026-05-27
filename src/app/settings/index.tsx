import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton }       from '@/components/ui/AppButton';
import { SaveBar }         from '@/components/ui/SaveBar';
import { SectionCard }     from '@/components/ui/SectionCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SliderInput }     from '@/components/ui/SliderInput';
import { ToggleSwitch }    from '@/components/ui/ToggleSwitch';
import { useToast }        from '@/components/ui/Toast';
import { useConfirm }      from '@/components/ui/ConfirmDialog';
import { colors }          from '@/constants/colors';
import { useAppSettings }  from '@/hooks/useAppSettings';
import { useSaveState }    from '@/hooks/useSaveState';
import { useThemes }       from '@/contexts/ThemesContext';
import { pickAttractImage } from '@/services/imageService';
import { clearGameResults }  from '@/services/scoreService';
import { clearCustomThemes } from '@/services/themeService';
import { Image }           from 'expo-image';

export default function SettingsScreen() {
  const { settings, saveSettings, resetSettings } = useAppSettings();
  const { reload: reloadThemes }                  = useThemes();
  const { show: toast }                           = useToast();
  const { confirm }                               = useConfirm();

  const {
    localValue: totem, status: totemStatus,
    update: updateTotem, save: saveTotem, reset: resetTotem,
  } = useSaveState(settings.totem, async (v) => {
    await saveSettings({ ...settings, totem: v });
    toast('Configurações salvas!', 'success');
  });

  async function handlePickAttractImage() {
    const uri = await pickAttractImage();
    if (uri) updateTotem({ attractImageUri: uri });
  }

  function handleClearThemes() {
    confirm({
      title: 'Apagar temas', message: 'Todos os temas personalizados serão removidos.',
      confirmText: 'Apagar', destructive: true,
      onConfirm: () => {
        clearCustomThemes()
          .then(() => reloadThemes())
          .then(() => toast('Temas apagados.', 'info'))
          .catch(() => toast('Erro ao apagar.', 'error'));
      },
    });
  }

  function handleClearHistory() {
    confirm({
      title: 'Apagar histórico', message: 'Todas as partidas serão removidas.',
      confirmText: 'Apagar', destructive: true,
      onConfirm: () => {
        clearGameResults()
          .then(() => toast('Histórico apagado.', 'info'))
          .catch(() => toast('Erro ao apagar.', 'error'));
      },
    });
  }

  function handleReset() {
    confirm({
      title: 'Redefinir configurações',
      message: 'Todas as personalizações voltarão ao padrão.',
      confirmText: 'Redefinir', destructive: true,
      onConfirm: () => {
        resetSettings()
          .then(() => toast('Configurações redefinidas.', 'info'))
          .catch(() => toast('Erro ao redefinir.', 'error'));
      },
    });
  }

  return (
    <ScreenContainer>
      {/* ── Totem ──────────────────────────────────────────────── */}
      <SectionCard title="📺 Modo Totem">
        <ToggleSwitch
          label="Tela de atração" hint="Exibe animação quando o totem está inativo"
          value={totem.attractScreenEnabled} onToggle={(v) => updateTotem({ attractScreenEnabled: v })} />
        <ToggleSwitch
          label="Modo quiosque" hint="Bloqueia gestos de navegação"
          value={totem.kioskMode} onToggle={(v) => updateTotem({ kioskMode: v })} />
        <SliderInput
          label="Tempo de inatividade" value={totem.attractTimeoutSeconds}
          min={10} max={120} step={5} unit="s"
          onChange={(v) => updateTotem({ attractTimeoutSeconds: v })} />
        <SliderInput
          label="Auto-resetar após fim" value={totem.autoResetAfterFinishSeconds}
          min={0} max={60} step={5}
          onChange={(v) => updateTotem({ autoResetAfterFinishSeconds: v })}
          formatValue={(v) => v === 0 ? 'Desligado' : `${v}s`} />

        {/* Imagem da tela de atração */}
        <Text style={styles.fieldLabel}>Imagem da tela de atração</Text>
        {totem.attractImageUri && (
          <Image source={{ uri: totem.attractImageUri }}
            style={styles.attractPreview} contentFit="cover" />
        )}
        <AppButton
          title={totem.attractImageUri ? '↺ Trocar imagem' : '📷 Adicionar imagem'}
          onPress={handlePickAttractImage} variant="secondary" fullWidth />
        {totem.attractImageUri && (
          <AppButton title="✕ Remover imagem"
            onPress={() => updateTotem({ attractImageUri: undefined })}
            variant="ghost" size="sm" fullWidth />
        )}

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Mensagem de atração</Text>
          <TextInput value={totem.attractMessage}
            onChangeText={(t) => updateTotem({ attractMessage: t })}
            style={styles.input} placeholderTextColor={colors.textMuted} />
        </View>

        <SaveBar status={totemStatus} onSave={saveTotem} onReset={resetTotem} />
      </SectionCard>

      {/* ── Dados ──────────────────────────────────────────────── */}
      <SectionCard title="Dados Locais">
        <Text style={styles.info}>Temas e histórico armazenados apenas neste dispositivo.</Text>
        <AppButton title="Apagar temas"     onPress={handleClearThemes}  variant="danger" fullWidth />
        <AppButton title="Apagar histórico" onPress={handleClearHistory} variant="danger" fullWidth />
      </SectionCard>

      {/* ── Avançado ───────────────────────────────────────────── */}
      <SectionCard title="Avançado">
        <Text style={styles.info}>Restaura todas as personalizações para os valores originais.</Text>
        <AppButton title="Redefinir configurações" onPress={handleReset} variant="ghost" fullWidth />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field:        { gap: 8 },
  fieldLabel:   { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  attractPreview: { width: '100%', height: 120, borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  input: {
    minHeight: 52, backgroundColor: colors.background,
    borderRadius: 14, paddingHorizontal: 16,
    color: colors.text, borderWidth: 1, borderColor: colors.border, fontSize: 16,
  },
  info: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
});