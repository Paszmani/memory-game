import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { AttractScreen } from '@/components/game/AttractScreen';
import { GameFinishedModal } from '@/components/game/GameFinishedModal';
import { GameHeader } from '@/components/game/GameHeader';
import { MemoryBoard } from '@/components/game/MemoryBoard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { colors } from '@/constants/colors';
import { DIFFICULTIES, normalizeDifficulty } from '@/constants/difficulty';
import { calculateScore } from '@/domain/game/scoring';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAttractScreen } from '@/hooks/useAttractScreen';
import { useMemoryGame } from '@/hooks/useMemoryGame';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';
import { useThemeManager } from '@/hooks/useThemeManager';
import { saveGameResult } from '@/services/scoreService';
import type { GameResult } from '@/types/game';
import { createId } from '@/utils/id';

export default function GameScreen() {
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const { settings } = useAppSettings();
  const { themes, isLoading } = useThemeManager();

  const difficulty = normalizeDifficulty(params.difficulty);
  const selectedThemeId =
    typeof params.themeId === 'string' ? params.themeId : undefined;

  const hasSavedRef = useRef(false);
  const autoResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.id === selectedThemeId) ?? themes[0],
    [selectedThemeId, themes],
  );

  const diffConfig = DIFFICULTIES[difficulty];

  const pairCount = selectedTheme
    ? Math.min(diffConfig.pairCount, selectedTheme.cards.length)
    : diffConfig.pairCount;

  const game = useMemoryGame({
    themeCards: selectedTheme?.cards ?? [],
    pairCount,
    flipDelayMs: settings.gameBehavior.flipDelayMs,
  });

  const responsiveColumns = useResponsiveColumns(
    settings.gameBehavior.gridColumns,
  );

  const score = calculateScore({
    pairCount,
    moves: game.moves,
    timeInSeconds: game.elapsedSeconds,
  });

  const { isActive, deactivate, resetTimer } = useAttractScreen({
    enabled: settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
    onActivate: () => undefined,
  });

  useEffect(() => {
    if (!game.isFinished || !selectedTheme || hasSavedRef.current) return;

    hasSavedRef.current = true;

    const result: GameResult = {
      id: createId('result'),
      themeId: selectedTheme.id,
      themeName: selectedTheme.name,
      difficulty,
      moves: game.moves,
      timeInSeconds: game.elapsedSeconds,
      score,
      finishedAt: new Date().toISOString(),
    };

    void saveGameResult(result);

    if (settings.totem.autoResetAfterFinishSeconds > 0) {
      autoResetRef.current = setTimeout(() => {
        router.replace('/');
      }, settings.totem.autoResetAfterFinishSeconds * 1000);
    }
  }, [
    difficulty,
    game.elapsedSeconds,
    game.isFinished,
    game.moves,
    score,
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
    resetTimer();
    game.restartGame();
  }, [game, resetTimer]);

  const handleGoHome = useCallback(() => {
    if (autoResetRef.current) {
      clearTimeout(autoResetRef.current);
    }

    router.replace('/');
  }, []);

  const handleInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  if (isLoading || !selectedTheme) {
    return (
      <GradientBackground settings={settings.background}>
        <View style={styles.center}>
          <ActivityIndicator color={settings.ui.primaryColor} size="large" />
          <Text style={[styles.loadingText, { color: settings.ui.textColor }]}>
            Carregando partida...
          </Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground settings={settings.background}>
      <Pressable style={styles.flex} onPress={handleInteraction}>
        {isActive && (
          <AttractScreen
            message={settings.totem.attractMessage}
            onStart={deactivate}
          />
        )}

        <View
          style={[
            styles.content,
            {
              paddingHorizontal: width >= 900 ? 28 : 14,
              maxWidth: 1080,
            },
          ]}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={handleGoHome}
              style={[
                styles.backBtn,
                {
                  backgroundColor: settings.ui.surfaceColor,
                  borderColor: settings.ui.borderColor,
                  borderRadius: settings.ui.globalRadius,
                },
              ]}
            >
              <Text
                style={[
                  styles.backBtnText,
                  {
                    color: settings.ui.textColor,
                  },
                ]}
              >
                ← Início
              </Text>
            </Pressable>

            <View style={styles.topInfo}>
              <Text
                numberOfLines={1}
                style={[
                  styles.themeName,
                  {
                    color: settings.ui.textColor,
                  },
                ]}
              >
                {settings.branding.accentEmoji} {selectedTheme.name}
              </Text>

              <Text
                style={[
                  styles.diffLabel,
                  {
                    color: settings.ui.textColor,
                    opacity: 0.7,
                  },
                ]}
              >
                {diffConfig.label}
              </Text>
            </View>
          </View>

          <GameHeader
            moves={game.moves}
            elapsedSeconds={game.elapsedSeconds}
            score={score}
            settings={settings.gameBehavior}
          />

          <MemoryBoard
            cards={game.cards}
            columns={responsiveColumns}
            cardStyle={settings.cardStyle}
            animationSettings={settings.animation}
            showLabels={settings.gameBehavior.showLabels}
            onFlip={game.flipCard}
          />
        </View>

        <GameFinishedModal
          visible={game.isFinished}
          moves={game.moves}
          timeInSeconds={game.elapsedSeconds}
          score={score}
          onRestart={handleRestart}
          onHome={handleGoHome}
        />
      </Pressable>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
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
  content: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 12,
    gap: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topInfo: {
    flex: 1,
    minWidth: 0,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '800',
  },
  diffLabel: {
    fontSize: 13,
  },
});
