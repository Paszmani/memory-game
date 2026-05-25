import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SaveBar }     from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { ToggleSwitch }from '@/components/ui/ToggleSwitch';
import { colors }      from '@/constants/colors';
import { useSaveState }from '@/hooks/useSaveState';
import {
  AnimationSettings,
  CardFlipStyle,
  MatchAnimation,
  WinAnimation,
} from '@/types/settings';

interface Props {
  value:   AnimationSettings;
  onSave:  (v: AnimationSettings) => Promise<void>;
}

const FLIP_STYLES: { key: CardFlipStyle; label: string; icon: string }[] = [
  { key: 'horizontal', label: 'Horizontal', icon: '↔️' },
  { key: 'vertical',   label: 'Vertical',   icon: '↕️' },
  { key: 'fade',       label: 'Fade',       icon: '🌫️' },
  { key: 'zoom',       label: 'Zoom',       icon: '🔍' },
];

const MATCH_ANIMS: { key: MatchAnimation; label: string }[] = [
  { key: 'bounce', label: 'Quicar' },
  { key: 'glow',   label: 'Brilhar' },
  { key: 'pulse',  label: 'Pulsar' },
  { key: 'none',   label: 'Nenhum' },
];

const WIN_ANIMS: { key: WinAnimation; label: string; icon: string }[] = [
  { key: 'confetti', label: 'Confete',  icon: '🎊' },
  { key: 'stars',    label: 'Estrelas', icon: '⭐' },
  { key: 'none',     label: 'Nenhum',   icon: '⬜' },
];

export const AnimationPicker = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);

  return (
    <SectionCard title="🎬 Animações">
      <ToggleSwitch
        label="Animações habilitadas"
        hint="Desative para melhor desempenho"
        value={local.enabled}
        onToggle={(v) => update({ enabled: v })}
      />

      {local.enabled && (
        <>
          {/* Estilo de virar */}
          <Text style={styles.subLabel}>Estilo de virada</Text>
          <View style={styles.optionGrid}>
            {FLIP_STYLES.map(({ key, label, icon }) => (
              <OptionChip
                key={key}
                label={`${icon} ${label}`}
                active={local.flipStyle === key}
                onPress={() => update({ flipStyle: key })}
              />
            ))}
          </View>

          {/* Velocidade */}
          <SliderInput
            label="Velocidade da virada"
            value={local.flipSpeedMs}
            min={100}
            max={700}
            step={50}
            unit="ms"
            onChange={(v) => update({ flipSpeedMs: v })}
          />

          {/* Animação ao acertar par */}
          <Text style={styles.subLabel}>Ao encontrar par</Text>
          <View style={styles.optionGrid}>
            {MATCH_ANIMS.map(({ key, label }) => (
              <OptionChip
                key={key}
                label={label}
                active={local.matchAnimation === key}
                onPress={() => update({ matchAnimation: key })}
              />
            ))}
          </View>

          {/* Animação de vitória */}
          <Text style={styles.subLabel}>Ao vencer</Text>
          <View style={styles.optionGrid}>
            {WIN_ANIMS.map(({ key, label, icon }) => (
              <OptionChip
                key={key}
                label={`${icon} ${label}`}
                active={local.winAnimation === key}
                onPress={() => update({ winAnimation: key })}
              />
            ))}
          </View>
        </>
      )}

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

AnimationPicker.displayName = 'AnimationPicker';

function OptionChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  subLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 4 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical:   8,
    paddingHorizontal: 14,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       colors.border,
    backgroundColor:   colors.background,
  },
  chipActive: {
    borderColor:     colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  chipLabel:       { color: colors.textMuted,  fontSize: 13, fontWeight: '600' },
  chipLabelActive: { color: colors.primary },
});