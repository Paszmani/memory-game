import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';

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

import { SafeAreaView } from 'react-native-safe-area-context';

import { AttractScreen } from '@/components/game/AttractScreen';
import { AppButton } from '@/components/ui/AppButton';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { colors as baseColors } from '@/constants/colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAttractScreen } from '@/hooks/useAttractScreen';
import { useColors } from '@/hooks/useColors';
import { useThemeManager } from '@/hooks/useThemeManager';
import { CustomTheme } from '@/types/theme';

interface NavBtnProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function NavButton({ icon, label, onPress }: NavBtnProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const colors = useColors();

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
        styles.navBtnWrap,
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
          styles.navBtn,
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

  const [selectedId, setSelectedId] = useState<string | undefined>();

  const colors = useColors();

  const { isActive, notifyActivity } = useAttractScreen({
    enabled: settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  const isWide = width >= 600;
  const innerMax = Math.min(width, 520);

  const handleActivity = useCallback(() => {
    notifyActivity();
  }, [notifyActivity]);

  const handleStartShouldSetResponderCapture = useCallback(() => {
    notifyActivity();
    return false;
  }, [notifyActivity]);

  function handlePlay() {
    notifyActivity();

    const themeId = selectedId ?? themes[0]?.id;

    router.push(themeId ? `/game?themeId=${themeId}` : '/game');
  }

  const { branding, background, totem } = settings;

  return (
    <GradientBackground settings={background}>
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safe}
        onTouchStart={handleActivity}
        onStartShouldSetResponderCapture={handleStartShouldSetResponderCapture}
      >
        {isActive && (
          <AttractScreen
            message={totem.attractMessage}
            gameTitle={totem.showBranding ? branding.gameTitle : ''}
            centerImageUri={totem.attractCenterImageUri}
            onDismiss={notifyActivity}
          />
        )}

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
                  {
                    color: "#FFFFFF",
                  },
                ]}
              >
                {branding.gameTitle}
              </Text>

              <Text
                style={[
                  styles.subtitle,
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
                        notifyActivity();
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
                  notifyActivity();
                  router.push('/customize');
                }}
              />

              <NavButton
                icon="🏆"
                label="Recordes"
                onPress={() => {
                  notifyActivity();
                  router.push('/records');
                }}
              />

              <NavButton
                icon="⚙️"
                label="Config"
                onPress={() => {
                  notifyActivity();
                  router.push('/settings');
                }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  safe: {
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
    color: "#FFFFFF",
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
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
  },
  navBtnWrap: {
    flex: 1,
  },
  navBtn: {
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
    fontWeight: '700',
  },
});