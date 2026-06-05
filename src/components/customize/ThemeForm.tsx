import React, { memo, useRef, useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CustomCardPreview } from '@/components/customize/CustomCardPreview';
import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { AppButton } from '@/components/ui/AppButton';
import { SectionCard } from '@/components/ui/SectionCard';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import type {
  CreateThemeInput,
  CustomTheme,
  CustomThemeCard,
} from '@/types/theme';
import { createId } from '@/utils/id';

interface Props {
  onSubmit: (input: CreateThemeInput) => Promise<void>;
  initialTheme?: CustomTheme;
  onCancel?: () => void;
}

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Animais',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵', '🦁', '🐯'],
  },
  {
    label: 'Comidas',
    emojis: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍕', '🍔', '🍟', '🍩', '🍪'],
  },
  {
    label: 'Objetos',
    emojis: ['⚽', '🏀', '🎲', '🎮', '🎧', '📷', '💡', '📚', '✏️', '🎁', '🔑', '💎'],
  },
  {
    label: 'Natureza',
    emojis: ['⭐', '🌙', '☀️', '🌈', '🔥', '❄️', '🌊', '🌳', '🌻', '🌎', '⚡', '☁️'],
  },
  {
    label: 'Símbolos',
    emojis: ['❤️', '💙', '💚', '💛', '💜', '✨', '✅', '🔔', '♾️', '🎵', '🔴', '🟡'],
  },
];

export const ThemeForm = memo(({ onSubmit, initialTheme, onCancel }: Props) => {
  const colors = useColors();
  const typography = useTypography();

  const [name, setName] = useState(initialTheme?.name ?? '');
  const [desc, setDesc] = useState(initialTheme?.description ?? '');
  const [cards, setCards] = useState<CustomThemeCard[]>(
    initialTheme?.cards ?? [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const descRef = useRef<TextInput>(null);

  const isEditing = !!initialTheme;

  function addEmojiCard(emoji: string) {
    const safeEmoji = emoji.trim();

    if (!safeEmoji) {
      return;
    }

    setCards((prev) => [
      ...prev,
      {
        id: createId('card'),
        label: safeEmoji,
        emoji: safeEmoji,
      },
    ]);
  }

  function addImageCard(uri: string) {
    setCards((prev) => [
      ...prev,
      {
        id: createId('card'),
        label: `Imagem ${prev.length + 1}`,
        imageUri: uri,
      },
    ]);
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedDescription = desc.trim();

    if (trimmedName.length < 2) {
      Alert.alert('Nome inválido', 'O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    const validCards = cards.filter((card) => card.emoji || card.imageUri);

    if (validCards.length < 2) {
      Alert.alert(
        'Cartas insuficientes',
        'Adicione pelo menos 2 cartas ao tema.',
      );
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription || undefined,
        cards: validCards,
      });

      if (!isEditing) {
        setName('');
        setDesc('');
        setCards([]);
      }

      Alert.alert(
        isEditing ? '✅ Tema atualizado!' : '✅ Tema criado!',
        'As cartas foram salvas com sucesso.',
      );

      onCancel?.();
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Falha ao salvar.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  const canSave =
    !isSaving &&
    name.trim().length >= 2 &&
    cards.filter((card) => card.emoji || card.imageUri).length >= 2;

  return (
    <SectionCard title={isEditing ? 'Editar tema' : 'Novo tema'}>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nome do tema"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          typography.regular,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        returnKeyType="next"
        onSubmitEditing={() => descRef.current?.focus()}
      />

      <TextInput
        ref={descRef}
        value={desc}
        onChangeText={setDesc}
        placeholder="Descrição opcional"
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          styles.textArea,
          typography.regular,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        multiline
      />

      <View style={styles.addSection}>
        <Text
          style={[
            styles.addLabel,
            typography.semiBold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Adicionar cartas
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {EMOJI_GROUPS.map((group, index) => {
            const active = activeTab === index;

            return (
              <Pressable
                key={group.label}
                onPress={() => setActiveTab(index)}
                style={[
                  styles.tab,
                  {
                    borderColor: colors.border,
                  },
                  active && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primaryGlow,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    typography.semiBold,
                    {
                      color: active ? colors.primary : colors.textMuted,
                    },
                  ]}
                >
                  {group.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.emojiGrid}>
          {EMOJI_GROUPS[activeTab]?.emojis.map((emoji) => (
            <Pressable
              key={`${emoji}-${activeTab}`}
              onPress={() => addEmojiCard(emoji)}
              style={[
                styles.emojiButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.emojiItem}>{emoji}</Text>
            </Pressable>
          ))}
        </View>

        <ImagePickerButton
          label="📷 Adicionar imagem"
          onImagePicked={addImageCard}
        />
      </View>

      {cards.length > 0 && (
        <View style={styles.previewSection}>
          <Text
            style={[
              styles.countLabel,
              typography.semiBold,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {cards.length} carta(s)
          </Text>

          <View style={styles.cardsGrid}>
            {cards.map((card) => (
              <CustomCardPreview
                key={card.id}
                card={card}
                onRemove={() => removeCard(card.id)}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {onCancel && (
          <AppButton
            title="Cancelar"
            onPress={onCancel}
            variant="ghost"
            size="md"
            style={styles.actionButton}
          />
        )}

        <AppButton
          title={
            isSaving
              ? 'Salvando...'
              : isEditing
                ? '💾 Atualizar'
                : '💾 Salvar tema'
          }
          onPress={handleSave}
          disabled={!canSave}
          size="md"
          style={styles.actionButton}
        />
      </View>
    </SectionCard>
  );
});

ThemeForm.displayName = 'ThemeForm';

const styles = StyleSheet.create({
  input: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    minHeight: 76,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  addSection: {
    gap: 10,
  },
  addLabel: {
    fontSize: 13,
  },
  tabRow: {
    gap: 8,
    paddingVertical: 4,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  tabText: {
    fontSize: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emojiItem: {
    fontSize: 26,
  },
  previewSection: {
    gap: 10,
  },
  countLabel: {
    fontSize: 13,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
});