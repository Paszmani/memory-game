import React, { memo } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { SaveBar } from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { useColors } from '@/hooks/useColors';
import { useSaveState } from '@/hooks/useSaveState';
import { useTypography } from '@/hooks/useTypography';
import type {
  BackgroundSettings,
  BackgroundType,
  GradientDirection,
} from '@/types/settings';

interface Props {
  value: BackgroundSettings;
  onSave: (value: BackgroundSettings) => Promise<void>;
}

const BG_TYPES: { key: BackgroundType; label: string; icon: string }[] = [
  { key: 'solid', label: 'Sólido', icon: '■' },
  { key: 'gradient', label: 'Gradiente', icon: '◩' },
  { key: 'image', label: 'Imagem', icon: '🖼️' },
];

const DIRECTIONS: { key: GradientDirection; label: string; icon: string }[] = [
  { key: 'vertical', label: 'Vertical', icon: '↕' },
  { key: 'horizontal', label: 'Horizontal', icon: '↔' },
  { key: 'diagonal', label: 'Diagonal', icon: '↘' },
];

export const BackgroundPicker = memo(({ value, onSave }: Props) => {
  const colors = useColors();
  const typography = useTypography();

  const { localValue: local, status, update, save, reset } = useSaveState(
    value,
    onSave,
  );

  return (
    <SectionCard title="Fundo">
      <View style={styles.typeRow}>
        {BG_TYPES.map(({ key, label, icon }) => {
          const active = local.type === key;

          return (
            <Pressable
              key={key}
              onPress={() =>
                update({
                  type: key,
                })
              }
              style={[
                styles.typeButton,
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
              <Text style={styles.typeIcon}>{icon}</Text>

              <Text
                style={[
                  styles.typeLabel,
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

      {local.type === 'solid' && (
        <ColorPickerInput
          label="Cor sólida"
          value={local.solidColor}
          onChange={(solidColor) =>
            update({
              solidColor,
            })
          }
        />
      )}

      {local.type === 'gradient' && (
        <>
          <View style={styles.row}>
            <View style={styles.flex}>
              <ColorPickerInput
                label="Início"
                value={local.gradientStart}
                onChange={(gradientStart) =>
                  update({
                    gradientStart,
                  })
                }
              />
            </View>

            <View style={styles.flex}>
              <ColorPickerInput
                label="Fim"
                value={local.gradientEnd}
                onChange={(gradientEnd) =>
                  update({
                    gradientEnd,
                  })
                }
              />
            </View>
          </View>

          <Text
            style={[
              styles.subLabel,
              typography.semiBold,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Direção
          </Text>

          <View style={styles.typeRow}>
            {DIRECTIONS.map(({ key, label, icon }) => {
              const active = local.gradientDirection === key;

              return (
                <Pressable
                  key={key}
                  onPress={() =>
                    update({
                      gradientDirection: key,
                    })
                  }
                  style={[
                    styles.directionButton,
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
                  <Text style={styles.directionIcon}>{icon}</Text>

                  <Text
                    style={[
                      styles.directionLabel,
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
      )}

      {local.type === 'image' && (
        <>
          <ImagePickerButton
            onImagePicked={(imageUri) =>
              update({
                imageUri,
              })
            }
          />

          {!!local.imageUri && (
            <>
              <Text
                style={[
                  styles.imageFeedback,
                  typography.semiBold,
                  {
                    color: colors.success,
                  },
                ]}
              >
                Imagem selecionada
              </Text>

              <SliderInput
                label="Escurecimento"
                min={0}
                max={0.8}
                step={0.05}
                value={local.overlayOpacity}
                onChange={(overlayOpacity) =>
                  update({
                    overlayOpacity,
                  })
                }
                formatValue={(nextValue) => `${Math.round(nextValue * 100)}%`}
              />
            </>
          )}
        </>
      )}

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

BackgroundPicker.displayName = 'BackgroundPicker';

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    gap: 4,
  },
  typeIcon: {
    fontSize: 22,
  },
  typeLabel: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  subLabel: {
    fontSize: 13,
  },
  directionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 2,
  },
  directionIcon: {
    fontSize: 18,
  },
  directionLabel: {
    fontSize: 11,
  },
  imageFeedback: {
    fontSize: 13,
  },
});