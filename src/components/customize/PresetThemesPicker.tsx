import React, { memo, useState } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SaveBar } from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { PRESET_THEMES } from '@/constants/presetThemes';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import type { AppSettings } from '@/types/settings';

interface Props {
  onApply: (patch: DeepPartial<AppSettings>) => Promise<void>;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const PresetThemesPicker = memo(({ onApply }: Props) => {
  const colors = useColors();
  const typography = useTypography();

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [status, setStatus] = useState<
    'idle' | 'dirty' | 'saving' | 'saved' | 'error'
  >('idle');

  function handleSelect(id: string) {
    setSelectedId(id);
    setStatus('dirty');
  }

  async function handleSave() {
    const preset = PRESET_THEMES.find((theme) => theme.id === selectedId);

    if (!preset) {
      return;
    }

    setStatus('saving');

    try {
      await onApply(preset.patch);
      setStatus('saved');

      setTimeout(() => {
        setStatus('idle');
      }, 2500);
    } catch {
      setStatus('error');
    }
  }

  function handleReset() {
    setSelectedId(null);
    setStatus('idle');
  }

  return (
    <SectionCard title="Temas prontos">
      <Text
        style={[
          styles.hint,
          typography.regular,
          {
            color: colors.textMuted,
          },
        ]}
      >
        Selecione um tema para aplicar cores e estilos de uma vez.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {PRESET_THEMES.map((preset) => {
          const isSelected = selectedId === preset.id;

          return (
            <Pressable
              key={preset.id}
              onPress={() => handleSelect(preset.id)}
              style={[
                styles.card,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
                isSelected && {
                  borderColor: colors.primary,
                  backgroundColor: colors.primaryGlow,
                },
              ]}
            >
              <View
                style={[
                  styles.colorPreview,
                  {
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.colorHalf,
                    {
                      backgroundColor:
                        preset.preview?.[0] ??
                        preset.patch.background?.solidColor ??
                        colors.background,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.colorHalf,
                    {
                      backgroundColor:
                        preset.preview?.[1] ??
                        preset.patch.ui?.primaryColor ??
                        colors.primary,
                    },
                  ]}
                />
              </View>

              <Text style={styles.presetEmoji}>{preset.emoji}</Text>

              <Text
                style={[
                  styles.presetName,
                  typography.semiBold,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                  },
                ]}
              >
                {preset.name}
              </Text>

              {isSelected && (
                <View
                  style={[
                    styles.checkmark,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.check,
                      typography.black,
                      {
                        color: colors.primaryText,
                      },
                    ]}
                  >
                    ✓
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <SaveBar status={status} onSave={handleSave} onReset={handleReset} />
    </SectionCard>
  );
});

PresetThemesPicker.displayName = 'PresetThemesPicker';

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
  },
  scroll: {
    gap: 10,
    paddingBottom: 4,
  },
  card: {
    width: 100,
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
  },
  colorPreview: {
    width: 60,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
  },
  colorHalf: {
    flex: 1,
  },
  presetEmoji: {
    fontSize: 22,
  },
  presetName: {
    fontSize: 11,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 10,
  },
});