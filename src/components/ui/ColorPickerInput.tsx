import React, { memo, useState } from 'react';
import {
  Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';

import { colors }          from '@/constants/colors';
import { isValidHexColor } from '@/utils/colorUtils';

interface Props {
  label:    string;
  value:    string;
  onChange: (color: string) => void;
}

// ── Paleta organizada por família ────────────────────────────────────────────
const PALETTE_GROUPS: { name: string; swatches: string[] }[] = [
  {
    name: 'Neutros',
    swatches: ['#000000','#111111','#1A1A1A','#222222','#333333',
               '#444444','#666666','#888888','#AAAAAA','#CCCCCC','#EEEEEE','#FFFFFF'],
  },
  {
    name: 'Amarelos / Laranjas',
    swatches: ['#FFD600','#FFC400','#FFB300','#FF8F00','#FF6F00',
               '#FF8800','#FF6D00','#FF3D00'],
  },
  {
    name: 'Vermelhos / Rosas',
    swatches: ['#FF1744','#F50057','#E91E63','#AD1457','#880E4F',
               '#B71C1C','#D50000','#FF5252'],
  },
  {
    name: 'Roxos / Azuis escuros',
    swatches: ['#AA00FF','#7C4DFF','#651FFF','#6200EA','#4527A0',
               '#1A237E','#283593','#3949AB'],
  },
  {
    name: 'Azuis / Cianos',
    swatches: ['#2962FF','#0091EA','#00B0FF','#80D8FF','#00BCD4',
               '#00E5FF','#1DE9B6','#00BFA5'],
  },
  {
    name: 'Verdes',
    swatches: ['#00C853','#00E676','#69F0AE','#76FF03','#64DD17',
               '#1B5E20','#2E7D32','#388E3C'],
  },
  {
    name: 'Tons escuros (UI)',
    swatches: ['#0A0A0A','#141414','#1E1E1E','#0A0F1E','#141B2D',
               '#0D0A1E','#0A1E0F','#1E0A10'],
  },
];

export const ColorPickerInput = memo(({ label, value, onChange }: Props) => {
  const [showModal,   setShowModal]   = useState(false);
  const [hexInput,    setHexInput]    = useState(value);
  const [showCustom,  setShowCustom]  = useState(false);
  const [inputError,  setInputError]  = useState(false);

  function applyHex(text: string) {
    setHexInput(text);
    const norm = text.startsWith('#') ? text : `#${text}`;
    if (isValidHexColor(norm)) {
      setInputError(false);
      onChange(norm);
    } else {
      setInputError(text.length > 1);
    }
  }

  function selectPreset(c: string) {
    setHexInput(c);
    setInputError(false);
    onChange(c);
    if (Platform.OS !== 'web') setShowModal(false);
  }

  // ── Web: inline ────────────────────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.webRow}>
          {/* Native color picker (web only) */}
          <View style={[styles.swatch, { backgroundColor: value }]}>
            <input
              type="color"
              value={value}
              onChange={(e) => { setHexInput(e.target.value); onChange(e.target.value); }}
              style={styles.nativeInput as React.CSSProperties}
            />
          </View>
          <TextInput
            value={hexInput}
            onChangeText={applyHex}
            placeholder="#FFD600"
            placeholderTextColor={colors.textMuted}
            maxLength={7}
            autoCapitalize="characters"
            style={[styles.hexInput, inputError && styles.hexInputError]}
          />
        </View>

        {/* Mini paleta horizontal */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.webMiniScroll}>
          {PALETTE_GROUPS.flatMap(g => g.swatches).map((c) => (
            <Pressable key={c} onPress={() => selectPreset(c)}
              style={[styles.miniSwatch, { backgroundColor: c },
                c.toLowerCase() === value.toLowerCase() && styles.miniSwatchSelected]}>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Mobile: modal ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={() => { setHexInput(value); setShowCustom(false); setShowModal(true); }}
        style={styles.mobileRow}
      >
        <View style={[styles.swatch, { backgroundColor: value }]} />
        <Text style={styles.hexDisplay}>{value}</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>

            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable onPress={() => setShowModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {/* Preview */}
            <View style={[styles.previewBar, { backgroundColor: value }]}>
              <Text style={[styles.previewText,
                { color: value === '#FFFFFF' || value === '#EEEEEE' ? '#000' : '#FFF' }]}>
                {value}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.paletteScroll}
              keyboardShouldPersistTaps="handled">

              {/* Grupos de cores */}
              {PALETTE_GROUPS.map((group) => (
                <View key={group.name} style={styles.group}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <View style={styles.swatchGrid}>
                    {group.swatches.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => selectPreset(c)}
                        style={[
                          styles.gridSwatch,
                          { backgroundColor: c },
                          c.toLowerCase() === value.toLowerCase() && styles.gridSwatchSelected,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              ))}

              {/* Opção customizada */}
              <Pressable
                onPress={() => setShowCustom((v) => !v)}
                style={styles.customToggle}
              >
                <Text style={styles.customToggleText}>
                  {showCustom ? '▲ Ocultar código hex' : '✏️ Inserir código hex'}
                </Text>
              </Pressable>

              {showCustom && (
                <View style={styles.customSection}>
                  <View style={styles.hexRow}>
                    <View style={[styles.hexPreview, {
                      backgroundColor: isValidHexColor(hexInput) ? hexInput : value,
                    }]} />
                    <TextInput
                      value={hexInput}
                      onChangeText={applyHex}
                      placeholder="#FFD600"
                      placeholderTextColor={colors.textMuted}
                      maxLength={7}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      style={[styles.hexInput, styles.hexInputFlex, inputError && styles.hexInputError]}
                    />
                  </View>
                  {inputError && (
                    <Text style={styles.errorText}>Formato inválido. Use #RRGGBB</Text>
                  )}
                  <Pressable
                    style={[styles.applyBtn, !isValidHexColor(hexInput) && { opacity: 0.5 }]}
                    onPress={() => {
                      if (isValidHexColor(hexInput)) {
                        onChange(hexInput);
                        setShowModal(false);
                      }
                    }}
                    disabled={!isValidHexColor(hexInput)}
                  >
                    <Text style={styles.applyBtnText}>✓ Aplicar</Text>
                  </Pressable>
                </View>
              )}

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
});

ColorPickerInput.displayName = 'ColorPickerInput';

const SWATCH = 44;
const GRID_SWATCH = 40;

const styles = StyleSheet.create({
  container:  { gap: 8 },
  label:      { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },

  // Web
  webRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  webMiniScroll:{ gap: 6, paddingVertical: 4 },
  miniSwatch:   { width: 24, height: 24, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  miniSwatchSelected: { borderWidth: 2.5, borderColor: colors.primary },
  nativeInput:  { position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0 } as object,

  // Mobile trigger
  mobileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, padding: 10,
  },
  hexDisplay: { color: colors.text, fontSize: 15, flex: 1 },
  chevron:    { color: colors.textMuted, fontSize: 20, fontWeight: '300' },

  // Swatch
  swatch: {
    width: SWATCH, height: SWATCH, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    overflow: 'hidden',
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: '88%',
    borderTopWidth: 1, borderColor: colors.glassBorder,
  },
  handle: {
    width: 44, height: 5, borderRadius: 3,
    backgroundColor: colors.surfaceLight,
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle:  { color: colors.text, fontSize: 18, fontWeight: '800' },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },

  previewBar: {
    height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: colors.border,
  },
  previewText: { fontSize: 16, fontWeight: '700' },

  paletteScroll: { flexGrow: 0 },

  group:     { marginBottom: 16 },
  groupName: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridSwatch: { width: GRID_SWATCH, height: GRID_SWATCH, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  gridSwatchSelected: { borderWidth: 3, borderColor: colors.primary },

  customToggle: { paddingVertical: 14, alignItems: 'center' },
  customToggleText: { color: colors.primary, fontSize: 14, fontWeight: '700' },

  customSection: { gap: 10, paddingBottom: 8 },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hexPreview: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  hexInput: {
    height: 48, backgroundColor: colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, color: colors.text, fontSize: 16,
  },
  hexInputFlex:  { flex: 1 },
  hexInputError: { borderColor: colors.danger },
  errorText:     { color: colors.danger, fontSize: 12, marginTop: -4 },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    height: 50, alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { color: colors.background, fontSize: 16, fontWeight: '800' },
});