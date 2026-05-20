import React, { memo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { isValidHexColor } from '@/utils/colorUtils';

interface Props {
  label:      string;
  value:      string;
  onChange:   (color: string) => void;
}

export const ColorPickerInput = memo(({ label, value, onChange }: Props) => {
  const [inputValue, setInputValue] = useState(value);

  function handleInputChange(text: string) {
    setInputValue(text);

    const normalized = text.startsWith('#') ? text : `#${text}`;
    if (isValidHexColor(normalized)) {
      onChange(normalized);
    }
  }

  function handleNativeColorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const color = e.target.value;
    setInputValue(color);
    onChange(color);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        {/* Swatch clicável */}
        <View style={[styles.swatch, { backgroundColor: value }]}>
          {Platform.OS === 'web' && (
            <input
              type="color"
              value={value}
              onChange={handleNativeColorChange}
              style={styles.nativeColorInput as React.CSSProperties}
            />
          )}
        </View>

        {/* Input HEX */}
        <TextInput
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder="#000000"
          placeholderTextColor={colors.textMuted}
          maxLength={7}
          autoCapitalize="characters"
          style={styles.input}
        />
      </View>
    </View>
  );
});

ColorPickerInput.displayName = 'ColorPickerInput';

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color:      colors.textSecondary,
    fontSize:   13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  swatch: {
    width:        48,
    height:       48,
    borderRadius: 12,
    borderWidth:  2,
    borderColor:  colors.border,
    overflow:     'hidden',
    position:     'relative',
  },
  nativeColorInput: {
    position: 'absolute',
    width:    '100%',
    height:   '100%',
    opacity:  0,
    cursor:   'pointer',
    border:   'none',
    padding:  0,
  } as object,
  input: {
    flex:             1,
    height:           48,
    backgroundColor:  colors.surface,
    borderRadius:     12,
    borderWidth:      1,
    borderColor:      colors.border,
    paddingHorizontal: 14,
    color:            colors.text,
    fontSize:         15,
    fontFamily:       Platform.OS === 'web' ? 'monospace' : undefined,
  },
});