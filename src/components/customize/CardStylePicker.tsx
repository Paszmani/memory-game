import React, { memo } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorPickerInput }  from '@/components/ui/ColorPickerInput';
import { SaveBar }           from '@/components/ui/SaveBar';
import { SectionCard }       from '@/components/ui/SectionCard';
import { SliderInput }       from '@/components/ui/SliderInput';
import { ToggleSwitch }      from '@/components/ui/ToggleSwitch';
import { AppButton }         from '@/components/ui/AppButton';
import { CARD_BORDER_RADIUS } from '@/constants/defaultSettings';
import { colors }            from '@/constants/colors';
import { useSaveState }      from '@/hooks/useSaveState';
import { pickCardBackImage } from '@/services/imageService';
import { CardBackPattern, CardShape, CardStyleSettings } from '@/types/settings';

interface Props {
  value:  CardStyleSettings;
  onSave: (v: CardStyleSettings) => Promise<void>;
}

const SHAPES: { key: CardShape; label: string }[] = [
  { key: 'sharp',   label: 'Quadrado' },
  { key: 'soft',    label: 'Suave'    },
  { key: 'rounded', label: 'Redondo'  },
  { key: 'circle',  label: 'Círculo'  },
];

const BACK_PATTERNS: { key: CardBackPattern; label: string }[] = [
  { key: 'solid', label: 'Sólido' },
  { key: 'image', label: 'Imagem' },
];

const CARD_COLORS: { key: keyof CardStyleSettings; label: string }[] = [
  { key: 'backColor',    label: 'Verso'        },
  { key: 'frontColor',   label: 'Frente'       },
  { key: 'borderColor',  label: 'Borda'        },
  { key: 'matchedColor', label: 'Par encontrado'},
  { key: 'textColor',    label: 'Texto'        },
  { key: 'backPatternColor', label: 'Padrão do verso' },
];

export const CardStylePicker = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);
  const radius = CARD_BORDER_RADIUS[local.shape] ?? 16;

  async function handlePickBackImage() {
    const uri = await pickCardBackImage();
    if (uri) update({ backImageUri: uri, backPattern: 'image' });
  }

  return (
    <SectionCard title="🂠 Estilo das Cartas">
      {/* Preview ao vivo */}
      <View style={styles.previewRow}>
        {/* Verso */}
        <View style={[styles.preview, {
          backgroundColor: local.backColor,
          borderRadius: radius, borderColor: local.borderColor,
          borderWidth: local.borderWidth, overflow: 'hidden',
        }]}>
          {local.backPattern === 'image' && local.backImageUri
            ? <Image source={{ uri: local.backImageUri }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
            : <Text style={styles.previewQ}>?</Text>
          }
        </View>

        {/* Frente */}
        <View style={[styles.preview, {
          backgroundColor: local.frontColor,
          borderRadius: radius, borderColor: local.matchedColor, borderWidth: local.borderWidth,
        }]}>
          <Text style={styles.previewEmoji}>⭐</Text>
        </View>

        {/* Par */}
        <View style={[styles.preview, {
          backgroundColor: `${local.matchedColor}22`,
          borderRadius: radius, borderColor: local.matchedColor, borderWidth: local.borderWidth,
        }]}>
          <Text style={styles.previewCheck}>✓</Text>
        </View>
      </View>
      <Text style={styles.previewHint}>Verso · Frente · Par encontrado</Text>

      {/* Formato */}
      <Text style={styles.sub}>Formato</Text>
      <View style={styles.row}>
        {SHAPES.map(({ key, label }) => (
          <Pressable key={key} onPress={() => update({ shape: key })}
            style={[styles.chip, local.shape === key && styles.chipActive]}>
            <Text style={[styles.chipText, local.shape === key && styles.chipActive2]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Padrão do verso */}
      <Text style={styles.sub}>Padrão do verso</Text>
      <View style={styles.row}>
        {BACK_PATTERNS.map(({ key, label }) => (
          <Pressable key={key} onPress={() => update({ backPattern: key })}
            style={[styles.chip, local.backPattern === key && styles.chipActive]}>
            <Text style={[styles.chipText, local.backPattern === key && styles.chipActive2]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Picker de imagem do verso */}
      {local.backPattern === 'image' && (
        <View style={styles.imgBackSection}>
          {local.backImageUri && (
            <Image source={{ uri: local.backImageUri }} style={styles.backPreview} contentFit="cover" />
          )}
          <AppButton
            title={local.backImageUri ? '↺ Trocar imagem do verso' : '📷 Escolher imagem do verso'}
            onPress={handlePickBackImage}
            variant="secondary"
            fullWidth
          />
          {local.backImageUri && (
            <AppButton
              title="✕ Remover imagem"
              onPress={() => update({ backImageUri: undefined, backPattern: 'solid' })}
              variant="ghost"
              size="sm"
              fullWidth
            />
          )}
        </View>
      )}

      {/* Cores */}
      <Text style={styles.sub}>Cores</Text>
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

      <SliderInput label="Espessura da borda" value={local.borderWidth}
        min={0} max={6} step={1} unit="px" onChange={(v) => update({ borderWidth: v })} />
      <SliderInput label="Tamanho do emoji"    value={local.emojiSizeScale}
        min={0.6} max={1.8} step={0.1} onChange={(v) => update({ emojiSizeScale: v })}
        formatValue={(v) => `${Math.round(v * 100)}%`} />
      <SliderInput label="Opacidade ao combinar" value={local.matchedOpacity}
        min={0.3} max={1.0} step={0.05} onChange={(v) => update({ matchedOpacity: v })}
        formatValue={(v) => `${Math.round(v * 100)}%`} />

      <ToggleSwitch label="Sombra nas cartas"    value={local.shadowEnabled} onToggle={(v) => update({ shadowEnabled: v })} />
      <ToggleSwitch label="Brilho ao encontrar par" value={local.glowOnMatch}    onToggle={(v) => update({ glowOnMatch: v })} />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

CardStylePicker.displayName = 'CardStylePicker';

const styles = StyleSheet.create({
  previewRow:  { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingVertical: 8 },
  preview:     { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  previewQ:    { fontSize: 24, fontWeight: '900', color: colors.textMuted },
  previewEmoji:{ fontSize: 28 },
  previewCheck:{ fontSize: 22, color: colors.success, fontWeight: '700' },
  previewHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  sub:         { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 4 },
  row:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
  chipActive:  { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  chipText:    { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipActive2: { color: colors.primary },
  imgBackSection: { gap: 8 },
  backPreview: { width: '100%', height: 80, borderRadius: 14, overflow: 'hidden' },
  colorGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCell:   { width: '47%' },
});