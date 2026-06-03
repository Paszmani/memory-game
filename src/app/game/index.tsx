import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AttractScreen } from '@/components/game/AttractScreen';
import { GameFinishedModal } from '@/components/game/GameFinishedModal';
import { GameHeader } from '@/components/game/GameHeader';
import { MemoryBoard } from '@/components/game/MemoryBoard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { AppButton } from '@/components/ui/AppButton';
import { colors } from '@/constants/colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAttractScreen } from '@/hooks/useAttractScreen';
import { useMemoryGame } from '@/hooks/useMemoryGame';
import { useThemeManager } from '@/hooks/useThemeManager';
import { saveGameResult } from '@/services/scoreService';
import { GameResult } from '@/types/game';
import { createId } from '@/utils/id';
import { useTypography } from '@/hooks/useTypography';


export default function GameScreen() {
  const params = useLocalSearchParams();
  const { settings } = useAppSettings();
  const { themes, isLoading } = useThemeManager();

  const typography = useTypography();
  const radius = Math.max(12, settings.ui.globalRadius ?? 16);
  const panelBackground = settings.ui.useGlassmorphism ? colors.glass : colors.surface;

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const selectedThemeId =
    typeof params.themeId === 'string' ? params.themeId : undefined;

  const hasSavedRef = useRef(false);
  const autoResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTheme = useMemo(
    () => themes.find((t) => t.id === selectedThemeId) ?? themes[0],
    [selectedThemeId, themes],
  );

  const { gameBehavior, cardStyle } = settings;

  // Sempre usa todas as cartas únicas do tema selecionado.
  const pairCount = selectedTheme?.cards.length ?? 0;

  const boardColumns = isLandscape
    ? Math.min(gameBehavior.gridColumns + 2, 8)
    : gameBehavior.gridColumns;

  const game = useMemoryGame({
    themeCards: selectedTheme?.cards ?? [],
    pairCount,
    flipDelayMs: gameBehavior.flipDelayMs,
  });

  const { isActive, deactivate, resetTimer } = useAttractScreen({
    enabled: settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  useEffect(() => {
    if (!game.isFinished || !selectedTheme || hasSavedRef.current) {
      return;
    }

    hasSavedRef.current = true;

    const result: GameResult = {
      id: createId('result'),
      themeId: selectedTheme.id,
      themeName: selectedTheme.name,
      moves: game.moves,
      timeInSeconds: game.elapsedSeconds,
      finishedAt: new Date().toISOString(),
    };

    void saveGameResult(result);

    if (settings.totem.autoResetAfterFinishSeconds > 0) {
      autoResetRef.current = setTimeout(
        () => router.replace('/'),
        settings.totem.autoResetAfterFinishSeconds * 1000,
      );
    }
  }, [
    game.isFinished,
    game.moves,
    game.elapsedSeconds,
    selectedTheme,
    settings.totem,
  ]);

  useEffect(() => {
    return () => {
      if (autoResetRef.current) {
        clearTimeout(autoResetRef.current);
      }
    };
  }, []);

  const handleRestart = useCallback(() => {
    if (autoResetRef.current) {
      clearTimeout(autoResetRef.current);
    }

    hasSavedRef.current = false;
    resetTimer();
    game.restartGame();
  }, [game, resetTimer]);

  const handleGoHome = useCallback(() => {
    if (autoResetRef.current) {
      clearTimeout(autoResetRef.current);
    }

    router.replace('/');
  }, []);

  if (isLoading || !selectedTheme) {
    return (
      <GradientBackground settings={settings.background} style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground settings={settings.background} style={styles.container}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.safe}>
        <Pressable style={styles.flex} onPress={resetTimer}>
          {isActive && (
            <AttractScreen
              gameTitle={settings.branding.gameTitle}
              message={settings.totem.attractMessage}
              centerImageUri={settings.totem.attractCenterImageUri}
              onDismiss={deactivate}
            />
          )}

          <View style={[styles.topBar, isLandscape && styles.topBarLandscape]}>
            <Pressable
              onPress={handleGoHome}
              style={[
                styles.backBtn,
                {
                  borderRadius: radius,
                  backgroundColor: panelBackground,
                  borderColor: settings.ui.useGlassmorphism
                    ? colors.glassBorder
                    : colors.surfaceLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.backBtnText,
                  typography.getFontStyle('bold'),
                  { color: colors.primary },
                ]}
              >
                ‹ Início
              </Text>
            </Pressable>

            <Text
              style={[
                styles.themeName,
                typography.getFontStyle('bold'),
                { color: colors.text },
              ]}
              numberOfLines={1}
            >
              {selectedTheme.name}
            </Text>
          </View>

          {!isLandscape && (
            <View style={styles.headerRow}>
              <GameHeader
                moves={game.moves}
                elapsedSeconds={game.elapsedSeconds}
                settings={gameBehavior}
              />
            </View>
          )}

          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.boardScroll,
              isLandscape && styles.boardScrollLandscape,
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
          >
            {isLandscape && (
              <View style={styles.landscapeStats}>
                <GameHeader
                  moves={game.moves}
                  elapsedSeconds={game.elapsedSeconds}
                  settings={gameBehavior}
                />
              </View>
            )}

            <MemoryBoard
              cards={game.cards}
              columns={boardColumns}
              cardStyle={cardStyle}
              onFlip={game.flipCard}
            />
          </ScrollView>

          <View style={[styles.footer, isLandscape && styles.footerLandscape, 
            {backgroundColor:panelBackground, borderTopColor: colors.border,}, ]}>
            <AppButton
              title="↺ Reiniciar"
              onPress={handleRestart}
              variant="secondary"
              size={isLandscape ? 'sm' : 'md'}
              fullWidth
            />
          </View>
        </Pressable>
      </SafeAreaView>

      <GameFinishedModal
        visible={game.isFinished}
        moves={game.moves}
        elapsedSeconds={game.elapsedSeconds}
        onRestart={handleRestart}
        onGoHome={handleGoHome}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  safe: { flex: 1 },

  flex: { flex: 1 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loadingText: {
    color: colors.text,
    fontSize: 16,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },

  topBarLandscape: {
    paddingTop: 6,
    paddingBottom: 4,
  },

  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  backBtnText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  themeName: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },

  headerRow: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },

  boardScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  boardScrollLandscape: {
    paddingHorizontal: 8,
    paddingBottom: 4,
  },

  landscapeStats: {
    paddingBottom: 6,
    paddingHorizontal: 8,
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },

  footerLandscape: {
    paddingVertical: 6,
  },
});
