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
import { useColors } from '@/hooks/useColors';
import { useMemoryGame } from '@/hooks/useMemoryGame';
import { useThemeManager } from '@/hooks/useThemeManager';
import { saveGameResult } from '@/services/scoreService';
import { GameResult } from '@/types/game';
import { createId } from '@/utils/id';

export default function GameScreen() {
  const params = useLocalSearchParams();

  const { settings } = useAppSettings();
  const dynamicColors = useColors();

  const { themes, isLoading } = useThemeManager();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;

  const selectedThemeId =
    typeof params.themeId === 'string' ? params.themeId : undefined;

  const hasSavedRef = useRef(false);
  const autoResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedThemeId) ?? themes[0],
    [selectedThemeId, themes],
  );

  const { gameBehavior, cardStyle } = settings;

  /*
   * Mantém o comportamento atual:
   * o jogo usa todas as cartas únicas do tema selecionado.
   */
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

  const getBackButtonBackground = () => {
    if (settings.ui.buttonStyle === 'outlined') {
      return 'transparent';
    }

    if (settings.ui.buttonStyle === 'flat') {
      return dynamicColors.primaryGlow;
    }

    if (settings.ui.useGlassmorphism) {
      return dynamicColors.primaryGlow;
    }

    return dynamicColors.primaryGlow;
  };

  const getBackButtonBorderColor = () => {
    if (settings.ui.buttonStyle === 'flat') {
      return 'transparent';
    }

    return dynamicColors.primaryMedium;
  };

  if (isLoading || !selectedTheme) {
    return (
      <GradientBackground settings={settings.background}>
        <View style={styles.center}>
          <ActivityIndicator color={dynamicColors.primary} size="large" />

          <Text
            style={[
              styles.loadingText,
              {
                color: settings.ui.textColor,
              },
            ]}
          >
            Carregando...
          </Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground settings={settings.background}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.safe}>
        {isActive && (
          <AttractScreen
            message={settings.totem.attractMessage}
            gameTitle={settings.branding.gameTitle}
            centerImageUri={settings.totem.attractCenterImageUri}
            onDismiss={deactivate}
          />
        )}

        <View style={styles.container}>
          <View style={[styles.topBar, isLandscape && styles.topBarLandscape]}>
            <Pressable
              onPress={handleGoHome}
              style={({ pressed }) => [
                styles.backBtn,
                {
                  backgroundColor: getBackButtonBackground(),
                  borderColor: getBackButtonBorderColor(),
                  borderRadius: Math.max(8, settings.ui.globalRadius ?? 10),
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.backBtnText,
                  {
                    color: dynamicColors.primary,
                  },
                ]}
              >
                ‹ Início
              </Text>
            </Pressable>

            <Text
              numberOfLines={1}
              style={[
                styles.themeName,
                {
                  color: settings.ui.textColor,
                },
              ]}
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

          <View
            style={[
              styles.footer,
              isLandscape && styles.footerLandscape,
              {
                borderTopColor: settings.ui.useGlassmorphism
                  ? dynamicColors.primaryMedium
                  : settings.ui.borderColor,
                backgroundColor: settings.ui.useGlassmorphism
                  ? dynamicColors.primaryGlow
                  : settings.ui.surfaceColor,
              },
            ]}
          >
            <AppButton
              title="Reiniciar"
              variant="secondary"
              size={isLandscape ? 'sm' : 'md'}
              onPress={handleRestart}
              fullWidth
            />
          </View>
        </View>

        <GameFinishedModal
          visible={game.isFinished}
          moves={game.moves}
          elapsedSeconds={game.elapsedSeconds}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
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
    borderWidth: 1.5,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  themeName: {
    flex: 1,
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
    flexGrow: 1,
    justifyContent: 'center',
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
  },
  footerLandscape: {
    paddingVertical: 6,
  },
});