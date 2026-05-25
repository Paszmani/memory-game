import { router }  from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AttractScreen }      from '@/components/game/AttractScreen';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { AppButton }          from '@/components/ui/AppButton';
import { colors }             from '@/constants/colors';
import { useAppSettings }     from '@/hooks/useAppSettings';
import { useAttractScreen }   from '@/hooks/useAttractScreen';
import { useThemeManager }    from '@/hooks/useThemeManager';
import { useResponsive }      from '@/hooks/useResponsive';
import { CustomTheme }        from '@/types/theme';

export default function HomeScreen() {
  const { settings }  = useAppSettings();   // ← contexto global
  const { themes }    = useThemeManager();
  const { isLarge }   = useResponsive();
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>();

  const { isActive, deactivate, resetTimer } = useAttractScreen({
    enabled:        settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  function handlePlay() {
  resetTimer();

  const theme = selectedThemeId ?? themes[0]?.id;

  router.push({
    pathname: '/game',
    params: theme ? { themeId: theme } : undefined,
  });
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

      <Pressable style={styles.flex} onPress={resetTimer}>
        <ScrollView
          contentContainerStyle={[styles.content, isLarge && styles.contentLarge]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            {branding.logoUri
              ? <Image source={{ uri: branding.logoUri }} style={styles.logo} />
              : <Text style={styles.logoEmoji}>{branding.accentEmoji}</Text>
            }
            <Text style={[styles.title, isLarge && styles.titleLarge]}>
              {branding.gameTitle}
            </Text>
            <Text style={styles.subtitle}>{branding.gameSubtitle}</Text>
          </View>

          {/* Seletor de tema (apenas se houver mais de 1) */}
          {themes.length > 1 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TEMA</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.themeScroll}
              >
                {themes.map((theme) => {
                  const active = (selectedThemeId ?? themes[0]?.id) === theme.id;
                  return (
                    <ThemeChip
                      key={theme.id}
                      theme={theme}
                      isSelected={active}
                      onSelect={() => setSelectedThemeId(theme.id)}
                    />
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Botão principal */}
          <AppButton
            title="▶  JOGAR"
            onPress={handlePlay}
            size="xl"
            fullWidth
          />

          {/* Navegação secundária */}
          <View style={styles.navRow}>
            <AppButton title="🎨 Personalizar" onPress={() => router.push('/customize')} variant="ghost" size="md" style={styles.navBtn} />
            <AppButton title="⚙️ Config"        onPress={() => router.push('/settings')}  variant="ghost" size="md" style={styles.navBtn} />
          </View>
        </ScrollView>
      </Pressable>
    </GradientBackground>
  );
}

function ThemeChip({ theme, isSelected, onSelect }: { theme: CustomTheme; isSelected: boolean; onSelect: () => void }) {
  return (
    <Pressable onPress={onSelect} style={[styles.themeChip, isSelected && styles.themeChipActive]}>
      <Text style={styles.themeChipEmoji}>{theme.cards[0]?.emoji ?? '🃏'}</Text>
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
    flexGrow:      1,
    padding:       24,
    gap:           28,
    paddingTop:    64,
    paddingBottom: 48,
  },
  contentLarge: { maxWidth: 560, alignSelf: 'center', width: '100%' },
  hero:         { alignItems: 'center', gap: 12 },
  logo:         { width: 80, height: 80, borderRadius: 20 },
  logoEmoji:    { fontSize: 72 },
  title: {
    color:         colors.primary,
    fontSize:      40,
    fontWeight:    '900',
    textAlign:     'center',
    letterSpacing: -1,
  },
  titleLarge:   { fontSize: 56 },
  subtitle: {
    color:      colors.textSecondary,
    fontSize:   18,
    textAlign:  'center',
    fontWeight: '500',
  },
  section:      { gap: 10 },
  sectionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  themeScroll:  { gap: 10, paddingVertical: 4 },
  themeChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   colors.surface,
    borderRadius:      50,
    paddingVertical:   10,
    paddingHorizontal: 18,
    borderWidth:       2,
    borderColor:       colors.border,
  },
  themeChipActive:      { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  themeChipEmoji:       { fontSize: 20 },
  themeChipLabel:       { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  themeChipLabelActive: { color: colors.primary },
  navRow:  { flexDirection: 'row', gap: 10 },
  navBtn:  { flex: 1 },
});