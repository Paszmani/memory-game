import React, { memo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { SectionCard } from '@/components/ui/SectionCard';
import { colors } from '@/constants/colors';
import { BrandingSettings } from '@/types/settings';

interface Props {
  value:    BrandingSettings;
  onChange: (updated: Partial<BrandingSettings>) => void;
}

export const BrandingEditor = memo(({ value, onChange }: Props) => (
  <SectionCard title="Identidade do Jogo">
    <View style={styles.field}>
      <Text style={styles.label}>Título do jogo</Text>
      <TextInput
        value={value.gameTitle}
        onChangeText={(t) => onChange({ gameTitle: t })}
        placeholder="Jogo da Memória"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>

    <View style={styles.field}>
      <Text style={styles.label}>Subtítulo</Text>
      <TextInput
        value={value.gameSubtitle}
        onChangeText={(t) => onChange({ gameSubtitle: t })}
        placeholder="Encontre todos os pares!"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>

    <View style={styles.field}>
      <Text style={styles.label}>Logo (opcional)</Text>
      <ImagePickerButton
        label={value.logoUri ? '🔄 Trocar logo' : '📁 Adicionar logo'}
        onImagePicked={(uri) => onChange({ logoUri: uri })}
      />
      {value.logoUri && (
        <Text style={styles.hint}>✅ Logo configurada</Text>
      )}
    </View>
  </SectionCard>
));

BrandingEditor.displayName = 'BrandingEditor';

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color:      colors.textSecondary,
    fontSize:   13,
    fontWeight: '600',
  },
  input: {
    minHeight:        50,
    backgroundColor:  colors.background,
    borderRadius:     14,
    paddingHorizontal: 16,
    color:            colors.text,
    borderWidth:      1,
    borderColor:      colors.border,
    fontSize:         16,
  },
  hint: {
    color:    colors.success,
    fontSize: 13,
  },
});