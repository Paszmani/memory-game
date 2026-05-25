import React, { memo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors }         from '@/constants/colors';
import { isValidHexColor } from '@/utils/colorUtils';

interface Props {
  label:    string;
  value:    string;
  onChange: (color: string) => void;
}

// Paleta de ~40 cores cobrindo o espectro + tons da identidade do app
const PALETTE: string[] = [
  // Pretos e cinzas
  '#000000', '#111111', '#1A1A1A', '#222222', '#333333',
  '#555555', '#777777', '#999999', '#BBBBBB', '#DDDDDD', '#FFFFFF',
  // Amarelos / Laranjas
  '#FFD600', '#FFC000', '#FFB300', '#FF8F00', '#FF6F00',
  '#FF8800', '#FF5722', '#FF4400',
  // Vermelhos
  '#FF1744', '#F50057', '#D50000',
  // Roxos / Azuis
  '#AA00FF', '#6200EA', '#304FFE', '#2962FF', '#0091EA',
  // Azuis claros / Ciano
  '#00B0FF', '#00E5FF', '#1DE9B6', '#00BFA5',
  // Verdes
  '#00E676', '#76FF03', '#64DD17', '#00C853',
  // Escuros temáticos
  '#0A0F1E', '#0A0A0A', '#141414', '#1A1A0A',
];

export const ColorPickerInput = memo(({ label, value, onChange }: Props) => {
  const [showModal, setShowModal]   = useState(false);
  const [hexInput,  setHexInput]    = useState(value);
  const [inputError, setInputError] = useState(false);

  function handleHexChange(text: string) {
    setHexInput(text);
    const norm = text.startsWith('#') ? text : `#${text}`;
    if (isValidHexColor(norm)) {
      setInputError(false);
      onChange(norm);
    } else {
      setInputError(text.length > 0);
    }
  }

  function handlePresetSelect(color: string) {
    setHexInput(color);
    setInputError(false);
    onChange(color);
  }

  function handleNativeColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const c = e.target.value;
    setHexInput(c);
    onChange(c);
  }

  // Web: inline com native picker
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.webRow}>
          <View style={[styles.swatch, { backgroundColor: value }]}>
            <input
              type="color"
              value={value}
              onChange={handleNativeColorChange}
              style={styles.nativeInput as React.CSSProperties}
            />
          </View>
          <TextInput
            value={hexInput}
            onChangeText={handleHexChange}
            placeholder="#000000"
            placeholderTextColor={colors.textMuted}
            maxLength={7}
            autoCapitalize="characters"
            style={[styles.hexInput, inputError && styles.hexInputError]}
          />
        </View>
        {/* Mini paleta na web também */}
        <View style={styles.miniPalette}>
          {PALETTE.slice(0, 20).map((c) => (
            <Pressable
              key={c}
              onPress={() => handlePresetSelect(c)}
              style={[
                styles.miniSwatch,
                { backgroundColor: c },
                c === value && styles.miniSwatchSelected,
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  // Mobile: swatch abre modal
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={() => { setHexInput(value); setShowModal(true); }}
        style={styles.mobileRow}
      >
        <View style={[styles.swatch, { backgroundColor: value }]}>
          <Text style={styles.swatchIcon}>✎</Text>
        </View>
        <Text style={styles.hexDisplay}>{value}</Text>
        <Text style={styles.editHint}>Toque para editar</Text>
      </Pressable>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable onPress={() => setShowModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {/* Preview da cor atual */}
            <View style={[styles.modalPreview, { backgroundColor: value }]}>
              <Text style={[styles.modalPreviewText, { color: value === '#FFFFFF' ? '#000' : '#FFF' }]}>
                {value}
              </Text>
            </View>

            {/* Paleta */}
            <Text style={styles.paletteLabel}>Paleta</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.paletteScroll}>
              <View style={styles.palette}>
                {PALETTE.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => handlePresetSelect(c)}
                    style={[
                      styles.paletteItem,
                      { backgroundColor: c },
                      c === value && styles.paletteItemSelected,
                    ]}
                  />
                ))}
              </View>
            </ScrollView>

            {/* Input hex manual */}
            <Text style={styles.paletteLabel}>Código Hexadecimal</Text>
            <View style={styles.hexRow}>
              <View style={[styles.hexPreviewSmall, { backgroundColor: isValidHexColor(hexInput) ? hexInput : value }]} />
              <TextInput
                value={hexInput}
                onChangeText={handleHexChange}
                placeholder="#FFD600"
                placeholderTextColor={colors.textMuted}
                maxLength={7}
                autoCapitalize="characters"
                autoCorrect={false}
                style={[styles.hexInput, styles.hexInputModal, inputError && styles.hexInputError]}
              />
            </View>
            {inputError && <Text style={styles.errorText}>Código inválido (ex: #FFD600)</Text>}

            <Pressable
              style={styles.confirmBtn}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.confirmBtnText}>✓ Confirmar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
});

ColorPickerInput.displayName = 'ColorPickerInput';

const SWATCH_SIZE  = 48;
const PALETTE_ITEM = 36;

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },

  // Web
  webRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniPalette: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  miniSwatch: { width: 22, height: 22, borderRadius: 4 },
  miniSwatchSelected: { borderWidth: 2, borderColor: colors.primary },

  // Mobile trigger
  mobileRow: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surface,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     colors.border,
    padding:         10,
    gap:             12,
  },
  hexDisplay: { color: colors.text, fontSize: 15, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined, flex: 1 },
  editHint:   { color: colors.textMuted, fontSize: 11 },
  swatchIcon: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },

  // Swatch compartilhado
  swatch: {
    width:        SWATCH_SIZE,
    height:       SWATCH_SIZE,
    borderRadius: 12,
    borderWidth:  2,
    borderColor:  colors.border,
    overflow:     'hidden',
    alignItems:   'center',
    justifyContent: 'center',
  },
  nativeInput: {
    position: 'absolute', width: '100%', height: '100%',
    opacity: 0, cursor: 'pointer', border: 'none', padding: 0,
  } as object,

  // Modal
  modalOverlay: {
    flex:            1,
    backgroundColor: colors.overlay,
    justifyContent:  'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    padding:         24,
    gap:             16,
    maxHeight:       '80%',
    borderWidth:     1,
    borderColor:     colors.border,
  },
  modalHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  modalTitle:  { color: colors.text, fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: colors.surfaceLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  closeBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: '700' },

  modalPreview: {
    height:         64,
    borderRadius:   16,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1,
    borderColor:    colors.border,
  },
  modalPreviewText: { fontSize: 16, fontWeight: '700', fontFamily: 'monospace' },

  paletteLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  paletteScroll: { maxHeight: 200 },
  palette: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
  },
  paletteItem: {
    width:        PALETTE_ITEM,
    height:       PALETTE_ITEM,
    borderRadius: 8,
    borderWidth:  1,
    borderColor:  'rgba(255,255,255,0.1)',
  },
  paletteItemSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },

  // Hex input
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hexPreviewSmall: {
    width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
  },
  hexInput: {
    height:            48,
    backgroundColor:   colors.surface,
    borderRadius:      12,
    borderWidth:       1,
    borderColor:       colors.border,
    paddingHorizontal: 14,
    color:             colors.text,
    fontSize:          16,
    fontFamily:        Platform.OS === 'web' ? 'monospace' : undefined,
    minWidth:          120,
  },
  hexInputModal:  { flex: 1 },
  hexInputError:  { borderColor: colors.danger },
  errorText:      { color: colors.danger, fontSize: 12 },

  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius:    16,
    height:          52,
    alignItems:      'center',
    justifyContent:  'center',
  },
  confirmBtnText: { color: colors.background, fontSize: 16, fontWeight: '800' },
});