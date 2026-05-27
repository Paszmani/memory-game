import React, { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { SaveBar }          from '@/components/ui/SaveBar';
import { SectionCard }      from '@/components/ui/SectionCard';
import { SliderInput }      from '@/components/ui/SliderInput';
import { ToggleSwitch }     from '@/components/ui/ToggleSwitch';
import { colors }           from '@/constants/colors';
import { useSaveState }     from '@/hooks/useSaveState';
import {
  ButtonStyleType, FontFamilyOption,
  UIFontSize, UISettings,
} from '@/types/settings';

interface Props {
  value:  UISettings;
  onSave: (v: UISettings) => Promise<void>;
}

const FONT_OPTIONS: { key: FontFamilyOption; label: string; sample: string }[] = [
  { key: 'system',     label: 'Padrão',      sample: 'Aa' },
  { key: 'inter',      label: 'Inter',       sample: 'Aa' },
  { key: 'poppins',    label: 'Poppins',     sample: 'Aa' },
  { key: 'nunito',     label: 'Nunito',      sample: 'Aa' },
  { key: 'roboto',     label: 'Roboto',      sample: 'Aa' },
  { key: 'montserrat', label: 'Montserrat',  sample: 'Aa' },
  { key: 'serif',      label: 'Serif',       sample: 'Aa' },
  { key: 'mono',       label: 'Mono',        sample: 'Aa' },
];

// Mapeia nome de fonte para fontFamily (web usa CSS names)
const WEB_FONT_CSS: Record<FontFamilyOption, string> = {
  system:     'system-ui, sans-serif',
  inter:      '"Inter", system-ui, sans-serif',
  poppins:    '"Poppins", system-ui, sans-serif',
  nunito:     '"Nunito", system-ui, sans-serif',
  roboto:     '"Roboto", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  serif:      'Georgia, "Times New Roman", serif',
  mono:       '"Courier New", Courier, monospace',
};

const FONT_SIZES: { key: UIFontSize; label: string }[] = [
  { key: 'small',  label: 'P'  },
  { key: 'medium', label: 'M'  },
  { key: 'large',  label: 'G'  },
  { key: 'xlarge', label: 'GG' },
];

const BTN_STYLES: { key: ButtonStyleType; label: string }[] = [
  { key: 'filled',   label: 'Preenchido' },
  { key: 'outlined', label: 'Contorno'   },
  { key: 'flat',     label: 'Plano'      },
];

const UI_COLORS: { key: keyof UISettings; label: string }[] = [
  { key: 'primaryColor', label: 'Cor principal'    },
  { key: 'surfaceColor', label: 'Cor de superfície' },
  { key: 'borderColor',  label: 'Cor de borda'     },
  { key: 'textColor',    label: 'Cor de texto'     },
];

export const UICustomizer = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);

  const sampleFont = Platform.OS === 'web'
    ? WEB_FONT_CSS[local.fontFamily]
    : undefined;

  return (
    <SectionCard title="🖥️ Interface">
      {/* Cores */}
      <Text style={styles.sub}>Cores da Interface</Text>
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

      {/* Fonte */}
      <Text style={styles.sub}>Família de Fonte</Text>
      <View style={styles.fontGrid}>
        {FONT_OPTIONS.map(({ key, label, sample }) => {
          const isActive  = local.fontFamily === key;
          const fontStyle = Platform.OS === 'web' ? { fontFamily: WEB_FONT_CSS[key] } : {};
          return (
            <Pressable key={key} onPress={() => update({ fontFamily: key })}
              style={[styles.fontChip, isActive && styles.fontChipActive]}>
              <Text style={[styles.fontSample, fontStyle, isActive && { color: colors.primary }]}>
                {sample}
              </Text>
              <Text style={[styles.fontLabel, isActive && { color: colors.primary }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tamanho de texto */}
      <Text style={styles.sub}>Tamanho de Texto</Text>
      <View style={styles.row}>
        {FONT_SIZES.map(({ key, label }) => (
          <Pressable key={key} onPress={() => update({ fontSize: key })}
            style={[styles.chip, local.fontSize === key && styles.chipActive]}>
            <Text style={[styles.chipTxt, local.fontSize === key && { color: colors.primary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Estilo de botão */}
      <Text style={styles.sub}>Estilo de Botões</Text>
      <View style={styles.row}>
        {BTN_STYLES.map(({ key, label }) => (
          <Pressable key={key} onPress={() => update({ buttonStyle: key })}
            style={[styles.chip, local.buttonStyle === key && styles.chipActive]}>
            <Text style={[styles.chipTxt, local.buttonStyle === key && { color: colors.primary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <SliderInput label="Arredondamento geral" value={local.globalRadius}
        min={0} max={32} step={2} unit="px" onChange={(v) => update({ globalRadius: v })} />

      <ToggleSwitch label="Glassmorphism" hint="Superfícies com transparência e desfoque"
        value={local.useGlassmorphism} onToggle={(v) => update({ useGlassmorphism: v })} />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

UICustomizer.displayName = 'UICustomizer';

const styles = StyleSheet.create({
  sub:       { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 4 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCell: { width: '47%' },
  fontGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fontChip: {
    width: '23%', alignItems: 'center', paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background, gap: 4,
  },
  fontChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  fontSample:     { fontSize: 22, fontWeight: '700', color: colors.textSecondary },
  fontLabel:      { fontSize: 10, fontWeight: '600', color: colors.textMuted },
  row:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background, alignItems: 'center',
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  chipTxt:    { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
});