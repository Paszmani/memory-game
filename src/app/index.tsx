import { router }  from 'expo-router';
import React, { useState } from 'react';
import {
  Image, Pressable, ScrollView,
  StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';

import { AttractScreen }      from '@/components/game/AttractScreen';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { AppButton }          from '@/components/ui/AppButton';
import { colors }             from '@/constants/colors';
import { useAppSettings }     from '@/hooks/useAppSettings';
import { useAttractScreen }   from '@/hooks/useAttractScreen';
import { useThemeManager }    from '@/hooks/useThemeManager';
import { CustomTheme }        from '@/types/theme';

export default function HomeScreen() {
  const { settings }       = useAppSettings();
  const { themes }         = useThemeManager();
  const { width, height }  = useWindowDimensions();
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>();

  const { isActive, deactivate, resetTimer } = useAttractScreen({
    enabled:        settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  const isWide   = width >= 600;
  const innerMax = Math.min(width, 520);

  function handlePlay() {
    resetTimer();
    const theme = selectedThemeId ?? themes[0]?.id;
    router.push(theme ? `/game?themeId=${theme}` : '/game');
  }

  const { branding, background } = settings;

  return (
    <GradientBackground settings={background} style={styles.root}>
      {isActive && (
        <AttractScreen
          gameTitle={branding.gameTitle}
          message={settings.totem.attractMessage}
          onDismiss={deactivate}
        />
      )}

      <Pressable style={styles.flex} onPress={resetTimer}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { minHeight: height, paddingHorizontal: isWide ? 48 : 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
        >
          <View style={[styles.inner, { width: isWide ? innerMax : '100%' }]}>

            {/* Hero */}
            <View style={styles.hero}>
              {branding.logoUri
                ? <Image source={{ uri: branding.logoUri }} style={styles.logo} />
                : <Text style={styles.logoEmoji}>{branding.accentEmoji}</Text>
              }
              <Text style={[styles.title, isWide && styles.titleWide]}>
                {branding.gameTitle}
              </Text>
              <Text style={styles.subtitle}>{branding.gameSubtitle}</Text>
            </View>

            {/* Seletor de tema */}
            {themes.length > 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>TEMA</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.themeScroll}>
                  {themes.map((t) => (
                    <ThemeChip
                      key={t.id} theme={t}
                      isSelected={(selectedThemeId ?? themes[0]?.id) === t.id}
                      onSelect={() => setSelectedThemeId(t.id)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Botão principal — opaco e bem visível */}
            <AppButton
              title="▶  JOGAR"
              onPress={handlePlay}
              size="xl"
              fullWidth
            />

            {/* Navegação — sem emojis, texto limpo */}
            <View style={styles.navRow}>
              <Pressable
                onPress={() => router.push('/customize')}
                style={styles.navBtn}
              >
                <Text style={styles.navBtnIcon}>✎</Text>
                <Text style={styles.navBtnLabel}>Personalizar</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/records')}
                style={styles.navBtn}
              >
                <Text style={styles.navBtnIcon}>≡</Text>
                <Text style={styles.navBtnLabel}>Histórico</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/settings')}
                style={styles.navBtn}
              >
                <Text style={styles.navBtnIcon}>⚙</Text>
                <Text style={styles.navBtnLabel}>Config</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </Pressable>
    </GradientBackground>
  );
}

function ThemeChip({ theme, isSelected, onSelect }: {
  theme: CustomTheme; isSelected: boolean; onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect} style={[styles.chip, isSelected && styles.chipActive]}>
      <Text style={styles.chipEmoji}>{theme.cards[0]?.emoji ?? '🃏'}</Text>
      <Text style={[styles.chipLabel, isSelected && styles.chipLabelActive]}>
        {theme.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1, justifyContent: 'center',
    alignItems: 'center', paddingVertical: 60,
  },
  inner:     { gap: 28, alignSelf: 'center', width: '100%' },
  hero:      { alignItems: 'center', gap: 14 },
  logo:      { width: 90, height: 90, borderRadius: 22 },
  logoEmoji: { fontSize: 76 },
  title: {
    color: colors.primary, fontSize: 44,
    fontWeight: '900', textAlign: 'center', letterSpacing: -1,
  },
  titleWide: { fontSize: 56 },
  subtitle:  { color: colors.textSecondary, fontSize: 17, textAlign: 'center' },

  section:      { gap: 10 },
  sectionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  themeScroll:  { gap: 10, paddingVertical: 4 },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderRadius: 50,
    paddingVertical: 10, paddingHorizontal: 18,
    borderWidth: 2, borderColor: colors.border,
  },
  chipActive:      { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  chipEmoji:       { fontSize: 20 },
  chipLabel:       { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  chipLabelActive: { color: colors.primary },

  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: {
    flex:            1, alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, borderRadius: 16,
    paddingVertical: 14, borderWidth: 1, borderColor: colors.border,
  },
  navBtnIcon:  { color: colors.primary, fontSize: 22 },
  navBtnLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
});