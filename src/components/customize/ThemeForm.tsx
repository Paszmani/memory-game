import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CustomCardPreview } from '@/components/customize/CustomCardPreview';
import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { AppButton } from '@/components/ui/AppButton';
import { colors } from '@/constants/colors';
import { CreateThemeInput, CustomThemeCard } from '@/types/theme';
import { createId } from '@/utils/id';

type ThemeFormProps = {
  onSubmit: (input: CreateThemeInput) => Promise<void>;
};

export function ThemeForm({ onSubmit }: ThemeFormProps) {
  const [themeName, setThemeName] = useState('');
  const [emojiValue, setEmojiValue] = useState('');
  const [cards, setCards] = useState<CustomThemeCard[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  function addEmojiCard() {
    const normalizedEmoji = emojiValue.trim();

    if (!normalizedEmoji) {
      Alert.alert('Emoji inválido', 'Digite um emoji antes de adicionar.');
      return;
    }

    const newCard: CustomThemeCard = {
      id: createId('card'),
      label: `Emoji ${cards.length + 1}`,
      emoji: normalizedEmoji,
    };

    setCards((currentCards) => [...currentCards, newCard]);
    setEmojiValue('');
  }

  function addImageCard(uri: string) {
    const newCard: CustomThemeCard = {
      id: createId('card'),
      label: `Imagem ${cards.length + 1}`,
      imageUri: uri,
    };

    setCards((currentCards) => [...currentCards, newCard]);
  }

  function removeCard(cardId: string) {
    setCards((currentCards) =>
      currentCards.filter((card) => card.id !== cardId),
    );
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      await onSubmit({
        name: themeName,
        cards,
      });

      setThemeName('');
      setEmojiValue('');
      setCards([]);

      Alert.alert('Tema salvo', 'Seu tema personalizado foi criado.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o tema.';

      Alert.alert('Erro ao salvar', message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar tema personalizado</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nome do tema</Text>
        <TextInput
          value={themeName}
          onChangeText={setThemeName}
          placeholder="Ex: Animais, Família, Carros..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Adicionar emoji</Text>
        <View style={styles.inline}>
          <TextInput
            value={emojiValue}
            onChangeText={setEmojiValue}
            placeholder="🐱"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.emojiInput]}
          />
          <AppButton title="Adicionar" onPress={addEmojiCard} />
        </View>
      </View>

      <ImagePickerButton onImagePicked={addImageCard} />

      <View style={styles.cardsContainer}>
        {cards.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma carta adicionada ainda.</Text>
        ) : (
          cards.map((card) => (
            <CustomCardPreview
              key={card.id}
              card={card}
              onRemove={() => removeCard(card.id)}
            />
          ))
        )}
      </View>

      <AppButton
        title={isSaving ? 'Salvando...' : 'Salvar tema'}
        onPress={handleSave}
        disabled={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inline: {
    flexDirection: 'row',
    gap: 10,
  },
  emojiInput: {
    flex: 1,
    fontSize: 24,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emptyText: {
    color: colors.textMuted,
  },
});