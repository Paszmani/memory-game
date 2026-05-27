import { router }  from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated, Image, Pressable, ScrollView,
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
import { useColors }          from '@/hooks/useColors';

// ── Botão de navegação com animação de press ─────────────────────────────────
interface NavBtnProps {
  icon:    string;
  label:   string;
  onPress: () => void;
}

function NavButton({ icon, label, onPress }: NavBtnProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const colors = useColors();

  function onIn()  { Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 50 }).start(); }
  function onOut() { Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 50 }).start(); }

  return (
    <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={styles.navBtnWrap}>
      <Animated.View style={[
        styles.navBtn,
        { transform: [{ scale }], borderColor: colors.border, backgroundColor: colors.surface },
      ]}>
        <Text style={[styles.navIcon,  { color: colors.primary }]}>{icon}</Text>
        <Text style={[styles.navLabel, { color: colors.textSecondary }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { settings }      = useAppSettings();
  const { themes }        = useThemeManager();
  const { width, height } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { isActive, deactivate, resetTimer } = useAttractScreen({
    enabled:        settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  const isWide   = width >= 600;
  const innerMax = Math.min(width, 520);
  const colors = useColors();

  function handlePlay() {
    resetTimer();
    const themeId = selectedId ?? themes[0]?.id;
    router.push(themeId ? `/game?themeId=${themeId}` : '/game');
  }

  const { branding, background, totem } = settings;

  return (
    <GradientBackground settings={background} style={styles.root}>
      {isActive && (
        <AttractScreen
          gameTitle={branding.gameTitle}
          message={totem.attractMessage}
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
              <Text style={[styles.title, { color: colors.primary }, isWide && { fontSize: 52 }]}>
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
                    <ThemeChip key={t.id} theme={t}
                      isSelected={(selectedId ?? themes[0]?.id) === t.id}
                      onSelect={() => setSelectedId(t.id)} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Botão JOGAR — sempre opaco e bem visível */}
            <AppButton title="▶  JOGAR" onPress={handlePlay} size="xl" fullWidth />

            {/* Navegação com mesma animação de press */}
            <View style={styles.navRow}>
              <NavButton icon="✎" label="Personalizar" onPress={() => router.push('/customize')} />
              <NavButton icon="≡" label="Histórico"    onPress={() => router.push('/records')}  />
              <NavButton icon="⚙" label="Config"       onPress={() => router.push('/settings')} />
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
  const colors = useColors();
  return (
    <Pressable onPress={onSelect} style={[
      styles.chip,
      { borderColor: isSelected ? colors.primary : colors.border,
        backgroundColor: isSelected ? colors.primaryGlow : colors.surface },
    ]}>
      <Text style={styles.chipEmoji}>{theme.cards[0]?.emoji ?? '🃏'}</Text>
      <Text style={[styles.chipLabel, { color: isSelected ? colors.primary : colors.textSecondary }]}>
        {theme.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  flex:    { flex: 1 },
  scroll:  { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  inner:   { gap: 28, alignSelf: 'center', width: '100%' },
  hero:    { alignItems: 'center', gap: 14 },
  logo:    { width: 90, height: 90, borderRadius: 22 },
  logoEmoji: { fontSize: 76 },
  title: {
    color: colors.primary, fontSize: 44, fontWeight: '900',
    textAlign: 'center', letterSpacing: -1,
  },
  subtitle:  { color: colors.textSecondary, fontSize: 17, textAlign: 'center' },
  section:   { gap: 10 },
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
  navRow:     { flexDirection: 'row', gap: 10 },
  navBtnWrap: { flex: 1 },
  navBtn: {
    alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderRadius: 18,
    paddingVertical: 16, borderWidth: 1.5, borderColor: colors.border,
  },
  navIcon:  { color: colors.primary, fontSize: 24 },
  navLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
});