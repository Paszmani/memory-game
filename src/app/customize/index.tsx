import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackgroundPicker }  from '@/components/customize/BackgroundPicker';
import { BrandingEditor }    from '@/components/customize/BrandingEditor';
import { CardStylePicker }   from '@/components/customize/CardStylePicker';
import { ThemeForm }         from '@/components/customize/ThemeForm';
import { AppButton }         from '@/components/ui/AppButton';
import { SectionCard }       from '@/components/ui/SectionCard';
import { ScreenContainer }   from '@/components/ui/ScreenContainer';
import { colors }            from '@/constants/colors';
import { DIFFICULTIES }      from '@/constants/difficulty';
import { useAppSettings }    from '@/hooks/useAppSettings';
import { useThemeManager }   from '@/hooks/useThemeManager';
import { CustomTheme }       from '@/types/theme';
import { router }            from 'expo-router';

type Tab = 'themes' | 'appearance' | 'totem';

const TABS: { key: Tab; label: string }[] = [
  { key: 'themes',     label: '🃏 Temas' },
  { key: 'appearance', label: '🎨 Aparência' },
  { key: 'totem',      label: '📺 Totem' },
];

export default function CustomizeScreen() {
  const [activeTab, setActiveTab]   = useState<Tab>('themes');
  const { settings, updateSettings } = useAppSettings();
  const { themes, addTheme, removeTheme } = useThemeManager();

  const handleDeleteTheme = useCallback((theme: CustomTheme) => {
    if (theme.isDefault) {
      Alert.alert('Tema padrão', 'O tema padrão não pode ser removido.');
      return;
    }
    Alert.alert(
      'Remover tema',
      `Deseja remover "${theme.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => void removeTheme(theme.id) },
      ],
    );
  }, [removeTheme]);

  return (
    <ScreenContainer>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setActiveTab(key)}
            style={[styles.tab, activeTab === key && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, activeTab === key && styles.tabLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab: Temas */}
      {activeTab === 'themes' && (
        <>
          <ThemeForm onSubmit={addTheme} />

          <SectionCard title={`Temas disponíveis (${themes.length})`}>
            {themes.map((theme) => (
              <View key={theme.id} style={styles.themeRow}>
                <View style={styles.themeInfo}>
                  <Text style={styles.themeName}>{theme.name}</Text>
                  {theme.description && (
                    <Text style={styles.themeDesc}>{theme.description}</Text>
                  )}
                  <Text style={styles.themeMeta}>
                    {theme.cards.length} cartas
                    {theme.isDefault ? ' · Padrão' : ''}
                  </Text>
                </View>

                <View style={styles.themeActions}>
                  <AppButton
                    title="Jogar"
                    size="sm"
                    onPress={() => router.push(`/game?difficulty=custom&themeId=${theme.id}`)}
                  />
                  {!theme.isDefault && (
                    <AppButton
                      title="Remover"
                      size="sm"
                      variant="danger"
                      onPress={() => handleDeleteTheme(theme)}
                    />
                  )}
                </View>
              </View>
            ))}
          </SectionCard>
        </>
      )}

      {/* Tab: Aparência */}
      {activeTab === 'appearance' && (
        <>
          <BrandingEditor
            value={settings.branding}
            onChange={(b) => updateSettings({ branding: b })}
          />
          <BackgroundPicker
            value={settings.background}
            onChange={(bg) => updateSettings({ background: bg })}
          />
          <CardStylePicker
            value={settings.cardStyle}
            onChange={(cs) => updateSettings({ cardStyle: cs })}
          />
        </>
      )}

      {/* Tab: Totem */}
      {activeTab === 'totem' && (
        <TotemSettings
          value={settings.totem}
          onChange={(t) => updateSettings({ totem: t })}
        />
      )}
    </ScreenContainer>
  );
}

// Sub-componente de configurações de Totem
function TotemSettings({
  value,
  onChange,
}: {
  value: typeof DIFFICULTIES[keyof typeof DIFFICULTIES] extends never ? never : Parameters<typeof import('@/hooks/useAppSettings').useAppSettings>[0] extends never ? never : import('@/types/settings').AppSettings['totem'];
  onChange: (v: Partial<import('@/types/settings').AppSettings['totem']>) => void;
}) {
  const { settings: appSettings, updateSettings } = import('@/hooks/useAppSettings').useAppSettings
    ? { settings: { totem: value }, updateSettings: (v: unknown) => onChange(v as never) }
    : { settings: { totem: value }, updateSettings: (v: unknown) => onChange(v as never) };

  return (
    <SectionCard title="Configurações de Totem">
      <TotemToggle
        label="Tela de atração (atrair visitantes)"
        value={value.attractScreenEnabled}
        onToggle={(v) => onChange({ attractScreenEnabled: v })}
      />
      <TotemToggle
        label="Modo quiosque (esconde navegação)"
        value={value.kioskMode}
        onToggle={(v) => onChange({ kioskMode: v })}
      />
      <Text style={styles.totemInfo}>
        Tempo de inatividade: {value.attractTimeoutSeconds}s
      </Text>
      <Text style={styles.totemInfo}>
        Auto-resetar após fim: {value.autoResetAfterFinishSeconds}s
      </Text>
    </SectionCard>
  );
}

function TotemToggle({
  label, value, onToggle,
}: { label: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <Pressable style={styles.toggleRow} onPress={() => onToggle(!value)}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    16,
    padding:         4,
    gap:             4,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  tab: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 10,
    borderRadius:    12,
  },
  tabActive: {
    backgroundColor: colors.primaryGlow,
  },
  tabLabel: {
    color:      colors.textMuted,
    fontSize:   13,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: colors.primary,
  },
  themeRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  themeInfo:  { flex: 1, gap: 2 },
  themeName: { color: colors.text,    fontSize: 16, fontWeight: '700' },
  themeDesc: { color: colors.textMuted, fontSize: 13 },
  themeMeta: { color: colors.textMuted, fontSize: 12 },
  themeActions: { gap: 6 },
  totemInfo: { color: colors.textSecondary, fontSize: 14 },
  toggleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLabel: { color: colors.text, fontSize: 15, flex: 1 },
  toggle: {
    width: 50, height: 28, borderRadius: 14,
    backgroundColor: colors.border, padding: 2,
    justifyContent: 'center',
  },
  toggleOn:   { backgroundColor: colors.primary },
  toggleThumb: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.textMuted,
  },
  toggleThumbOn: {
    backgroundColor: colors.background,
    alignSelf: 'flex-end',
  },
});