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
import { useColors } from '@/hooks/useColors';
import { useSaveState } from '@/hooks/useSaveState';
import {
  WEB_FONT_FAMILY,
  getFontStyle as getPreviewFontStyle,
  useTypography,
} from '@/hooks/useTypography';
import type {
  ButtonStyleType,
  FontFamilyOption,
  UISettings,
} from '@/types/settings';

interface Props {
  value: UISettings;
  onSave: (value: UISettings) => Promise<void>;
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

const BUTTON_STYLES: { key: ButtonStyleType; label: string }[] = [
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

    let previewOverride = document.getElementById(
      'font-preview-override',
    ) as HTMLStyleElement | null;

    if (!previewOverride) {
      previewOverride = document.createElement('style');
      previewOverride.id = 'font-preview-override';
      document.head.appendChild(previewOverride);
    }

    previewOverride.textContent = Object.entries(WEB_FONT_FAMILY)
      .map(
        ([key, family]) =>
          `#font-preview-${key}, #font-preview-${key} * { font-family: ${family} !important; }`,
      )
      .join('\n');
  }, []);
}

function getPreviewStyle(font: FontFamilyOption) {
  return getPreviewFontStyle(font, 'regular');
}

export const UICustomizer = memo(({ value, onSave }: Props) => {
  usePreviewFontsLoader();

  const colors = useColors();
  const typography = useTypography();

  const { localValue: local, status, update, save, reset } = useSaveState(
    value,
    onSave,
  );

  return (
    <SectionCard title="Interface">
      <Text
        style={[
          styles.sub,
          typography.semiBold,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Cores da Interface
      </Text>

      <View style={styles.colorGrid}>
        {UI_COLORS.map(({ key, label }) => (
          <View key={key} style={styles.colorCell}>
            <ColorPickerInput
              label={label}
              value={String(local[key])}
              onChange={(color) =>
                update({
                  [key]: color,
                } as Partial<UISettings>)
              }
            />
          </View>
        ))}
      </View>

      <Text
        style={[
          styles.sub,
          typography.semiBold,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Família de Fonte
      </Text>

      <View style={styles.fontGrid}>
        {FONT_OPTIONS.map(({ key, label, sample }) => {
          const active = local.fontFamily === key;

          return (
            <Pressable
              key={key}
              onPress={() =>
                update({
                  fontFamily: key,
                })
              }
              style={[
                styles.fontChip,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  borderRadius: Math.max(12, local.globalRadius * 0.85),
                },
                active && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryGlow,
                },
              ]}
            >
              <Text
                nativeID={`font-preview-${key}`}
                style={[
                  styles.fontSample,
                  getPreviewStyle(key),
                  {
                    color: active ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {sample}
              </Text>

              <Text
                style={[
                  styles.fontLabel,
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

      <Text
        style={[
          styles.sub,
          typography.semiBold,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Estilo de Botões
      </Text>

      <View style={styles.row}>
        {BUTTON_STYLES.map(({ key, label }) => {
          const active = local.buttonStyle === key;

          return (
            <Pressable
              key={key}
              onPress={() =>
                update({
                  buttonStyle: key,
                })
              }
              style={[
                styles.chip,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  borderRadius: Math.max(10, local.globalRadius * 0.75),
                },
                active && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryGlow,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  typography.bold,
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

      <SliderInput
        label="Arredondamento global"
        value={local.globalRadius}
        min={0}
        max={32}
        step={1}
        onChange={(globalRadius) =>
          update({
            globalRadius,
          })
        }
      />

      <ToggleSwitch
        label="Usar efeito de vidro"
        hint="Aplica transparência e bordas suaves nos painéis do app."
        value={local.useGlassmorphism}
        onToggle={(useGlassmorphism) =>
          update({
            useGlassmorphism,
          })
        }
      />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

UICustomizer.displayName = 'UICustomizer';

const styles = StyleSheet.create({
  sub: {
    fontSize: 13,
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
    borderWidth: 1.5,
    gap: 4,
  },
  fontSample: {
    fontSize: 24,
    lineHeight: 30,
  },
  fontLabel: {
    fontSize: 10,
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
    borderWidth: 1.5,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
  },
});