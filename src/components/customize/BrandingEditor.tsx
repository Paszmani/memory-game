import React, { memo, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { SaveBar }           from '@/components/ui/SaveBar';
import { SectionCard }       from '@/components/ui/SectionCard';
import { colors }            from '@/constants/colors';
import { useSaveState }      from '@/hooks/useSaveState';
import { BrandingSettings }  from '@/types/settings';

interface Props {
  value:  BrandingSettings;
  onSave: (v: BrandingSettings) => Promise<void>;
}

const ACCENT_EMOJIS = ['🧠', '🃏', '⭐', '🎮', '🎯', '🏆', '🎪', '🌟', '💡', '🔮'];

export const BrandingEditor = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);
  const subtitleRef = useRef<TextInput>(null);

  return (
    <SectionCard title="🏷️ Identidade">
      {/* Preview */}
      <View style={styles.preview}>
        <Text style={styles.previewEmoji}>{local.accentEmoji}</Text>
        <Text style={styles.previewTitle}>{local.gameTitle || 'Título do jogo'}</Text>
        <Text style={styles.previewSubtitle}>{local.gameSubtitle || 'Subtítulo'}</Text>
      </View>

      {/* Emoji de destaque */}
      <Text style={styles.label}>Emoji de destaque</Text>
      <View style={styles.emojiRow}>
        {ACCENT_EMOJIS.map((e) => (
          <Text
            key={e}
            style={[styles.emojiOption, local.accentEmoji === e && styles.emojiSelected]}
            onPress={() => update({ accentEmoji: e })}
          >
            {e}
          </Text>
        ))}
      </View>

      {/* Título */}
      <View style={styles.field}>
        <Text style={styles.label}>Título do jogo</Text>
        <TextInput
          value={local.gameTitle}
          onChangeText={(t) => update({ gameTitle: t })}
          placeholder="Jogo da Memória"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => subtitleRef.current?.focus()}
        />
      </View>

      {/* Subtítulo */}
      <View style={styles.field}>
        <Text style={styles.label}>Subtítulo</Text>
        <TextInput
          ref={subtitleRef}
          value={local.gameSubtitle}
          onChangeText={(t) => update({ gameSubtitle: t })}
          placeholder="Encontre todos os pares!"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="done"
        />
      </View>

      {/* Logo */}
      <View style={styles.field}>
        <Text style={styles.label}>Logo personalizada (opcional)</Text>
        <ImagePickerButton
          label={local.logoUri ? 'Trocar logo' : '📁 Adicionar logo'}
          onImagePicked={(uri) => update({ logoUri: uri })}
        />
        {local.logoUri && <Text style={styles.success}>✅ Logo configurada</Text>}
      </View>

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

BrandingEditor.displayName = 'BrandingEditor';

const styles = StyleSheet.create({
  preview: {
    alignItems:      'center',
    backgroundColor: colors.background,
    borderRadius:    16,
    padding:         20,
    gap:             6,
    borderWidth:     1,
    borderColor:     colors.border,
  },
  previewEmoji:    { fontSize: 44 },
  previewTitle:    { color: colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
  previewSubtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  emojiRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOption:    { fontSize: 28, padding: 6, borderRadius: 10, overflow: 'hidden' },
  emojiSelected:  { backgroundColor: colors.primaryGlow },
  field:      { gap: 8 },
  label:      { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    minHeight:         52,
    backgroundColor:   colors.background,
    borderRadius:      14,
    paddingHorizontal: 16,
    color:             colors.text,
    borderWidth:       1,
    borderColor:       colors.border,
    fontSize:          16,
  },
  success: { color: colors.success, fontSize: 13 },
});