import React, { memo } from 'react';

import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { SaveBar } from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { CARD_BORDER_RADIUS } from '@/constants/defaultSettings';
import { useColors } from '@/hooks/useColors';
import { useSaveState } from '@/hooks/useSaveState';
import { pickCardBackImage } from '@/services/imageService';
import type {
  CardBackPattern,
  CardShape,
  CardSizeOption,
  CardStyleSettings,
} from '@/types/settings';

interface Props {
  value: CardStyleSettings;
  onSave: (value: CardStyleSettings) => Promise<void>;
}

const SHAPES: { key: CardShape; label: string }[] = [
  { key: 'sharp', label: 'Quadrado' },
  { key: 'soft', label: 'Suave' },
  { key: 'rounded', label: 'Redondo' },
  { key: 'circle', label: 'Círculo' },
];

const CARD_SIZES: {
  key: CardSizeOption;
  label: string;
  description: string;
}[] = [
  {
    key: 'small',
    label: 'Pequeno',
    description: 'Mais cartas visíveis na tela.',
  },
  {
    key: 'medium',
    label: 'Médio',
    description: 'Equilíbrio entre tamanho e quantidade.',
  },
  {
    key: 'large',
    label: 'Grande',
    description: 'Imagens maiores e mais destaque.',
  },
];

const BACK_PATTERNS: { key: CardBackPattern; label: string }[] = [
  { key: 'solid', label: 'Sólido' },
  { key: 'image', label: 'Imagem' },
];

const CARD_COLORS: { key: keyof CardStyleSettings; label: string }[] = [
  { key: 'backColor', label: 'Verso' },
  { key: 'frontColor', label: 'Frente' },
  { key: 'borderColor', label: 'Borda' },
  { key: 'matchedColor', label: 'Par encontrado' },
  { key: 'textColor', label: 'Texto' },
  { key: 'backPatternColor', label: 'Padrão do verso' },
];

export const CardStylePicker = memo(({ value, onSave }: Props) => {
  const colors = useColors();

  const { localValue: local, status, update, save, reset } = useSaveState(
    value,
    onSave,
  );

  const radius = CARD_BORDER_RADIUS[local.shape] ?? 16;
  const selectedCardSize = local.cardSize ?? 'medium';

  async function handlePickBackImage() {
    const uri = await pickCardBackImage();

    if (uri) {
      update({
        backImageUri: uri,
        backPattern: 'image',
      });
    }
  }

  return (
    <SectionCard title="Cartas">
      <View style={styles.previewRow}>
        <View
          style={[
            styles.preview,
            {
              borderRadius: radius,
              backgroundColor: local.backColor,
              borderColor: local.borderColor,
              borderWidth: local.borderWidth,
            },
          ]}
        >
          {local.backPattern === 'image' && local.backImageUri ? (
            <Image
              source={{ uri: local.backImageUri }}
              style={styles.fullImage}
              contentFit="cover"
              contentPosition="center"
              cachePolicy="memory-disk"
            />
          ) : (
            <Text
              style={[
                styles.previewSymbol,
                {
                  color: local.backPatternColor,
                },
              ]}
            >
              ?
            </Text>
          )}
        </View>

        <View
          style={[
            styles.preview,
            {
              borderRadius: radius,
              backgroundColor: local.frontColor,
              borderColor: local.borderColor,
              borderWidth: local.borderWidth,
            },
          ]}
        >
          <Text
            style={[
              styles.previewEmoji,
              {
                color: local.textColor,
              },
            ]}
          >
            ⭐
          </Text>
        </View>

        <View
          style={[
            styles.preview,
            {
              borderRadius: radius,
              backgroundColor: local.matchedColor,
              borderColor: local.borderColor,
              borderWidth: local.borderWidth,
              opacity: local.matchedOpacity,
            },
          ]}
        >
          <Text
            style={[
              styles.previewCheck,
              {
                color: colors.success,
              },
            ]}
          >
            ✓
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.previewHint,
          {
            color: colors.textMuted,
          },
        ]}
      >
        Verso · Frente · Par encontrado
      </Text>

      <Text
        style={[
          styles.sub,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Tamanho das cartas
      </Text>

      <View style={styles.sizeGrid}>
        {CARD_SIZES.map(({ key, label, description }) => {
          const active = selectedCardSize === key;

          return (
            <Pressable
              key={key}
              onPress={() =>
                update({
                  cardSize: key,
                })
              }
              style={[
                styles.sizeCard,
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
                  styles.sizeTitle,
                  {
                    color: active ? colors.primary : colors.text,
                  },
                ]}
              >
                {label}
              </Text>

              <Text
                style={[
                  styles.sizeDescription,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={[
          styles.sub,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Formato
      </Text>

      <View style={styles.row}>
        {SHAPES.map(({ key, label }) => {
          const active = local.shape === key;

          return (
            <Pressable
              key={key}
              onPress={() =>
                update({
                  shape: key,
                })
              }
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
                  styles.chipText,
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
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Padrão do verso
      </Text>

      <View style={styles.row}>
        {BACK_PATTERNS.map(({ key, label }) => {
          const active = local.backPattern === key;

          return (
            <Pressable
              key={key}
              onPress={() =>
                update({
                  backPattern: key,
                })
              }
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
                  styles.chipText,
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

      {local.backPattern === 'image' && (
        <View style={styles.imageBackSection}>
          <AppButton
            title={
              local.backImageUri
                ? 'Trocar imagem do verso'
                : 'Selecionar imagem do verso'
            }
            onPress={handlePickBackImage}
            fullWidth
          />

          {!!local.backImageUri && (
            <>
              <Image
                source={{ uri: local.backImageUri }}
                style={[
                  styles.backPreview,
                  {
                    borderColor: colors.border,
                  },
                ]}
                contentFit="cover"
                contentPosition="center"
                cachePolicy="memory-disk"
              />

              <AppButton
                title="Remover imagem do verso"
                onPress={() =>
                  update({
                    backImageUri: undefined,
                    backPattern: 'solid',
                  })
                }
                variant="ghost"
                size="sm"
                fullWidth
              />
            </>
          )}
        </View>
      )}

      <Text
        style={[
          styles.sub,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        Cores
      </Text>

      <View style={styles.colorGrid}>
        {CARD_COLORS.map(({ key, label }) => (
          <View key={String(key)} style={styles.colorCell}>
            <ColorPickerInput
              label={label}
              value={String(local[key])}
              onChange={(color) =>
                update({
                  [key]: color,
                } as Partial<CardStyleSettings>)
              }
            />
          </View>
        ))}
      </View>

      <SliderInput
        label="Espessura da borda"
        value={local.borderWidth}
        min={0}
        max={8}
        step={1}
        onChange={(borderWidth) =>
          update({
            borderWidth,
          })
        }
      />

      <SliderInput
        label="Tamanho do emoji"
        value={local.emojiSizeScale}
        min={0.6}
        max={1.6}
        step={0.05}
        onChange={(emojiSizeScale) =>
          update({
            emojiSizeScale,
          })
        }
        formatValue={(nextValue) => `${Math.round(nextValue * 100)}%`}
      />

      <SliderInput
        label="Opacidade do par encontrado"
        value={local.matchedOpacity}
        min={0.4}
        max={1}
        step={0.05}
        onChange={(matchedOpacity) =>
          update({
            matchedOpacity,
          })
        }
        formatValue={(nextValue) => `${Math.round(nextValue * 100)}%`}
      />

      <ToggleSwitch
        label="Sombra nas cartas"
        value={local.shadowEnabled}
        onToggle={(shadowEnabled) =>
          update({
            shadowEnabled,
          })
        }
      />

      <ToggleSwitch
        label="Brilho ao encontrar par"
        value={local.glowOnMatch}
        onToggle={(glowOnMatch) =>
          update({
            glowOnMatch,
          })
        }
      />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

CardStylePicker.displayName = 'CardStylePicker';

const styles = StyleSheet.create({
  previewRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  preview: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  previewSymbol: {
    fontSize: 24,
    fontWeight: '900',
  },
  previewEmoji: {
    fontSize: 28,
  },
  previewCheck: {
    fontSize: 22,
    fontWeight: '900',
  },
  previewHint: {
    fontSize: 11,
    textAlign: 'center',
  },
  sub: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  sizeGrid: {
    gap: 8,
  },
  sizeCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 3,
  },
  sizeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sizeDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  imageBackSection: {
    gap: 8,
  },
  backPreview: {
    width: '100%',
    height: 80,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCell: {
    width: '47%',
  },
});