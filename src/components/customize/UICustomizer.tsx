import React, { memo, useEffect } from 'react';

import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { SaveBar } from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { colors } from '@/constants/colors';
import { useSaveState } from '@/hooks/useSaveState';
import {
  ButtonStyleType,
  FontFamilyOption,
  UIFontSize,
  UISettings,
} from '@/types/settings';

interface Props {
  value: UISettings;
  onSave: (v: UISettings) => Promise<void>;
}

const FONT_OPTIONS: { key: FontFamilyOption; label: string; sample: string }[] =
  [
    { key: 'system', label: 'Padrão', sample: 'Aa' },
    { key: 'inter', label: 'Inter', sample: 'Aa' },
    { key: 'poppins', label: 'Poppins', sample: 'Aa' },
    { key: 'nunito', label: 'Nunito', sample: 'Aa' },
    { key: 'roboto', label: 'Roboto', sample: 'Aa' },
    { key: 'montserrat', label: 'Montserrat', sample: 'Aa' },
    { key: 'serif', label: 'Serif', sample: 'Aa' },
    { key: 'mono', label: 'Mono', sample: 'Aa' },
  ];

const GOOGLE_FONTS_URL: Partial<Record<FontFamilyOption, string>> = {
  inter:
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap',
  poppins:
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap',
  nunito:
    'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap',
  roboto:
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
  montserrat:
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap',
};

const WEB_FONT_CSS: Record<FontFamilyOption, string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  inter: '"Inter", system-ui, sans-serif',
  poppins: '"Poppins", system-ui, sans-serif',
  nunito: '"Nunito", system-ui, sans-serif',
  roboto: '"Roboto", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
};

const NATIVE_FONT_FAMILY: Record<FontFamilyOption, string | undefined> = {
  system: undefined,
  inter: 'Inter_400Regular',
  poppins: 'Poppins_400Regular',
  nunito: 'Nunito_400Regular',
  roboto: 'Roboto_400Regular',
  montserrat: 'Montserrat_400Regular',
  serif: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

const FONT_SIZES: { key: UIFontSize; label: string }[] = [
  { key: 'small', label: 'P' },
  { key: 'medium', label: 'M' },
  { key: 'large', label: 'G' },
  { key: 'xlarge', label: 'GG' },
];

const BTN_STYLES: { key: ButtonStyleType; label: string }[] = [
  { key: 'filled', label: 'Preenchido' },
  { key: 'outlined', label: 'Contorno' },
  { key: 'flat', label: 'Plano' },
];

const UI_COLORS: { key: keyof UISettings; label: string }[] = [
  { key: 'primaryColor', label: 'Cor principal' },
  { key: 'surfaceColor', label: 'Cor de superfície' },
  { key: 'borderColor', label: 'Cor de borda' },
  { key: 'textColor', label: 'Cor de texto' },
];

function usePreviewFontsLoader() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    Object.entries(GOOGLE_FONTS_URL).forEach(([fontKey, url]) => {
      if (!url) return;

      const id = `preview-font-${fontKey}`;

      if (document.getElementById(id)) {
        return;
      }

      const link = document.createElement('link');

      link.id = id;
      link.rel = 'stylesheet';
      link.href = url;

      document.head.appendChild(link);
    });
  }, []);
}

function getPreviewFontFamily(font: FontFamilyOption) {
  if (Platform.OS === 'web') {
    return WEB_FONT_CSS[font];
  }

  return NATIVE_FONT_FAMILY[font];
}

export const UICustomizer = memo(({ value, onSave }: Props) => {
  usePreviewFontsLoader();

  const { localValue: local, status, update, save, reset } = useSaveState(
    value,
    onSave,
  );

  return (
    <SectionCard title="Interface">
      <Text style={styles.sub}>Cores da Interface</Text>

      <View style={styles.colorGrid}>
        {UI_COLORS.map(({ key, label }) => (
          <View key={key} style={styles.colorCell}>
            <ColorPickerInput
              label={label}
              value={String(local[key])}
              onChange={(color) =>
                update({ [key]: color } as Partial<UISettings>)
              }
            />
          </View>
        ))}
      </View>

      <Text style={styles.sub}>Família de Fonte</Text>

      <View style={styles.fontGrid}>
        {FONT_OPTIONS.map(({ key, label, sample }) => {
          const isActive = local.fontFamily === key;
          const previewFontFamily = getPreviewFontFamily(key);

          return (
            <Pressable
              key={key}
              onPress={() => update({ fontFamily: key })}
              style={[styles.fontChip, isActive && styles.fontChipActive]}
            >
              <Text
                style={[
                  styles.fontSample,
                  previewFontFamily
                    ? { fontFamily: previewFontFamily }
                    : undefined,
                ]}
              >
                {sample}
              </Text>

              <Text
                style={[
                  styles.fontLabel,
                  isActive && styles.fontLabelActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sub}>Tamanho de Texto</Text>

      <View style={styles.row}>
        {FONT_SIZES.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => update({ fontSize: key })}
            style={[styles.chip, local.fontSize === key && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipTxt,
                local.fontSize === key && styles.chipTxtActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sub}>Estilo de Botões</Text>

      <View style={styles.row}>
        {BTN_STYLES.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => update({ buttonStyle: key })}
            style={[
              styles.chip,
              local.buttonStyle === key && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipTxt,
                local.buttonStyle === key && styles.chipTxtActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SliderInput
        label="Arredondamento global"
        value={local.globalRadius}
        min={0}
        max={32}
        step={1}
        onChange={(globalRadius) => update({ globalRadius })}
      />

      <ToggleSwitch
        label="Usar efeito de vidro"
        value={local.useGlassmorphism}
        onToggle={(useGlassmorphism) => update({ useGlassmorphism })}
      />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

UICustomizer.displayName = 'UICustomizer';

const styles = StyleSheet.create({
  sub: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCell: {
    width: '47%',
  },
  fontGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fontChip: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 4,
  },
  fontChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  fontSample: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 30,
  },
  fontLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
  },
  fontLabelActive: {
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  chipTxt: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTxtActive: {
    color: colors.primary,
  },
});