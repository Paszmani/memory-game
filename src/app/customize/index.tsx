import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

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
import { useAppSettings }     from '@/hooks/useAppSettings';
import { useSaveState }       from '@/hooks/useSaveState';
import { useThemeManager }    from '@/hooks/useThemeManager';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { colors }             from '@/constants/colors';
import { AppSettings, DeepPartial } from '@/types/settings';
import { CreateThemeInput, CustomTheme } from '@/types/theme';
import { TotemCustomizer } from '@/components/customize/TotemCustomizer';
import { useColors } from '@/hooks/useColors';


import {
  createCustomTheme,
  updateCustomTheme,
} from '@/services/themeService';

type Tab = 'temas' | 'visual' | 'cartas' | 'animacao' | 'jogo' | 'totem';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'temas',    icon: '🃏', label: 'Temas'    },
  { key: 'visual',   icon: '🎨', label: 'Visual'   },
  { key: 'cartas',   icon: '🂠',  label: 'Cartas'   },
  { key: 'animacao', icon: '✨', label: 'Animação'  },
  { key: 'jogo',     icon: '🎮', label: 'Jogo'     },
  { key: 'totem',    icon: '📺', label: 'Totem'    },
];

export default function CustomizeScreen() {
  const [activeTab,    setActiveTab]    = useState<Tab>('temas');
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null);

  const { settings, saveSettings } = useAppSettings();
  const appColors = useColors();
  const { themes, loadThemes }     = useThemeManager();
  const { show: toast }            = useToast();

  const makeSaver = useCallback(
    <K extends keyof AppSettings>(key: K) =>
      async (value: AppSettings[K]) => {
        await saveSettings({ ...settings, [key]: value });
        toast('Salvo!', 'success');
      },
    [settings, saveSettings, toast],
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
    toast('Tema aplicado!', 'success');
  }, [settings, saveSettings, toast]);

  async function handleCreateTheme(input: CreateThemeInput) {
    await createCustomTheme(input);
    await loadThemes();
    toast('Tema criado!', 'success');
  }

  async function handleEditTheme(input: CreateThemeInput) {
    if (!editingTheme) return;
    await updateCustomTheme(editingTheme.id, input);
    await loadThemes();
    setEditingTheme(null);
    toast('Tema atualizado!', 'success');
  }

  const { confirm } = useConfirm();

  function handleDeleteTheme(theme: CustomTheme) {
  if (theme.isDefault) { Alert.alert('Tema padrão', 'Não pode ser removido.'); return; }
  confirm({
    title: 'Remover tema', message: `Deseja remover "${theme.name}"?`,
    confirmText: 'Remover', destructive: true,
    onConfirm: () => {
      import('@/services/themeService').then(({ deleteCustomTheme }) =>
        deleteCustomTheme(theme.id).then(() => {
          loadThemes();
          toast('Tema removido.', 'info');
        })
      );
    },
  });
}

  return (
    <ScreenContainer>
      {/* Barra de abas */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: appColors.surface,
            borderColor: appColors.border,
          },
        ]}
      >
        {TABS.map(({ key, icon, label }) => {
          const isActive = activeTab === key;

          return (
            <Pressable
              key={key}
              onPress={() => setActiveTab(key)}
              style={[
                styles.tab,
                {
                  borderColor: isActive ? appColors.primaryBorder : 'transparent',
                },
                isActive && {
                  backgroundColor: appColors.primaryGlow,
                },
              ]}
            >
              {icon ? (
                <Text
                  style={[
                    styles.tabIcon,
                    {
                      color: isActive ? appColors.primary : appColors.textMuted,
                    },
                  ]}
                >
                  {icon}
                </Text>
              ) : null}

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? appColors.primary : appColors.textMuted,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── Aba: Temas ─────────────────────────────────────── */}
      {activeTab === 'temas' && (
        <>
          {editingTheme ? (
            <ThemeForm
              initialTheme={editingTheme}
              onSubmit={handleEditTheme}
              onCancel={() => setEditingTheme(null)}
            />
          ) : (
            <ThemeForm onSubmit={handleCreateTheme} />
          )}

          <SectionCard title={`Temas disponíveis (${themes.length})`}>
            {themes.map((theme) => (
              <ThemeRow
                key={theme.id}
                theme={theme}
                onPlay={() => router.push(`/game?themeId=${theme.id}`)}
                onEdit={() => setEditingTheme(theme)}
                onDelete={() => handleDeleteTheme(theme)}
              />
            ))}
          </SectionCard>
        </>
      )}

      {/* ── Aba: Visual ────────────────────────────────────── */}
      {activeTab === 'visual' && (
        <>
          <PresetThemesPicker onApply={applyPreset} />
          <BrandingEditor   value={settings.branding}   onSave={makeSaver('branding')} />
          <BackgroundPicker value={settings.background} onSave={makeSaver('background')} />
          <UICustomizer     value={settings.ui}         onSave={makeSaver('ui')} />
        </>
      )}

      {activeTab === 'cartas'   && <CardStylePicker   value={settings.cardStyle}    onSave={makeSaver('cardStyle')} />}
      {activeTab === 'animacao' && <AnimationPicker   value={settings.animation}    onSave={makeSaver('animation')} />}
      {activeTab === 'jogo'     && <GameplaySettings  value={settings.gameBehavior} onSave={makeSaver('gameBehavior')} />}
      {activeTab === 'totem'    && <TotemCustomizer value={settings.totem} onSave={makeSaver('totem')} />}
    </ScreenContainer>
  );
}

function ThemeRow({ theme, onPlay, onEdit, onDelete }: {
  theme: CustomTheme; onPlay: () => void;
  onEdit: () => void; onDelete: () => void;
}) {
  return (
    <View style={styles.themeRow}>
      <View style={styles.themeInfo}>
        <Text style={styles.themeName}>{theme.name}</Text>
        {theme.description && <Text style={styles.themeDesc}>{theme.description}</Text>}
        <Text style={styles.themeMeta}>{theme.cards.length} cartas{theme.isDefault ? ' · Padrão' : ''}</Text>
      </View>
      <View style={styles.themeActions}>
        <AppButton title="▶"  size="sm" onPress={onPlay} />
        {!theme.isDefault && (
          <>
            <AppButton title="✏️" size="sm" variant="secondary" onPress={onEdit} />
            <AppButton title="🗑" size="sm" variant="danger"    onPress={onDelete} />
          </>
        )}
      </View>
    </View>
  );
}

function TotemTab({ value, onSave }: {
  value: AppSettings['totem'];
  onSave: (v: AppSettings['totem']) => Promise<void>;
}) {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);
  return (
    <SectionCard title="📺 Totem">
      <ToggleSwitch label="Tela de atração" value={local.attractScreenEnabled} onToggle={(v) => update({ attractScreenEnabled: v })} />
      <ToggleSwitch label="Modo quiosque"   value={local.kioskMode}            onToggle={(v) => update({ kioskMode: v })} />
      <ToggleSwitch label="Exibir marca"    value={local.showBranding}         onToggle={(v) => update({ showBranding: v })} />
      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: 18, padding: 4, borderWidth: 1, borderColor: colors.border,
    flexWrap: 'wrap', gap: 2,
  },
  tab:           { flex: 1, minWidth: 48, alignItems: 'center', paddingVertical: 8, borderRadius: 14, gap: 2 },
  tabActive:     { backgroundColor: colors.primaryGlow },
  tabIcon:       { fontSize: 18 },
  tabLabel:      { color: colors.textMuted,  fontSize: 10, fontWeight: '700' },
  tabLabelActive:{ color: colors.primary },
  themeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  themeInfo:    { flex: 1, gap: 2 },
  themeName:    { color: colors.text,          fontSize: 15, fontWeight: '700' },
  themeDesc:    { color: colors.textMuted,     fontSize: 12 },
  themeMeta:    { color: colors.textSecondary, fontSize: 11 },
  themeActions: { flexDirection: 'row', gap: 6 },
});