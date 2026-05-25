import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { SaveBar }          from '@/components/ui/SaveBar';
import { SectionCard }      from '@/components/ui/SectionCard';
import { SliderInput }      from '@/components/ui/SliderInput';
import { ToggleSwitch }     from '@/components/ui/ToggleSwitch';
import { colors }           from '@/constants/colors';
import { useSaveState }     from '@/hooks/useSaveState';
import {
  ButtonStyleType,
  UIFontSize,
  UISettings,
} from '@/types/settings';

interface Props {
  value:  UISettings;
  onSave: (v: UISettings) => Promise<void>;
}

const FONT_SIZES: { key: UIFontSize; label: string }[] = [
  { key: 'small',  label: 'Pequeno' },
  { key: 'medium', label: 'Médio' },
  { key: 'large',  label: 'Grande' },
  { key: 'xlarge', label: 'Extra' },
];

const BUTTON_STYLES: { key: ButtonStyleType; label: string }[] = [
  { key: 'filled',   label: 'Preenchido' },
  { key: 'outlined', label: 'Contorno' },
  { key: 'flat',     label: 'Plano' },
];

const UI_COLORS: { key: keyof UISettings; label: string }[] = [
  { key: 'primaryColor', label: 'Cor principal' },
  { key: 'surfaceColor', label: 'Cor de superfície' },
  { key: 'borderColor',  label: 'Cor de borda' },
  { key: 'textColor',    label: 'Cor de texto' },
];

export const UICustomizer = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);

  return (
    <SectionCard title="🖥️ Interface">
      {/* Cores */}
      <Text style={styles.subLabel}>Cores da Interface</Text>
      <View style={styles.colorGrid}>
        {UI_COLORS.map(({ key, label }) => (
          <View key={key} style={styles.colorCell}>
            <ColorPickerInput
              label={label}
              value={local[key] as string}
              onChange={(c) => update({ [key]: c } as Partial<UISettings>)}
            />
          </View>
        ))}
      </View>

      {/* Tamanho de fonte */}
      <Text style={styles.subLabel}>Tamanho de Texto</Text>
      <View style={styles.row}>
        {FONT_SIZES.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => update({ fontSize: key })}
            style={[styles.chip, local.fontSize === key && styles.chipActive]}
          >
            <Text style={[styles.chipText, local.fontSize === key && styles.chipTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Estilo de botão */}
      <Text style={styles.subLabel}>Estilo de Botões</Text>
      <View style={styles.row}>
        {BUTTON_STYLES.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => update({ buttonStyle: key })}
            style={[styles.chip, local.buttonStyle === key && styles.chipActive]}
          >
            <Text style={[styles.chipText, local.buttonStyle === key && styles.chipTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Raio global */}
      <SliderInput
        label="Arredondamento geral"
        value={local.globalRadius}
        min={0}
        max={32}
        step={2}
        unit="px"
        onChange={(v) => update({ globalRadius: v })}
      />

      {/* Glassmorphism */}
      <ToggleSwitch
        label="Efeito vidro (glassmorphism)"
        hint="Adiciona transparência e desfoque às superfícies"
        value={local.useGlassmorphism}
        onToggle={(v) => update({ useGlassmorphism: v })}
      />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

UICustomizer.displayName = 'UICustomizer';

const styles = StyleSheet.create({
  subLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 4 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCell: { width: '47%' },
  row:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flex:              1,
    minWidth:          80,
    paddingVertical:   9,
    paddingHorizontal: 12,
    borderRadius:      12,
    borderWidth:       1.5,
    borderColor:       colors.border,
    backgroundColor:   colors.background,
    alignItems:        'center',
  },
  chipActive:     { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  chipText:       { color: colors.textMuted,  fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.primary },
});