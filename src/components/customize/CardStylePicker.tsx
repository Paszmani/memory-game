import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { SectionCard } from '@/components/ui/SectionCard';
import { CARD_BORDER_RADIUS } from '@/constants/defaultSettings';
import { colors } from '@/constants/colors';
import { CardShape, CardStyleSettings } from '@/types/settings';

interface Props {
  value:    CardStyleSettings;
  onChange: (updated: Partial<CardStyleSettings>) => void;
}

const CARD_SHAPES: { key: CardShape; label: string }[] = [
  { key: 'sharp',   label: 'Quadrado' },
  { key: 'soft',    label: 'Suave' },
  { key: 'rounded', label: 'Arredondado' },
  { key: 'circle',  label: 'Circular' },
];

const COLOR_FIELDS: { key: keyof CardStyleSettings; label: string }[] = [
  { key: 'backColor',    label: 'Verso' },
  { key: 'frontColor',   label: 'Frente' },
  { key: 'borderColor',  label: 'Borda' },
  { key: 'matchedColor', label: 'Par encontrado' },
  { key: 'textColor',    label: 'Texto' },
];

export const CardStylePicker = memo(({ value, onChange }: Props) => (
  <SectionCard title="Estilo das Cartas">
    {/* Forma */}
    <Text style={styles.subLabel}>Formato</Text>
    <View style={styles.shapeRow}>
      {CARD_SHAPES.map(({ key, label }) => {
        const radius = CARD_BORDER_RADIUS[key];
        const isActive = value.shape === key;

        return (
          <Pressable
            key={key}
            onPress={() => onChange({ shape: key })}
            style={[
              styles.shapeBtn,
              isActive && styles.shapeBtnActive,
            ]}
          >
            <View
              style={[
                styles.shapePreview,
                {
                  borderRadius:    radius,
                  backgroundColor: isActive ? colors.primary : colors.surfaceLight,
                },
              ]}
            />
            <Text style={[
              styles.shapeLabel,
              isActive && styles.shapeLabelActive,
            ]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>

    {/* Cores */}
    <Text style={styles.subLabel}>Cores</Text>
    <View style={styles.colorGrid}>
      {COLOR_FIELDS.map(({ key, label }) => (
        <View key={key} style={styles.colorField}>
          <ColorPickerInput
            label={label}
            value={value[key] as string}
            onChange={(c) => onChange({ [key]: c })}
          />
        </View>
      ))}
    </View>
  </SectionCard>
));

CardStylePicker.displayName = 'CardStylePicker';

const styles = StyleSheet.create({
  subLabel: {
    color:      colors.textSecondary,
    fontSize:   13,
    fontWeight: '600',
  },
  shapeRow: {
    flexDirection: 'row',
    gap:           8,
  },
  shapeBtn: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 12,
    borderRadius:    14,
    borderWidth:     2,
    borderColor:     colors.border,
    backgroundColor: colors.background,
    gap:             8,
  },
  shapeBtnActive: {
    borderColor:     colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  shapePreview: {
    width:  32,
    height: 32,
  },
  shapeLabel: {
    color:     colors.textMuted,
    fontSize:  11,
    fontWeight:'600',
  },
  shapeLabelActive: {
    color: colors.primary,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           12,
  },
  colorField: {
    width: '47%',
  },
});