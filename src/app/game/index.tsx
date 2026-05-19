import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { GameFinishedModal } from '@/components/game/GameFinishedModal';
import { GameHeader } from '@/components/game/GameHeader';
import { MemoryBoard } from '@/components/game/MemoryBoard';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import {
  DIFFICULTIES,
  normalizeDifficulty,
} from '@/constants/difficulty';
import { calculateScore } from '@/domain/game/scoring';
import { useMemoryGame } from '@/hooks/useMemoryGame';
import { useThemeManager } from '@/hooks/useThemeManager';
import { saveGameResult } from '@/services/scoreService';
import { GameResult } from '@/types/game';
import { createId } from '@/utils/id';

export default function GameScreen() {
  const params = useLocalSearchParams();
  const difficulty = normalizeDifficulty(params.difficulty);
  const selectedThemeId =
    typeof params.themeId === 'string' ? params.themeId : undefined;

  const hasSavedResultRef = useRef(false);

  const { themes, isLoading } = useThemeManager();

  const selectedTheme = useMemo(() => {
    return (
      themes.find((theme) => theme.id === selectedThemeId) ??
      themes[0]
    );
  }, [selectedThemeId, themes]);

  const difficultyConfig = DIFFICULTIES[difficulty];

  const pairCount = selectedTheme
    ? Math.min(difficultyConfig.pairCount, selectedTheme.cards.length)
    : difficultyConfig.pairCount;

  const game = useMemoryGame({
    themeCards: selectedTheme?.cards ?? [],
    pairCount,
  });

  const score = calculateScore({
    pairCount,
    moves: game.moves,
    timeInSeconds: game.elapsedSeconds,
  });

  useEffect(() => {
    if (!game.isFinished || !selectedTheme || hasSavedResultRef.current) {
      return;
    }

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

    hasSavedResultRef.current = true;

    void saveGameResult(result);
  }, [
    difficulty,
    game.elapsedSeconds,
    game.isFinished,
    game.moves,
    score,
    selectedTheme,
  ]);

  function handleRestart() {
    hasSavedResultRef.current = false;
    game.restartGame();
  }

  if (isLoading || !selectedTheme) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Carregando partida...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.container}>
        <Text style={styles.title}>{selectedTheme.name}</Text>
        <Text style={styles.subtitle}>
          Dificuldade: {difficultyConfig.label}
        </Text>

        <GameHeader
          moves={game.moves}
          elapsedSeconds={game.elapsedSeconds}
        />

        <MemoryBoard
          cards={game.cards}
          columns={difficultyConfig.columns}
          onFlipCard={game.flipCard}
        />

        <AppButton
          title="Reiniciar partida"
          onPress={handleRestart}
          variant="secondary"
        />
      </View>

      <GameFinishedModal
        visible={game.isFinished}
        moves={game.moves}
        elapsedSeconds={game.elapsedSeconds}
        score={score}
        onRestart={handleRestart}
        onGoHome={() => router.replace('/')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
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
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
  },
});