import React, { memo } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SaveBar } from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { useColors } from '@/hooks/useColors';
import { useSaveState } from '@/hooks/useSaveState';
import { useTypography } from '@/hooks/useTypography';
import type {
  AnimationSettings,
  CardFlipStyle,
  MatchAnimation,
  WinAnimation,
} from '@/types/settings';

interface Props {
  value: AnimationSettings;
  onSave: (value: AnimationSettings) => Promise<void>;
}

const FLIP_STYLES: { key: CardFlipStyle; label: string; icon: string }[] = [
  { key: 'horizontal', label: 'Horizontal', icon: '↔' },
  { key: 'vertical', label: 'Vertical', icon: '↕' },
  { key: 'fade', label: 'Fade', icon: '◐' },
  { key: 'zoom', label: 'Zoom', icon: '⊕' },
];

const MATCH_ANIMATIONS: { key: MatchAnimation; label: string }[] = [
  { key: 'bounce', label: 'Quicar' },
  { key: 'glow', label: 'Brilhar' },
  { key: 'pulse', label: 'Pulsar' },
  { key: 'none', label: 'Nenhum' },
];

const WIN_ANIMATIONS: { key: WinAnimation; label: string; icon: string }[] = [
  { key: 'confetti', label: 'Confete', icon: '🎉' },
  { key: 'stars', label: 'Estrelas', icon: '⭐' },
  { key: 'none', label: 'Nenhum', icon: '⬜' },
];

export const AnimationPicker = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(
    value,
    onSave,
  );

  return (
    <SectionCard title="Animações">
      <ToggleSwitch
        label="Ativar animações"
        value={local.enabled}
        onToggle={(enabled) =>
          update({
            enabled,
          })
        }
      />

      {local.enabled && (
        <>
          <OptionGroup
            title="Estilo de virada"
            options={FLIP_STYLES.map(({ key, label, icon }) => ({
              key,
              label: `${icon} ${label}`,
            }))}
            activeKey={local.flipStyle}
            onSelect={(flipStyle) =>
              update({
                flipStyle: flipStyle as CardFlipStyle,
              })
            }
          />

          <SliderInput
            label="Velocidade da virada"
            min={120}
            max={800}
            step={20}
            unit="ms"
            value={local.flipSpeedMs}
            onChange={(flipSpeedMs) =>
              update({
                flipSpeedMs,
              })
            }
          />

          <OptionGroup
            title="Ao encontrar par"
            options={MATCH_ANIMATIONS.map(({ key, label }) => ({
              key,
              label,
            }))}
            activeKey={local.matchAnimation}
            onSelect={(matchAnimation) =>
              update({
                matchAnimation: matchAnimation as MatchAnimation,
              })
            }
          />

          <OptionGroup
            title="Ao vencer"
            options={WIN_ANIMATIONS.map(({ key, label, icon }) => ({
              key,
              label: `${icon} ${label}`,
            }))}
            activeKey={local.winAnimation}
            onSelect={(winAnimation) =>
              update({
                winAnimation: winAnimation as WinAnimation,
              })
            }
          />
        </>
      )}

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

AnimationPicker.displayName = 'AnimationPicker';

function OptionGroup({
  title,
  options,
  activeKey,
  onSelect,
}: {
  title: string;
  options: { key: string; label: string }[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const colors = useColors();
  const typography = useTypography();

  return (
    <>
      <Text
        style={[
          styles.subLabel,
          typography.semiBold,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {title}
      </Text>

      <View style={styles.optionGrid}>
        {options.map(({ key, label }) => {
          const active = activeKey === key;

          return (
            <Pressable
              key={key}
              onPress={() => onSelect(key)}
              style={[
                styles.chip,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
                active && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryGlow,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  typography.semiBold,
                  {
                    color: active ? colors.primary : colors.textMuted,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  subLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 13,
  },
});