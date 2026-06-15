import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AttractScreen } from '@/components/game/AttractScreen';
import { GameFinishedModal } from '@/components/game/GameFinishedModal';
import { GameHeader } from '@/components/game/GameHeader';
import { MemoryBoard } from '@/components/game/MemoryBoard';
import { AppButton } from '@/components/ui/AppButton';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { colors as baseColors } from '@/constants/colors';
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
  const colors = useColors();

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

  const pairCount = selectedTheme?.cards.length ?? 0;

  const boardColumns = isLandscape
    ? Math.min(gameBehavior.gridColumns + 2, 8)
    : gameBehavior.gridColumns;

  const game = useMemoryGame({
    themeCards: selectedTheme?.cards ?? [],
    pairCount,
    flipDelayMs: gameBehavior.flipDelayMs,
    previewCardsOnStart: gameBehavior.previewCardsOnStart,
    previewCardsDurationMs: gameBehavior.previewCardsDurationMs,
  });

  const { isActive, notifyActivity } = useAttractScreen({
    enabled: settings.totem.attractScreenEnabled && !game.isFinished,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  const handleUserActivity = useCallback(() => {
    notifyActivity();
  }, [notifyActivity]);

  const handleStartShouldSetResponderCapture = useCallback(() => {
    notifyActivity();
    return false;
  }, [notifyActivity]);

  const handleFlipCard = useCallback(
    (cardId: string) => {
      notifyActivity();
      game.flipCard(cardId);
    },
    [game, notifyActivity],
  );

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
    settings.totem.autoResetAfterFinishSeconds,
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
    notifyActivity();
    game.restartGame();
  }, [game, notifyActivity]);

  const handleGoHome = useCallback(() => {
    if (autoResetRef.current) {
      clearTimeout(autoResetRef.current);
    }

    router.replace('/');
  }, []);

  if (isLoading || !selectedTheme) {
    return (
      <GradientBackground settings={settings.background}>
        <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safe}>
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} size="large" />

            <Text
              style={[
                styles.loadingText,
                {
                  color: colors.text,
                },
              ]}
            >
              Carregando...
            </Text>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground settings={settings.background}>
      <StatusBar style="light" />

      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safe}
        onTouchStart={handleUserActivity}
        onStartShouldSetResponderCapture={handleStartShouldSetResponderCapture}
      >
        {isActive && (
          <AttractScreen
            message={settings.totem.attractMessage}
            gameTitle={settings.branding.gameTitle}
            centerImageUri={settings.totem.attractCenterImageUri}
            onDismiss={notifyActivity}
          />
        )}

        <View style={styles.container}>
          <View style={[styles.topBar, isLandscape && styles.topBarLandscape]}>
            <Pressable
              onPress={handleGoHome}
              style={({ pressed }) => [
                styles.backBtn,
                {
                  backgroundColor: colors.primaryGlow,
                  borderColor: colors.primaryMedium,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.backBtnText,
                  {
                    color: colors.primary,
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
                  color: colors.text,
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
            onScrollBeginDrag={handleUserActivity}
            onMomentumScrollBegin={handleUserActivity}
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
              onFlip={handleFlipCard}
            />
          </ScrollView>

          <View
            style={[
              styles.footer,
              isLandscape && styles.footerLandscape,
              {
                borderTopColor: colors.border,
                backgroundColor: colors.surface,
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
  safe: {
    flex: 1,
  },
  container: {
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
    borderRadius: 10,
    borderWidth: 1,
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