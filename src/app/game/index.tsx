import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AttractScreen }      from '@/components/game/AttractScreen';
import { GameFinishedModal }  from '@/components/game/GameFinishedModal';
import { GameHeader }         from '@/components/game/GameHeader';
import { MemoryBoard }        from '@/components/game/MemoryBoard';
import { GradientBackground } from '@/components/ui/GradientBackground';
import { AppButton }          from '@/components/ui/AppButton';
import { colors }             from '@/constants/colors';
import { useAppSettings }     from '@/hooks/useAppSettings';
import { useAttractScreen }   from '@/hooks/useAttractScreen';
import { useMemoryGame }      from '@/hooks/useMemoryGame';
import { useThemeManager }    from '@/hooks/useThemeManager';
import { saveGameResult }     from '@/services/scoreService';
import { GameResult }         from '@/types/game';
import { createId }           from '@/utils/id';

export default function GameScreen() {
  const params            = useLocalSearchParams();
  const { settings }      = useAppSettings();   // ← contexto global
  const { themes, isLoading } = useThemeManager();

  const selectedThemeId = typeof params.themeId === 'string' ? params.themeId : undefined;
  const hasSavedRef     = useRef(false);
  const autoResetRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTheme = useMemo(
    () => themes.find((t) => t.id === selectedThemeId) ?? themes[0],
    [selectedThemeId, themes],
  );

  const { gameBehavior, cardStyle } = settings;
  const pairCount = selectedTheme
    ? Math.min(gameBehavior.pairCount, selectedTheme.cards.length)
    : gameBehavior.pairCount;

  const game = useMemoryGame({
    themeCards:  selectedTheme?.cards ?? [],
    pairCount,
    flipDelayMs: gameBehavior.flipDelayMs,
  });

  const { isActive, deactivate, resetTimer } = useAttractScreen({
    enabled:        settings.totem.attractScreenEnabled,
    timeoutSeconds: settings.totem.attractTimeoutSeconds,
  });

  // Salva resultado ao finalizar
  useEffect(() => {
    if (!game.isFinished || !selectedTheme || hasSavedRef.current) return;
    hasSavedRef.current = true;

    const result: GameResult = {
      id:            createId('result'),
      themeId:       selectedTheme.id,
      themeName:     selectedTheme.name,
      moves:         game.moves,
      timeInSeconds: game.elapsedSeconds,
      finishedAt:    new Date().toISOString(),
    };
    void saveGameResult(result);

    // Auto-reset totem
    if (settings.totem.autoResetAfterFinishSeconds > 0) {
      autoResetRef.current = setTimeout(
        () => router.replace('/'),
        settings.totem.autoResetAfterFinishSeconds * 1000,
      );
    }
  }, [game.isFinished, game.moves, game.elapsedSeconds, selectedTheme, settings.totem]);

  useEffect(() => () => { if (autoResetRef.current) clearTimeout(autoResetRef.current); }, []);

  const handleRestart = useCallback(() => {
    if (autoResetRef.current) clearTimeout(autoResetRef.current);
    hasSavedRef.current = false;
    resetTimer();
    game.restartGame();
  }, [game, resetTimer]);

  const handleGoHome = useCallback(() => {
    if (autoResetRef.current) clearTimeout(autoResetRef.current);
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
      {isActive && (
        <AttractScreen
          gameTitle={settings.branding.gameTitle}
          message={settings.totem.attractMessage}
          onDismiss={deactivate}
        />
      )}

      <Pressable style={styles.flex} onPress={resetTimer}>
        <View style={styles.content}>
          {/* Barra superior */}
          <View style={styles.topBar}>
            <Pressable onPress={handleGoHome} style={styles.backBtn}>
              <Text style={styles.backBtnText}>← Início</Text>
            </Pressable>
            <Text style={styles.themeName} numberOfLines={1}>{selectedTheme.name}</Text>
          </View>

          <GameHeader
            moves={game.moves}
            elapsedSeconds={game.elapsedSeconds}
            settings={gameBehavior}
          />

          <MemoryBoard
            cards={game.cards}
            columns={gameBehavior.gridColumns}
            cardStyle={cardStyle}
            onFlip={game.flipCard}
          />

          <AppButton title="🔄 Reiniciar" onPress={handleRestart} variant="ghost" size="md" />
        </View>
      </Pressable>

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
  container:   { flex: 1 },
  flex:        { flex: 1 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.text, fontSize: 16 },
  content:     { flex: 1, padding: 16, gap: 12 },
  topBar:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8 },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      10,
    backgroundColor:   colors.surface,
    borderWidth:       1,
    borderColor:       colors.border,
  },
  backBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  themeName:   { flex: 1, color: colors.text, fontSize: 18, fontWeight: '800' },
});