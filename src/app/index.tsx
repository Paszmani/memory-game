import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AttractScreen } from '@/components/game/AttractScreen';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { AppButton } from '@/components/ui/AppButton';
import { colors } from '@/constants/colors';
import { DIFFICULTIES, DifficultyConfig } from '@/constants/difficulty';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAttractScreen } from '@/hooks/useAttractScreen';
import { useThemeManager } from '@/hooks/useThemeManager';
import { GameDifficulty } from '@/types/game';
import { CustomTheme } from '@/types/theme';
import { useState } from 'react';

const DIFFICULTIES_LIST: { key: GameDifficulty; config: DifficultyConfig }[] = [
  { key: 'easy',   config: DIFFICULTIES.easy },
  { key: 'medium', config: DIFFICULTIES.medium },
  { key: 'hard',   config: DIFFICULTIES.hard },
];

const DIFFICULTY_COLORS: Record<GameDifficulty, string> = {
  easy:   colors.success,
  medium: colors.warning,
  hard:   colors.danger,
  custom: colors.primary,
};

export default function HomeScreen() {
  const { settings }        = useAppSettings();
  const { themes }          = useThemeManager();
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>(undefined);

  const { isActive, deactivate, resetTimer } = useAttractScreen({
    enabled:        settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  const handleInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  function navigateToGame(difficulty: GameDifficulty) {
    resetTimer();
    const themeParam = selectedThemeId ? `&themeId=${selectedThemeId}` : '';
    router.push(`/game?difficulty=${difficulty}${themeParam}`);
  }

  const { branding, background } = settings;

  return (
    <GradientBackground settings={background} style={styles.container}>
      {isActive && (
        <AttractScreen
          gameTitle={branding.gameTitle}
          message={settings.totem.attractMessage}
          onDismiss={deactivate}
        />
      )}

      <Pressable style={styles.flex} onPress={handleInteraction}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Título */}
          <View style={styles.hero}>
            {branding.logoUri ? (
              <Image source={{ uri: branding.logoUri }} style={styles.logo} />
            ) : (
              <Text style={styles.logoEmoji}>🧠</Text>
            )}
            <Text style={styles.title}>{branding.gameTitle}</Text>
            <Text style={styles.subtitle}>{branding.gameSubtitle}</Text>
          </View>

          {/* Seleção de dificuldade */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ESCOLHA A DIFICULDADE</Text>
            <View style={styles.difficultyGrid}>
              {DIFFICULTIES_LIST.map(({ key, config }) => (
                <Pressable
                  key={key}
                  onPress={() => navigateToGame(key)}
                  style={({ pressed }) => [
                    styles.diffCard,
                    { borderColor: DIFFICULTY_COLORS[key] },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.diffLabel, { color: DIFFICULTY_COLORS[key] }]}>
                    {config.label}
                  </Text>
                  <Text style={styles.diffDesc}>{config.description}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Seletor de tema */}
          {themes.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TEMA</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.themeScroll}
              >
                {themes.map((theme) => {
                  const isSelected = (selectedThemeId ?? themes[0]?.id) === theme.id;
                  return (
                    <ThemeChip
                      key={theme.id}
                      theme={theme}
                      isSelected={isSelected}
                      onSelect={() => setSelectedThemeId(theme.id)}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Navegação secundária */}
          <View style={styles.navRow}>
            <AppButton
              title="🎨 Personalizar"
              onPress={() => router.push('/customize')}
              variant="ghost"
              size="md"
              style={styles.navBtn}
            />
            <AppButton
              title="🏆 Recordes"
              onPress={() => router.push('/records')}
              variant="ghost"
              size="md"
              style={styles.navBtn}
            />
            <AppButton
              title="⚙️ Config"
              onPress={() => router.push('/settings')}
              variant="ghost"
              size="md"
              style={styles.navBtn}
            />
          </View>
        </ScrollView>
      </Pressable>
    </GradientBackground>
  );
}

// Sub-componente ThemeChip
function ThemeChip({
  theme, isSelected, onSelect,
}: {
  theme: CustomTheme;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      style={[styles.themeChip, isSelected && styles.themeChipActive]}
    >
      <Text style={styles.themeChipEmoji}>
        {theme.cards[0]?.emoji ?? '🃏'}
      </Text>
      <Text style={[styles.themeChipLabel, isSelected && styles.themeChipLabelActive]}>
        {theme.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex:      { flex: 1 },
  content: {
    flexGrow:       1,
    padding:        24,
    gap:            28,
    paddingTop:     60,
    paddingBottom:  40,
  },
  hero: {
    alignItems: 'center',
    gap:        10,
  },
  logo: {
    width: 80, height: 80, borderRadius: 20,
  },
  logoEmoji: {
    fontSize: 64,
  },
  title: {
    color:         colors.text,
    fontSize:      42,
    fontWeight:    '900',
    textAlign:     'center',
    letterSpacing: -1,
  },
  subtitle: {
    color:     colors.textSecondary,
    fontSize:  18,
    textAlign: 'center',
    fontWeight:'500',
  },
  section: { gap: 12 },
  sectionLabel: {
    color:         colors.textMuted,
    fontSize:      12,
    fontWeight:    '700',
    letterSpacing: 1.5,
  },
  difficultyGrid: { gap: 10 },
  diffCard: {
    backgroundColor: colors.surface,
    borderRadius:    20,
    padding:         22,
    borderWidth:     2,
    gap:             6,
  },
  diffLabel: {
    fontSize:   22,
    fontWeight: '900',
  },
  diffDesc: {
    color:    colors.textSecondary,
    fontSize: 15,
  },
  pressed: {
    opacity:   0.8,
    transform: [{ scale: 0.98 }],
  },
  themeScroll: {
    gap:        10,
    paddingVertical: 4,
  },
  themeChip: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             8,
    backgroundColor: colors.surface,
    borderRadius:    50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth:     2,
    borderColor:     colors.border,
  },
  themeChipActive: {
    borderColor:     colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  themeChipEmoji: {
    fontSize: 20,
  },
  themeChipLabel: {
    color:      colors.textSecondary,
    fontSize:   15,
    fontWeight: '600',
  },
  themeChipLabelActive: {
    color: colors.primary,
  },
  navRow: {
    flexDirection: 'row',
    gap:           8,
  },
  navBtn: {
    flex: 1,
  },
});