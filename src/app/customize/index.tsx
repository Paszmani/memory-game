import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AnimationPicker }    from '@/components/customize/AnimationPicker';
import { BackgroundPicker }   from '@/components/customize/BackgroundPicker';
import { BrandingEditor }     from '@/components/customize/BrandingEditor';
import { CardStylePicker }    from '@/components/customize/CardStylePicker';
import { GameplaySettings }   from '@/components/customize/GameplaySettings';
import { PresetThemesPicker } from '@/components/customize/PresetThemesPicker';
import { ThemeForm }          from '@/components/customize/ThemeForm';
import { UICustomizer }       from '@/components/customize/UICustomizer';
import { AppButton }          from '@/components/ui/AppButton';
import { SectionCard }        from '@/components/ui/SectionCard';
import { ScreenContainer }    from '@/components/ui/ScreenContainer';
import { ToggleSwitch }       from '@/components/ui/ToggleSwitch';
import { SaveBar }            from '@/components/ui/SaveBar';
import { useToast }           from '@/components/ui/Toast';
import { DIFFICULTIES }       from '@/constants/difficulty';
import { useAppSettings }     from '@/hooks/useAppSettings';
import { useSaveState }       from '@/hooks/useSaveState';
import { useThemeManager }    from '@/hooks/useThemeManager';
import { CustomTheme }        from '@/types/theme';
import { router }             from 'expo-router';
import { colors }             from '@/constants/colors';
import { DeepPartial, AppSettings } from '@/types/settings';

type Tab = 'temas' | 'visual' | 'cartas' | 'animacao' | 'jogo' | 'totem';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'temas',    icon: '🃏', label: 'Temas' },
  { key: 'visual',   icon: '🎨', label: 'Visual' },
  { key: 'cartas',   icon: '🂠',  label: 'Cartas' },
  { key: 'animacao', icon: '✨', label: 'Animação' },
  { key: 'jogo',     icon: '🎮', label: 'Jogo' },
  { key: 'totem',    icon: '📺', label: 'Totem' },
];

export default function CustomizeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('temas');
  const { settings, saveSettings, updateSettings } = useAppSettings();
  const { themes, addTheme, removeTheme }          = useThemeManager();
  const { show: showToast }                        = useToast();

  const makeSaver = useCallback(
    <K extends keyof AppSettings>(key: K) =>
      async (value: AppSettings[K]) => {
        await saveSettings({ ...settings, [key]: value });
        showToast('Salvo com sucesso!', 'success');
      },
    [settings, saveSettings, showToast],
  );

  const applyPreset = useCallback(async (patch: DeepPartial<AppSettings>) => {
    const next: AppSettings = {
      branding:     { ...settings.branding,     ...patch.branding },
      background:   { ...settings.background,   ...patch.background },
      cardStyle:    { ...settings.cardStyle,     ...patch.cardStyle },
      animation:    { ...settings.animation,     ...patch.animation },
      ui:           { ...settings.ui,            ...patch.ui },
      gameBehavior: { ...settings.gameBehavior,  ...patch.gameBehavior },
      totem:        { ...settings.totem,         ...patch.totem },
    };
    await saveSettings(next);
    showToast('Tema aplicado!', 'success');
  }, [settings, saveSettings, showToast]);

  const handleDeleteTheme = useCallback((theme: CustomTheme) => {
    if (theme.isDefault) {
      Alert.alert('Tema padrão', 'O tema padrão não pode ser removido.');
      return;
    }
    Alert.alert('Remover tema', `Deseja remover "${theme.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          await removeTheme(theme.id);
          showToast('Tema removido.', 'info');
        },
      },
    ]);
  }, [removeTheme, showToast]);

  return (
    <ScreenContainer>
      {/* Barra de abas */}
      <View style={styles.tabBar}>
        {TABS.map(({ key, icon, label }) => (
          <Pressable
            key={key}
            onPress={() => setActiveTab(key)}
            style={[styles.tab, activeTab === key && styles.tabActive]}
          >
            <Text style={styles.tabIcon}>{icon}</Text>
            <Text style={[styles.tabLabel, activeTab === key && styles.tabLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Aba: Temas de conteúdo */}
      {activeTab === 'temas' && (
        <>
          <ThemeForm onSubmit={addTheme} />
          <SectionCard title={`Temas (${themes.length})`}>
            {themes.map((theme) => (
              <ThemeRow
                key={theme.id}
                theme={theme}
                onPlay={() => router.push(`/game?difficulty=custom&themeId=${theme.id}`)}
                onDelete={() => handleDeleteTheme(theme)}
              />
            ))}
          </SectionCard>
        </>
      )}

      {/* Aba: Visual */}
      {activeTab === 'visual' && (
        <>
          <PresetThemesPicker onApply={applyPreset} />
          <BrandingEditor   value={settings.branding}   onSave={makeSaver('branding')} />
          <BackgroundPicker value={settings.background} onSave={makeSaver('background')} />
          <UICustomizer     value={settings.ui}         onSave={makeSaver('ui')} />
        </>
      )}

      {/* Aba: Cartas */}
      {activeTab === 'cartas' && (
        <CardStylePicker value={settings.cardStyle} onSave={makeSaver('cardStyle')} />
      )}

      {/* Aba: Animação */}
      {activeTab === 'animacao' && (
        <AnimationPicker value={settings.animation} onSave={makeSaver('animation')} />
      )}

      {/* Aba: Jogo */}
      {activeTab === 'jogo' && (
        <GameplaySettings value={settings.gameBehavior} onSave={makeSaver('gameBehavior')} />
      )}

      {/* Aba: Totem */}
      {activeTab === 'totem' && (
        <TotemSettingsTab
          value={settings.totem}
          onSave={makeSaver('totem')}
        />
      )}
    </ScreenContainer>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ThemeRow({ theme, onPlay, onDelete }: { theme: CustomTheme; onPlay: () => void; onDelete: () => void }) {
  return (
    <View style={styles.themeRow}>
      <View style={styles.themeInfo}>
        <Text style={styles.themeName}>{theme.name}</Text>
        {theme.description && <Text style={styles.themeDesc}>{theme.description}</Text>}
        <Text style={styles.themeMeta}>{theme.cards.length} cartas{theme.isDefault ? ' · Padrão' : ''}</Text>
      </View>
      <View style={styles.themeActions}>
        <AppButton title="▶ Jogar" size="sm" onPress={onPlay} />
        {!theme.isDefault && (
          <AppButton title="🗑" size="sm" variant="danger" onPress={onDelete} />
        )}
      </View>
    </View>
  );
}

function TotemSettingsTab({
  value, onSave,
}: { value: AppSettings['totem']; onSave: (v: AppSettings['totem']) => Promise<void> }) {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);
  const { localValue: _ } = { localValue: local };

  return (
    <SectionCard title="📺 Configurações de Totem">
      <ToggleSwitch label="Tela de atração" hint="Exibe animação quando o totem está inativo" value={local.attractScreenEnabled} onToggle={(v) => update({ attractScreenEnabled: v })} />
      <ToggleSwitch label="Modo quiosque"   hint="Esconde botões de navegação do sistema"      value={local.kioskMode}            onToggle={(v) => update({ kioskMode: v })} />
      <ToggleSwitch label="Exibir marca"    hint="Mostra título e logo na tela de atração"     value={local.showBranding}         onToggle={(v) => update({ showBranding: v })} />
      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    18,
    padding:         4,
    borderWidth:     1,
    borderColor:     colors.border,
    flexWrap:        'wrap',
    gap:             2,
  },
  tab: {
    flex:            1,
    minWidth:        50,
    alignItems:      'center',
    paddingVertical: 10,
    borderRadius:    14,
    gap:             2,
  },
  tabActive: { backgroundColor: colors.primaryGlow },
  tabIcon:   { fontSize: 18 },
  tabLabel:  { color: colors.textMuted,  fontSize: 11, fontWeight: '700' },
  tabLabelActive: { color: colors.primary },
  themeRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  themeInfo:    { flex: 1, gap: 2 },
  themeName:    { color: colors.text,          fontSize: 16, fontWeight: '700' },
  themeDesc:    { color: colors.textMuted,     fontSize: 13 },
  themeMeta:    { color: colors.textSecondary, fontSize: 12 },
  themeActions: { flexDirection: 'row', gap: 6 },
});