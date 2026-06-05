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

import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import { isValidHexColor } from '@/utils/colorUtils';

interface Props {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PALETTE_GROUPS: { name: string; swatches: string[] }[] = [
  {
    name: 'Neutros',
    swatches: [
      '#000000',
      '#111111',
      '#1A1A1A',
      '#222222',
      '#333333',
      '#444444',
      '#666666',
      '#888888',
      '#AAAAAA',
      '#CCCCCC',
      '#EEEEEE',
      '#FFFFFF',
    ],
  },
  {
    name: 'Amarelos / Laranjas',
    swatches: [
      '#FFD600',
      '#FFC400',
      '#FFB300',
      '#FF8F00',
      '#FF6F00',
      '#FF8800',
      '#FF6D00',
      '#FF3D00',
    ],
  },
  {
    name: 'Vermelhos / Rosas',
    swatches: [
      '#FF1744',
      '#F50057',
      '#E91E63',
      '#AD1457',
      '#880E4F',
      '#B71C1C',
      '#D50000',
      '#FF5252',
    ],
  },
  {
    name: 'Roxos / Azuis escuros',
    swatches: [
      '#AA00FF',
      '#7C4DFF',
      '#651FFF',
      '#6200EA',
      '#4527A0',
      '#1A237E',
      '#283593',
      '#3949AB',
    ],
  },
  {
    name: 'Azuis / Cianos',
    swatches: [
      '#2962FF',
      '#0091EA',
      '#00B0FF',
      '#80D8FF',
      '#00BCD4',
      '#00E5FF',
      '#1DE9B6',
      '#00BFA5',
    ],
  },
  {
    name: 'Verdes',
    swatches: [
      '#00C853',
      '#00E676',
      '#69F0AE',
      '#76FF03',
      '#64DD17',
      '#1B5E20',
      '#2E7D32',
      '#388E3C',
    ],
  },
  {
    name: 'Tons escuros (UI)',
    swatches: [
      '#0A0A0A',
      '#141414',
      '#1E1E1E',
      '#0A0F1E',
      '#141B2D',
      '#0D0A1E',
      '#0A1E0F',
      '#1E0A10',
    ],
  },
];

export const ColorPickerInput = memo(({ label, value, onChange }: Props) => {
  const colors = useColors();
  const typography = useTypography();

  const [showModal, setShowModal] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [showCustom, setShowCustom] = useState(false);
  const [inputError, setInputError] = useState(false);

  function applyHex(text: string) {
    setHexInput(text);

    const normalized = text.startsWith('#') ? text : `#${text}`;

    if (isValidHexColor(normalized)) {
      setInputError(false);
      onChange(normalized);
    } else {
      setInputError(text.length > 1);
    }
  }

  function selectPreset(color: string) {
    setHexInput(color);
    setInputError(false);
    onChange(color);

    if (Platform.OS !== 'web') {
      setShowModal(false);
    }
  }

  const allSwatches = PALETTE_GROUPS.flatMap((group) => group.swatches);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.label,
            typography.semiBold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>

        <View style={styles.webRow}>
          <View
            style={[
              styles.swatch,
              {
                backgroundColor: value,
                borderColor: colors.border,
              },
            ]}
          >
            <input
              type="color"
              value={value}
              onChange={(event) => {
                setHexInput(event.target.value);
                onChange(event.target.value);
              }}
              style={styles.nativeInput as React.CSSProperties}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.webMiniScroll}
          >
            {allSwatches.map((color) => {
              const selected = color.toLowerCase() === value.toLowerCase();

              return (
                <Pressable
                  key={color}
                  onPress={() => selectPreset(color)}
                  style={[
                    styles.miniSwatch,
                    {
                      backgroundColor: color,
                      borderColor: selected
                        ? colors.primary
                        : 'rgba(255,255,255,0.1)',
                    },
                    selected && styles.miniSwatchSelected,
                  ]}
                />
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          typography.semiBold,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>

      <Pressable
        onPress={() => {
          setHexInput(value);
          setShowCustom(false);
          setShowModal(true);
        }}
        style={[
          styles.mobileRow,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: value,
              borderColor: colors.border,
            },
          ]}
        />

        <Text
          style={[
            styles.hexDisplay,
            typography.regular,
            {
              color: colors.text,
            },
          ]}
        >
          {value}
        </Text>

        <Text
          style={[
            styles.chevron,
            {
              color: colors.textMuted,
            },
          ]}
        >
          ›
        </Text>
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            {
              backgroundColor: colors.overlay,
            },
          ]}
        >
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <View
              style={[
                styles.handle,
                {
                  backgroundColor: colors.surfaceLight,
                },
              ]}
            />

            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  typography.bold,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {label}
              </Text>

              <Pressable
                onPress={() => setShowModal(false)}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: colors.surfaceLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    typography.bold,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.previewBar,
                {
                  backgroundColor: value,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.previewText,
                  typography.bold,
                  {
                    color:
                      value.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff',
                  },
                ]}
              >
                {value}
              </Text>
            </View>

            <ScrollView
              style={styles.paletteScroll}
              showsVerticalScrollIndicator={false}
            >
              {PALETTE_GROUPS.map((group) => (
                <View key={group.name} style={styles.group}>
                  <Text
                    style={[
                      styles.groupName,
                      typography.bold,
                      {
                        color: colors.textMuted,
                      },
                    ]}
                  >
                    {group.name}
                  </Text>

                  <View style={styles.swatchGrid}>
                    {group.swatches.map((color) => {
                      const selected =
                        color.toLowerCase() === value.toLowerCase();

                      return (
                        <Pressable
                          key={color}
                          onPress={() => selectPreset(color)}
                          style={[
                            styles.gridSwatch,
                            {
                              backgroundColor: color,
                              borderColor: selected
                                ? colors.primary
                                : 'rgba(255,255,255,0.08)',
                            },
                            selected && styles.gridSwatchSelected,
                          ]}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}

              <Pressable
                onPress={() => setShowCustom((current) => !current)}
                style={styles.customToggle}
              >
                <Text
                  style={[
                    styles.customToggleText,
                    typography.bold,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {showCustom ? '▲ Ocultar código hex' : '✏️ Inserir código hex'}
                </Text>
              </Pressable>

              {showCustom && (
                <View style={styles.customSection}>
                  <View style={styles.hexRow}>
                    <View
                      style={[
                        styles.hexPreview,
                        {
                          backgroundColor: isValidHexColor(hexInput)
                            ? hexInput
                            : colors.surfaceLight,
                          borderColor: colors.border,
                        },
                      ]}
                    />

                    <TextInput
                      value={hexInput}
                      onChangeText={applyHex}
                      placeholder="#FFD600"
                      placeholderTextColor={colors.textMuted}
                      autoCapitalize="characters"
                      style={[
                        styles.hexInput,
                        styles.hexInputFlex,
                        typography.regular,
                        {
                          backgroundColor: colors.surface,
                          borderColor: inputError ? colors.danger : colors.border,
                          color: colors.text,
                        },
                      ]}
                    />
                  </View>

                  {inputError && (
                    <Text
                      style={[
                        styles.errorText,
                        typography.regular,
                        {
                          color: colors.danger,
                        },
                      ]}
                    >
                      Formato inválido. Use #RRGGBB
                    </Text>
                  )}

                  <Pressable
                    onPress={() => {
                      if (isValidHexColor(hexInput)) {
                        onChange(hexInput);
                        setShowModal(false);
                      }
                    }}
                    disabled={!isValidHexColor(hexInput)}
                    style={[
                      styles.applyButton,
                      {
                        backgroundColor: isValidHexColor(hexInput)
                          ? colors.primary
                          : colors.surfaceLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.applyButtonText,
                        typography.bold,
                        {
                          color: colors.primaryText,
                        },
                      ]}
                    >
                      ✓ Aplicar
                    </Text>
                  </Pressable>
                </View>
              )}
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
  container: {
    gap: 8,
  },
  label: {
    fontSize: 13,
  },
  webRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  webMiniScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  miniSwatch: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 1,
  },
  miniSwatchSelected: {
    borderWidth: 2.5,
  },
  nativeInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    border: 'none',
    padding: 0,
  } as object,
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  hexDisplay: {
    fontSize: 15,
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '88%',
    borderTopWidth: 1,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 15,
  },
  previewBar: {
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  previewText: {
    fontSize: 16,
  },
  paletteScroll: {
    flexGrow: 0,
  },
  group: {
    marginBottom: 16,
  },
  groupName: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridSwatch: {
    width: GRID_SWATCH,
    height: GRID_SWATCH,
    borderRadius: 10,
    borderWidth: 1,
  },
  gridSwatchSelected: {
    borderWidth: 3,
  },
  customToggle: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  customToggleText: {
    fontSize: 14,
  },
  customSection: {
    gap: 10,
    paddingBottom: 8,
  },
  hexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hexPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  hexInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  hexInputFlex: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: -4,
  },
  applyButton: {
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
  },
});