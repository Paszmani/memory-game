import React, { memo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { CustomCardPreview } from '@/components/customize/CustomCardPreview';
import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { AppButton } from '@/components/ui/AppButton';
import { SectionCard } from '@/components/ui/SectionCard';
import { colors } from '@/constants/colors';
import { CreateThemeInput, CustomThemeCard } from '@/types/theme';
import { createId } from '@/utils/id';

interface Props {
  onSubmit: (input: CreateThemeInput) => Promise<void>;
}

const EMPTY_STATE = { name: '', description: '', emoji: '' };

export const ThemeForm = memo(({ onSubmit }: Props) => {
  const [fields,    setFields]    = useState(EMPTY_STATE);
  const [cards,     setCards]     = useState<CustomThemeCard[]>([]);
  const [isSaving,  setIsSaving]  = useState(false);

  function setField(key: keyof typeof EMPTY_STATE, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function addEmojiCard() {
    const emoji = fields.emoji.trim();
    if (!emoji) {
      Alert.alert('Emoji inválido', 'Digite um emoji antes de adicionar.');
      return;
    }

    const card: CustomThemeCard = {
      id:    createId('card'),
      label: `Emoji ${cards.length + 1}`,
      emoji,
    };

    setCards((prev) => [...prev, card]);
    setField('emoji', '');
  }

  function addImageCard(uri: string) {
    const card: CustomThemeCard = {
      id:       createId('card'),
      label:    `Imagem ${cards.length + 1}`,
      imageUri: uri,
    };
    setCards((prev) => [...prev, card]);
  }

  function removeCard(cardId: string) {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSubmit({
        name:        fields.name,
        description: fields.description || undefined,
        cards,
      });
      setFields(EMPTY_STATE);
      setCards([]);
      Alert.alert('✅ Tema criado', 'Seu tema personalizado foi salvo!');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao salvar o tema.';
      Alert.alert('Erro', msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionCard title="Criar novo tema">
      <TextInput
        value={fields.name}
        onChangeText={(v) => setField('name', v)}
        placeholder="Nome do tema  (ex: Animais)"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <TextInput
        value={fields.description}
        onChangeText={(v) => setField('description', v)}
        placeholder="Descrição (opcional)"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      {/* Adicionar emoji */}
      <View style={styles.row}>
        <TextInput
          value={fields.emoji}
          onChangeText={(v) => setField('emoji', v)}
          placeholder="🐱 Digite um emoji"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.emojiInput]}
        />
        <AppButton title="+" onPress={addEmojiCard} size="md" style={styles.addBtn} />
      </View>

      <ImagePickerButton onImagePicked={addImageCard} />

      {/* Preview das cartas */}
      {cards.length > 0 ? (
        <>
          <Text style={styles.cardsLabel}>{cards.length} carta(s) adicionada(s)</Text>
          <View style={styles.cardsGrid}>
            {cards.map((card) => (
              <CustomCardPreview
                key={card.id}
                card={card}
                onRemove={() => removeCard(card.id)}
              />
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.emptyHint}>Adicione emojis ou imagens acima para criar cartas.</Text>
      )}

      <AppButton
        title={isSaving ? 'Salvando...' : 'Salvar tema'}
        onPress={handleSave}
        disabled={isSaving || cards.length < 2 || !fields.name.trim()}
        fullWidth
        size="lg"
      />
    </SectionCard>
  );
});

ThemeForm.displayName = 'ThemeForm';

const styles = StyleSheet.create({
  input: {
    minHeight:        50,
    backgroundColor:  colors.background,
    borderRadius:     14,
    paddingHorizontal: 16,
    color:            colors.text,
    borderWidth:      1,
    borderColor:      colors.border,
    fontSize:         15,
  },
  row: {
    flexDirection: 'row',
    gap:           10,
    alignItems:    'center',
  },
  emojiInput: {
    flex:     1,
    fontSize: 22,
  },
  addBtn: {
    width:  52,
    height: 52,
  },
  cardsLabel: {
    color:      colors.textSecondary,
    fontSize:   13,
    fontWeight: '600',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
  },
  emptyHint: {
    color:     colors.textMuted,
    fontSize:  14,
    textAlign: 'center',
    paddingVertical: 8,
  },
});