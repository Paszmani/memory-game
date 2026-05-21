import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { colors } from '@/constants/colors';

type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface Props {
  status:   SaveStatus;
  onSave:   () => void;
  onReset?: () => void;
}

const STATUS_CONFIG: Record<SaveStatus, { label: string; color: string; icon: string }> = {
  idle:   { label: '',                   color: 'transparent',   icon: '' },
  dirty:  { label: 'Alterações não salvas', color: colors.warning, icon: '●' },
  saving: { label: 'Salvando...',         color: colors.primary,  icon: '⟳' },
  saved:  { label: 'Salvo com sucesso!', color: colors.success,  icon: '✓' },
  error:  { label: 'Erro ao salvar',     color: colors.danger,   icon: '✗' },
};

export const SaveBar = memo(({ status, onSave, onReset }: Props) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isVisible = status !== 'idle';

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue:         isVisible ? 1 : 0,
      tension:         100,
      friction:        10,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  if (status === 'idle') return null;

  const cfg = STATUS_CONFIG[status];

  return (
    <Animated.View
      style={[
        styles.bar,
        { borderColor: cfg.color },
        {
          opacity:   slideAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange:  [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <View style={styles.left}>
        <Text style={[styles.icon, { color: cfg.color }]}>{cfg.icon}</Text>
        <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
      </View>

      <View style={styles.right}>
        {onReset && status === 'dirty' && (
          <AppButton title="Descartar" onPress={onReset} variant="ghost" size="sm" />
        )}
        {(status === 'dirty' || status === 'error') && (
          <AppButton
            title="Salvar"
            onPress={onSave}
            size="sm"
            variant="success"
          />
        )}
      </View>
    </Animated.View>
  );
});

SaveBar.displayName = 'SaveBar';

const styles = StyleSheet.create({
  bar: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   colors.surface,
    borderRadius:      16,
    padding:           14,
    borderWidth:       1.5,
    gap:               12,
  },
  left: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    flex:          1,
  },
  icon: {
    fontSize:   16,
    fontWeight: '700',
  },
  statusText: {
    fontSize:   13,
    fontWeight: '600',
    flex:       1,
  },
  right: {
    flexDirection: 'row',
    gap:           8,
  },
});