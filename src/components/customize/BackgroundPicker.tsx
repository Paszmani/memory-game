import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { SectionCard } from '@/components/ui/SectionCard';
import { colors } from '@/constants/colors';
import { BackgroundSettings, BackgroundType, GradientDirection } from '@/types/settings';

interface Props {
  value:    BackgroundSettings;
  onChange: (updated: Partial<BackgroundSettings>) => void;
}

const BACKGROUND_TYPES: { key: BackgroundType; label: string; icon: string }[] = [
  { key: 'solid',    label: 'Sólido',   icon: '🎨' },
  { key: 'gradient', label: 'Gradiente', icon: '🌈' },
  { key: 'image',    label: 'Imagem',   icon: '🖼️' },
];

const GRADIENT_DIRECTIONS: { key: GradientDirection; label: string }[] = [
  { key: 'vertical',   label: 'Vertical' },
  { key: 'horizontal', label: 'Horizontal' },
  { key: 'diagonal',   label: 'Diagonal' },
];

export const BackgroundPicker = memo(({ value, onChange }: Props) => (
  <SectionCard title="Plano de Fundo">
    {/* Seletor de tipo */}
    <View style={styles.typeRow}>
      {BACKGROUND_TYPES.map(({ key, label, icon }) => (
        <Pressable
          key={key}
          onPress={() => onChange({ type: key })}
          style={[styles.typeBtn, value.type === key && styles.typeBtnActive]}
        >
          <Text style={styles.typeIcon}>{icon}</Text>
          <Text style={[styles.typeLabel, value.type === key && styles.typeLabelActive]}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>

    {/* Configurações por tipo */}
    {value.type === 'solid' && (
      <ColorPickerInput
        label="Cor de fundo"
        value={value.solidColor}
        onChange={(c) => onChange({ solidColor: c })}
      />
    )}

    {value.type === 'gradient' && (
      <>
        <View style={styles.row}>
          <View style={styles.flex}>
            <ColorPickerInput
              label="Cor inicial"
              value={value.gradientStart}
              onChange={(c) => onChange({ gradientStart: c })}
            />
          </View>
          <View style={styles.flex}>
            <ColorPickerInput
              label="Cor final"
              value={value.gradientEnd}
              onChange={(c) => onChange({ gradientEnd: c })}
            />
          </View>
        </View>

        <Text style={styles.subLabel}>Direção</Text>
        <View style={styles.directionRow}>
          {GRADIENT_DIRECTIONS.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => onChange({ gradientDirection: key })}
              style={[
                styles.dirBtn,
                value.gradientDirection === key && styles.dirBtnActive,
              ]}
            >
              <Text style={[
                styles.dirLabel,
                value.gradientDirection === key && styles.dirLabelActive,
              ]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </>
    )}

    {value.type === 'image' && (
      <>
        <ImagePickerButton
          label={value.imageUri ? '🖼️ Trocar imagem' : '📁 Selecionar imagem'}
          onImagePicked={(uri) => onChange({ imageUri: uri })}
        />
        {value.imageUri && (
          <Text style={styles.imagePath} numberOfLines={1}>
            ✅ Imagem selecionada
          </Text>
        )}
      </>
    )}
  </SectionCard>
));

BackgroundPicker.displayName = 'BackgroundPicker';

const styles = StyleSheet.create({
  typeRow: {
    flexDirection: 'row',
    gap:           8,
  },
  typeBtn: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 12,
    borderRadius:    14,
    borderWidth:     2,
    borderColor:     colors.border,
    backgroundColor: colors.background,
    gap:             4,
  },
  typeBtnActive: {
    borderColor:     colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  typeIcon: {
    fontSize: 22,
  },
  typeLabel: {
    color:     colors.textMuted,
    fontSize:  12,
    fontWeight:'600',
  },
  typeLabelActive: {
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap:           12,
  },
  flex: {
    flex: 1,
  },
  subLabel: {
    color:      colors.textSecondary,
    fontSize:   13,
    fontWeight: '600',
  },
  directionRow: {
    flexDirection: 'row',
    gap:           8,
  },
  dirBtn: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 10,
    borderRadius:    12,
    borderWidth:     1.5,
    borderColor:     colors.border,
  },
  dirBtnActive: {
    borderColor:     colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  dirLabel: {
    color:     colors.textMuted,
    fontSize:  13,
    fontWeight:'600',
  },
  dirLabelActive: {
    color: colors.primary,
  },
  imagePath: {
    color:    colors.success,
    fontSize: 13,
  },
});