import { router } from 'expo-router';
import React, { useRef, useState } from 'react';

import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AttractScreen } from '@/components/game/AttractScreen';
import { AppButton } from '@/components/ui/AppButton';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAttractScreen } from '@/hooks/useAttractScreen';
import { useColors } from '@/hooks/useColors';
import { useThemeManager } from '@/hooks/useThemeManager';
import { useTypography } from '@/hooks/useTypography';
import type { CustomTheme } from '@/types/theme';

interface NavButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function NavButton({ icon, label, onPress }: NavButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const colors = useColors();
  const typography = useTypography();

  function onIn() {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }

  function onOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  }

  return (
    <Animated.View
      style={[
        styles.navButtonWrap,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[
          styles.navButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.navIcon,
            {
              color: colors.primary,
            },
          ]}
        >
          {icon}
        </Text>

        <Text
          style={[
            styles.navLabel,
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { settings } = useAppSettings();
  const { themes } = useThemeManager();
  const { width, height } = useWindowDimensions();

  const colors = useColors();
  const typography = useTypography();

  const [selectedId, setSelectedId] = useState<string | undefined>();

  const { isActive, deactivate, resetTimer } = useAttractScreen({
    enabled: settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  const isWide = width >= 600;
  const innerMax = Math.min(width, 520);

  function handlePlay() {
    resetTimer();

    const themeId = selectedId ?? themes[0]?.id;

    router.push(
      themeId
        ? {
            pathname: '/game',
            params: {
              themeId,
            },
          }
        : '/game',
    );
  }

  const { branding, background, totem } = settings;

  return (
    <GradientBackground settings={background}>
      {isActive && (
        <AttractScreen
          message={totem.attractMessage}
          gameTitle={totem.showBranding ? branding.gameTitle : ''}
          centerImageUri={totem.attractCenterImageUri}
          onDismiss={deactivate}
        />
      )}

      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              minHeight: height,
              paddingHorizontal: isWide ? 48 : 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
          overScrollMode="always"
        >
          <View style={[styles.inner, { maxWidth: innerMax }]}>
            <View style={styles.hero}>
              {branding.logoUri ? (
                <Image source={{ uri: branding.logoUri }} style={styles.logo} />
              ) : (
                <Text style={styles.logoEmoji}>{branding.accentEmoji}</Text>
              )}

              <Text
                style={[
                  styles.title,
                  typography.black,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {branding.gameTitle}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  typography.regular,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {branding.gameSubtitle}
              </Text>
            </View>

            {themes.length > 1 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionLabel,
                    typography.bold,
                    {
                      color: colors.textMuted,
                    },
                  ]}
                >
                  TEMA
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.themeScroll}
                >
                  {themes.map((theme) => (
                    <ThemeChip
                      key={theme.id}
                      theme={theme}
                      isSelected={(selectedId ?? themes[0]?.id) === theme.id}
                      onSelect={() => {
                        resetTimer();
                        setSelectedId(theme.id);
                      }}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            <AppButton title="▶ JOGAR" size="xl" fullWidth onPress={handlePlay} />

            <View style={styles.navRow}>
              <NavButton
                icon="🎨"
                label="Personalizar"
                onPress={() => {
                  resetTimer();
                  router.push('/customize');
                }}
              />

              <NavButton
                icon="🏆"
                label="Recordes"
                onPress={() => {
                  resetTimer();
                  router.push('/records');
                }}
              />

              <NavButton
                icon="⚙️"
                label="Config"
                onPress={() => {
                  resetTimer();
                  router.push('/settings');
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

function ThemeChip({
  theme,
  isSelected,
  onSelect,
}: {
  theme: CustomTheme;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colors = useColors();
  const typography = useTypography();

  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isSelected && {
          borderColor: colors.primary,
          backgroundColor: colors.primaryGlow,
        },
      ]}
    >
      <Text style={styles.chipEmoji}>{theme.cards[0]?.emoji ?? ''}</Text>

      <Text
        style={[
          styles.chipLabel,
          typography.semiBold,
          {
            color: isSelected ? colors.primary : colors.textSecondary,
          },
        ]}
      >
        {theme.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  inner: {
    gap: 28,
    alignSelf: 'center',
    width: '100%',
  },
  hero: {
    alignItems: 'center',
    gap: 14,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 22,
  },
  logoEmoji: {
    fontSize: 76,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  themeScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 2,
  },
  chipEmoji: {
    fontSize: 20,
  },
  chipLabel: {
    fontSize: 15,
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navButtonWrap: {
    flex: 1,
  },
  navButton: {
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 12,
  },
});