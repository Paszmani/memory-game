import React, { memo, useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { colors } from '@/constants/colors';
import { getScoreLabel } from '@/domain/game/scoring';
import { formatScore, formatSeconds } from '@/utils/format';

interface Props {
  visible:        boolean;
  moves:          number;
  elapsedSeconds: number;
  score:          number;
  pairCount:      number;
  onRestart:      () => void;
  onGoHome:       () => void;
}

export const GameFinishedModal = memo(({
  visible,
  moves,
  elapsedSeconds,
  score,
  pairCount,
  onRestart,
  onGoHome,
}: Props) => {
  const scaleAnim   = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue:         1,
        tension:         80,
        friction:        8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue:         1,
        duration:        250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, scaleAnim, opacityAnim]);

  const scoreLabel = getScoreLabel(score, pairCount);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity:   opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Parabéns!</Text>
          <Text style={styles.subtitle}>{scoreLabel}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatSeconds(elapsedSeconds)}</Text>
              <Text style={styles.statLabel}>Tempo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{moves}</Text>
              <Text style={styles.statLabel}>Jogadas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.scoreValue]}>
                {formatScore(score)}
              </Text>
              <Text style={styles.statLabel}>Pontos</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Jogar novamente"
              onPress={onRestart}
              size="lg"
              fullWidth
            />
            <AppButton
              title="Início"
              onPress={onGoHome}
              variant="ghost"
              size="lg"
              fullWidth
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

GameFinishedModal.displayName = 'GameFinishedModal';

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: colors.overlay,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         24,
  },
  card: {
    width:           '100%',
    maxWidth:        420,
    backgroundColor: colors.surfaceElevated,
    borderRadius:    28,
    padding:         28,
    gap:             20,
    borderWidth:     1,
    borderColor:     colors.glassBorder,
    alignItems:      'center',
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    color:      colors.text,
    fontSize:   32,
    fontWeight: '900',
    textAlign:  'center',
  },
  subtitle: {
    color:     colors.primary,
    fontSize:  18,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    18,
    padding:         18,
    width:           '100%',
    alignItems:      'center',
    justifyContent:  'space-around',
    borderWidth:     1,
    borderColor:     colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap:        4,
    flex:       1,
  },
  statDivider: {
    width:           1,
    height:          40,
    backgroundColor: colors.border,
  },
  statValue: {
    color:      colors.text,
    fontSize:   22,
    fontWeight: '800',
  },
  scoreValue: {
    color: colors.primary,
  },
  statLabel: {
    color:    colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  actions: {
    width: '100%',
    gap:   10,
  },
});