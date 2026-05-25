import React, { memo, useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { colors }    from '@/constants/colors';
import { formatSeconds } from '@/utils/format';

interface Props {
  visible:        boolean;
  moves:          number;
  elapsedSeconds: number;
  onRestart:      () => void;
  onGoHome:       () => void;
}

export const GameFinishedModal = memo(({
  visible, moves, elapsedSeconds, onRestart, onGoHome,
}: Props) => {
  const scaleAnim   = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [visible, scaleAnim, opacityAnim]);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Parabéns!</Text>
          <Text style={styles.subtitle}>Você completou o jogo!</Text>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatSeconds(elapsedSeconds)}</Text>
              <Text style={styles.statLabel}>TEMPO</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{moves}</Text>
              <Text style={styles.statLabel}>JOGADAS</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <AppButton title="▶  Jogar novamente" onPress={onRestart} size="lg" fullWidth />
            <AppButton title="← Início"            onPress={onGoHome}  size="lg" variant="ghost" fullWidth />
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
    maxWidth:        400,
    backgroundColor: colors.surfaceElevated,
    borderRadius:    28,
    padding:         28,
    gap:             20,
    borderWidth:     1,
    borderColor:     colors.glassBorder,
    alignItems:      'center',
  },
  emoji:    { fontSize: 64 },
  title:    { color: colors.primary, fontSize: 34, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 17, textAlign: 'center' },
  stats: {
    flexDirection:   'row',
    backgroundColor: colors.surface,
    borderRadius:    18,
    padding:         20,
    width:           '100%',
    alignItems:      'center',
    justifyContent:  'space-around',
    borderWidth:     1,
    borderColor:     colors.border,
  },
  statItem:    { alignItems: 'center', gap: 6, flex: 1 },
  statDivider: { width: 1, height: 44, backgroundColor: colors.border },
  statValue:   { color: colors.primary, fontSize: 28, fontWeight: '900' },
  statLabel:   { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  actions:     { width: '100%', gap: 10 },
});