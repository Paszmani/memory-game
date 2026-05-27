import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';

import { AppButton }        from '@/components/ui/AppButton';
import { SaveBar }          from '@/components/ui/SaveBar';
import { SectionCard }      from '@/components/ui/SectionCard';
import { ScreenContainer }  from '@/components/ui/ScreenContainer';
import { SliderInput }      from '@/components/ui/SliderInput';
import { ToggleSwitch }     from '@/components/ui/ToggleSwitch';
import { useToast }         from '@/components/ui/Toast';
import { useConfirm }       from '@/components/ui/ConfirmDialog';
import { useColors }        from '@/hooks/useColors';
import { useAppSettings }   from '@/hooks/useAppSettings';
import { useSaveState }     from '@/hooks/useSaveState';
import { useThemes }        from '@/contexts/ThemesContext';
import { pickImageFromLibrary } from '@/services/imageService';
import { clearGameResults }  from '@/services/scoreService';
import { clearCustomThemes } from '@/services/themeService';

export default function SettingsScreen() {
  const { settings, saveSettings, resetSettings } = useAppSettings();
  const { reload: reloadThemes }                  = useThemes();
  const { show: toast }                           = useToast();
  const { confirm }                               = useConfirm();
  const colors                                    = useColors();

  const {
    localValue: totem, status: totemStatus,
    update: updateTotem, save: saveTotem, reset: resetTotem,
  } = useSaveState(settings.totem, async (v) => {
    await saveSettings({ ...settings, totem: v });
    toast('Configurações salvas!', 'success');
  });

  // Picker da imagem central da tela de atração
  async function handlePickCenterImage() {
    // Imagem quadrada — será exibida num círculo
    const uri = await pickImageFromLibrary({ aspect: [1, 1], quality: 0.85 });
    if (uri) updateTotem({ attractCenterImageUri: uri });
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
      message: 'Todas as personalizações voltarão ao padrão de fábrica.',
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
      {/* ── Modo Totem ─────────────────────────────────────────────────── */}
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
          label="Auto-resetar após fim"
          value={totem.autoResetAfterFinishSeconds}
          min={0} max={60} step={5}
          onChange={(v) => updateTotem({ autoResetAfterFinishSeconds: v })}
          formatValue={(v) => v === 0 ? 'Desligado' : `${v}s`}
        />

        {/* ── Imagem central da tela de atração ─────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Ícone da tela de atração
          </Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Substitui o emoji 👆 por uma imagem do dispositivo (use imagem quadrada).
          </Text>

          {/* Preview da imagem atual */}
          {totem.attractCenterImageUri ? (
            <View style={styles.previewWrap}>
              <Image
                source={{ uri: totem.attractCenterImageUri }}
                style={[styles.centerPreview, { borderColor: colors.primary }]}
                contentFit="cover"
              />
              <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
                Prévia (será exibida num círculo)
              </Text>
            </View>
          ) : (
            <View style={[styles.defaultIcon, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={styles.defaultEmoji}>👆</Text>
              <Text style={[styles.defaultLabel, { color: colors.textMuted }]}>Padrão</Text>
            </View>
          )}

          <AppButton
            title={totem.attractCenterImageUri ? '↺ Trocar imagem' : '📷 Escolher imagem'}
            onPress={handlePickCenterImage}
            variant="secondary"
            fullWidth
          />
          {totem.attractCenterImageUri && (
            <AppButton
              title="✕ Remover — usar emoji padrão"
              onPress={() => updateTotem({ attractCenterImageUri: undefined })}
              variant="ghost"
              size="sm"
              fullWidth
            />
          )}
        </View>

        {/* Mensagem */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Mensagem de atração
          </Text>
          <TextInput
            value={totem.attractMessage}
            onChangeText={(t) => updateTotem({ attractMessage: t })}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholderTextColor={colors.textMuted}
            placeholder="Ex: Toque para jogar!"
          />
        </View>

        <SaveBar status={totemStatus} onSave={saveTotem} onReset={resetTotem} />
      </SectionCard>

      {/* ── Dados ───────────────────────────────────────────────────────── */}
      <SectionCard title="Dados Locais">
        <Text style={[styles.info, { color: colors.textMuted }]}>
          Temas e histórico armazenados apenas neste dispositivo.
        </Text>
        <AppButton title="Apagar temas"     onPress={handleClearThemes}  variant="danger" fullWidth />
        <AppButton title="Apagar histórico" onPress={handleClearHistory} variant="danger" fullWidth />
      </SectionCard>

      {/* ── Avançado ────────────────────────────────────────────────────── */}
      <SectionCard title="Avançado">
        <Text style={[styles.info, { color: colors.textMuted }]}>
          Restaura todas as cores, estilos e textos para os valores originais.
        </Text>
        <AppButton title="Redefinir configurações" onPress={handleReset} variant="ghost" fullWidth />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section:      { gap: 10 },
  sectionLabel: { fontSize: 14, fontWeight: '700' },
  hint:         { fontSize: 13, lineHeight: 18 },
  previewWrap:  { alignItems: 'center', gap: 8 },
  centerPreview: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, overflow: 'hidden',
  },
  previewLabel: { fontSize: 12 },
  defaultIcon: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, alignItems: 'center',
    justifyContent: 'center', alignSelf: 'center', gap: 4,
  },
  defaultEmoji: { fontSize: 40 },
  defaultLabel: { fontSize: 11, fontWeight: '600' },
  input: {
    minHeight: 52, borderRadius: 14,
    paddingHorizontal: 16, borderWidth: 1, fontSize: 16,
  },
  info: { fontSize: 14, lineHeight: 20 },
});