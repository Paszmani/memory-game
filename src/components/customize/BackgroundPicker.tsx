import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorPickerInput }  from '@/components/ui/ColorPickerInput';
import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { SaveBar }           from '@/components/ui/SaveBar';
import { SectionCard }       from '@/components/ui/SectionCard';
import { SliderInput }       from '@/components/ui/SliderInput';
import { colors }            from '@/constants/colors';
import { useSaveState }      from '@/hooks/useSaveState';
import { BackgroundSettings, BackgroundType, GradientDirection } from '@/types/settings';

interface Props {
  value:  BackgroundSettings;
  onSave: (v: BackgroundSettings) => Promise<void>;
}

const BG_TYPES: { key: BackgroundType; label: string; icon: string }[] = [
  { key: 'solid',    label: 'Sólido',    icon: '🎨' },
  { key: 'gradient', label: 'Gradiente', icon: '🌈' },
  { key: 'image',    label: 'Imagem',    icon: '🖼️' },
];

const DIRECTIONS: { key: GradientDirection; label: string; icon: string }[] = [
  { key: 'vertical',   label: 'Vertical',   icon: '↕' },
  { key: 'horizontal', label: 'Horizontal', icon: '↔' },
  { key: 'diagonal',   label: 'Diagonal',   icon: '↘' },
];

export const BackgroundPicker = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);

  return (
    <SectionCard title="🖼️ Plano de Fundo">
      {/* Tipo */}
      <View style={styles.typeRow}>
        {BG_TYPES.map(({ key, label, icon }) => (
          <Pressable
            key={key}
            onPress={() => update({ type: key })}
            style={[styles.typeBtn, local.type === key && styles.typeBtnActive]}
          >
            <Text style={styles.typeIcon}>{icon}</Text>
            <Text style={[styles.typeLabel, local.type === key && styles.typeLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sólido */}
      {local.type === 'solid' && (
        <ColorPickerInput
          label="Cor de fundo"
          value={local.solidColor}
          onChange={(c) => update({ solidColor: c })}
        />
      )}

      {/* Gradiente */}
      {local.type === 'gradient' && (
        <>
          <View style={styles.row}>
            <View style={styles.flex}>
              <ColorPickerInput
                label="Cor inicial"
                value={local.gradientStart}
                onChange={(c) => update({ gradientStart: c })}
              />
            </View>
            <View style={styles.flex}>
              <ColorPickerInput
                label="Cor final"
                value={local.gradientEnd}
                onChange={(c) => update({ gradientEnd: c })}
              />
            </View>
          </View>

          <Text style={styles.subLabel}>Direção</Text>
          <View style={styles.row}>
            {DIRECTIONS.map(({ key, label, icon }) => (
              <Pressable
                key={key}
                onPress={() => update({ gradientDirection: key })}
                style={[styles.dirBtn, local.gradientDirection === key && styles.dirBtnActive]}
              >
                <Text style={styles.dirIcon}>{icon}</Text>
                <Text style={[styles.dirLabel, local.gradientDirection === key && styles.dirLabelActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Imagem */}
      {local.type === 'image' && (
        <>
          <ImagePickerButton
            label={local.imageUri ? '🔄 Trocar imagem' : '📁 Selecionar imagem'}
            onImagePicked={(uri) => update({ imageUri: uri })}
          />
          {local.imageUri && (
            <>
              <Text style={styles.imageFeedback}>✅ Imagem selecionada</Text>
              <SliderInput
                label="Opacidade da sobreposição"
                value={local.overlayOpacity}
                min={0}
                max={0.9}
                step={0.05}
                onChange={(v) => update({ overlayOpacity: v })}
                formatValue={(v) => `${Math.round(v * 100)}%`}
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
  typeRow:  { flexDirection: 'row', gap: 8 },
  typeBtn:  { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, gap: 4 },
  typeBtnActive:   { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  typeIcon:        { fontSize: 22 },
  typeLabel:       { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  typeLabelActive: { color: colors.primary },
  row:    { flexDirection: 'row', gap: 12 },
  flex:   { flex: 1 },
  subLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  dirBtn:   { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, gap: 2 },
  dirBtnActive:   { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  dirIcon:        { fontSize: 18 },
  dirLabel:       { color: colors.textMuted,  fontSize: 11, fontWeight: '600' },
  dirLabelActive: { color: colors.primary },
  imageFeedback:  { color: colors.success, fontSize: 13 },
});