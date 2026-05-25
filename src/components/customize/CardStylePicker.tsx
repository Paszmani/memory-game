import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { SaveBar }          from '@/components/ui/SaveBar';
import { SectionCard }      from '@/components/ui/SectionCard';
import { SliderInput }      from '@/components/ui/SliderInput';
import { ToggleSwitch }     from '@/components/ui/ToggleSwitch';
import { CARD_BORDER_RADIUS } from '@/constants/defaultSettings';
import { colors }           from '@/constants/colors';
import { useSaveState }     from '@/hooks/useSaveState';
import {
  CardBackPattern,
  CardShape,
  CardStyleSettings,
} from '@/types/settings';

interface Props {
  value:  CardStyleSettings;
  onSave: (v: CardStyleSettings) => Promise<void>;
}

const SHAPES: { key: CardShape; label: string }[] = [
  { key: 'sharp',   label: '⬛ Quadrado' },
  { key: 'soft',    label: '▪️ Suave' },
  { key: 'rounded', label: '🔲 Redondo' },
  { key: 'circle',  label: '⭕ Círculo' },
];

const BACK_PATTERNS: { key: CardBackPattern; label: string }[] = [
  { key: 'solid', label: 'Sólido' },
  { key: 'dots',  label: 'Pontos' },
  { key: 'grid',  label: 'Grade' },
  { key: 'emoji', label: 'Emoji' },
];

const CARD_COLORS: { key: keyof CardStyleSettings; label: string }[] = [
  { key: 'backColor',    label: 'Verso' },
  { key: 'frontColor',   label: 'Frente' },
  { key: 'borderColor',  label: 'Borda' },
  { key: 'matchedColor', label: 'Par encontrado' },
  { key: 'textColor',    label: 'Texto' },
  { key: 'backPatternColor', label: 'Padrão do verso' },
];

export const CardStylePicker = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);

  const radius = CARD_BORDER_RADIUS[local.shape] ?? 16;

  return (
    <SectionCard title="🃏 Estilo das Cartas">
      {/* Preview ao vivo */}
      <View style={styles.previewRow}>
        <View style={[styles.preview, { backgroundColor: local.backColor, borderRadius: radius, borderColor: local.borderColor, borderWidth: local.borderWidth }]}>
          <Text style={{ fontSize: 28 }}>?</Text>
        </View>
        <View style={[styles.preview, { backgroundColor: local.frontColor, borderRadius: radius, borderColor: local.matchedColor, borderWidth: local.borderWidth }]}>
          <Text style={{ fontSize: 28 }}>⭐</Text>
        </View>
        <View style={[styles.preview, { backgroundColor: `${local.matchedColor}22`, borderRadius: radius, borderColor: local.matchedColor, borderWidth: local.borderWidth }]}>
          <Text style={{ color: colors.success, fontSize: 22 }}>✓</Text>
        </View>
      </View>
      <Text style={styles.previewHint}>Verso · Frente · Par encontrado</Text>

      {/* Formato */}
      <Text style={styles.subLabel}>Formato</Text>
      <View style={styles.shapeRow}>
        {SHAPES.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => update({ shape: key })}
            style={[styles.chip, local.shape === key && styles.chipActive]}
          >
            <Text style={[styles.chipText, local.shape === key && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Padrão do verso */}
      <Text style={styles.subLabel}>Padrão do verso</Text>
      <View style={styles.shapeRow}>
        {BACK_PATTERNS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => update({ backPattern: key })}
            style={[styles.chip, local.backPattern === key && styles.chipActive]}
          >
            <Text style={[styles.chipText, local.backPattern === key && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Cores */}
      <Text style={styles.subLabel}>Cores</Text>
      <View style={styles.colorGrid}>
        {CARD_COLORS.map(({ key, label }) => (
          <View key={key} style={styles.colorCell}>
            <ColorPickerInput
              label={label}
              value={local[key] as string}
              onChange={(c) => update({ [key]: c } as Partial<CardStyleSettings>)}
            />
          </View>
        ))}
      </View>

      {/* Sliders */}
      <SliderInput
        label="Espessura da borda"
        value={local.borderWidth}
        min={0}
        max={6}
        step={1}
        unit="px"
        onChange={(v) => update({ borderWidth: v })}
      />
      <SliderInput
        label="Tamanho do emoji"
        value={local.emojiSizeScale}
        min={0.6}
        max={1.8}
        step={0.1}
        onChange={(v) => update({ emojiSizeScale: v })}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />
      <SliderInput
        label="Opacidade ao combinar par"
        value={local.matchedOpacity}
        min={0.3}
        max={1.0}
        step={0.05}
        onChange={(v) => update({ matchedOpacity: v })}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />

      {/* Toggles */}
      <ToggleSwitch label="Sombra nas cartas" value={local.shadowEnabled} onToggle={(v) => update({ shadowEnabled: v })} />
      <ToggleSwitch label="Brilho ao encontrar par" value={local.glowOnMatch} onToggle={(v) => update({ glowOnMatch: v })} />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

CardStylePicker.displayName = 'CardStylePicker';

const styles = StyleSheet.create({
  previewRow:  { flexDirection: 'row', gap: 12, justifyContent: 'center', paddingVertical: 8 },
  preview:     { width: 70, height: 70, alignItems: 'center', justifyContent: 'center' },
  previewHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  subLabel:    { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 4 },
  shapeRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
  chipActive:     { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  chipText:       { color: colors.textMuted,  fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
  colorGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCell:   { width: '47%' },
});