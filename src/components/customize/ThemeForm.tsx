import React, { memo, useRef, useState } from 'react';
import {
  Alert, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';

import { CustomCardPreview } from '@/components/customize/CustomCardPreview';
import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { AppButton }         from '@/components/ui/AppButton';
import { SectionCard }       from '@/components/ui/SectionCard';
import { colors }            from '@/constants/colors';
import { CreateThemeInput, CustomTheme, CustomThemeCard } from '@/types/theme';
import { createId }          from '@/utils/id';

interface Props {
  onSubmit:     (input: CreateThemeInput) => Promise<void>;
  initialTheme?: CustomTheme;   // para modo de edição
  onCancel?:    () => void;
}

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Animais', emojis: ['🐱','🐶','🦊','🐼','🦁','🐵','🐸','🐧','🦋','🐳','🦄','🐢','🦉','🐺','🦅','🐊'] },
  { label: 'Comidas', emojis: ['🍕','🍔','🍎','🍓','🌮','🍦','🍩','🎂','🍿','🥑','🍣','🍜','🍉','🥕','🍌','🧁'] },
  { label: 'Objetos', emojis: ['🎮','🎯','🏆','💡','🔮','🎸','🎨','🚀','⚽','🎲','🧩','🎪','📷','🎧','🎻','🎺'] },
  { label: 'Natureza', emojis: ['⭐','🌟','🌈','🌺','🍀','🌻','🌙','☀️','❄️','🌊','🔥','💎','🌸','🍁','⚡','🌴'] },
  { label: 'Símbolos', emojis: ['❤️','💛','💚','💙','💜','🖤','🤍','💯','🔑','🎁','🏅','🌀','♾️','✨','💫','🔔'] },
];

export const ThemeForm = memo(({ onSubmit, initialTheme, onCancel }: Props) => {
  const [name,      setName]     = useState(initialTheme?.name        ?? '');
  const [desc,      setDesc]     = useState(initialTheme?.description ?? '');
  const [cards,     setCards]    = useState<CustomThemeCard[]>(initialTheme?.cards ?? []);
  const [isSaving,  setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const descRef = useRef<TextInput>(null);

  const isEditing = !!initialTheme;

  function addEmojiCard(emoji: string) {
    setCards((prev) => [
      ...prev,
      { id: createId('card'), label: emoji, emoji },
    ]);
  }

  function addImageCard(uri: string) {
    setCards((prev) => [
      ...prev,
      { id: createId('card'), label: `Imagem ${prev.length + 1}`, imageUri: uri },
    ]);
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSave() {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert('Nome inválido', 'O nome deve ter pelo menos 2 caracteres.');
      return;
    }
    if (cards.length < 2) {
      Alert.alert('Cartas insuficientes', 'Adicione pelo menos 2 cartas ao tema.');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: desc.trim() || undefined, cards });
      if (!isEditing) { setName(''); setDesc(''); setCards([]); }
      Alert.alert(isEditing ? '✅ Tema atualizado!' : '✅ Tema criado!', '');
      onCancel?.();
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionCard title={isEditing ? `✏️ Editar: ${initialTheme!.name}` : '➕ Novo tema'}>
      {/* Nome */}
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nome do tema"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="next"
        onSubmitEditing={() => descRef.current?.focus()}
      />
      <TextInput
        ref={descRef}
        value={desc}
        onChangeText={setDesc}
        placeholder="Descrição (opcional)"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="done"
      />

      {/* Adicionar carta */}
      <View style={styles.addSection}>
        <Text style={styles.addLabel}>Adicionar cartas</Text>

        {/* Abas de grupos de emoji */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}>
          {EMOJI_GROUPS.map((g, i) => (
            <Pressable key={g.label} onPress={() => setActiveTab(i)}
              style={[styles.tab, activeTab === i && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                {g.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Grade de emojis */}
        <View style={styles.emojiGrid}>
          {EMOJI_GROUPS[activeTab]?.emojis.map((em) => (
            <Pressable key={em} onPress={() => addEmojiCard(em)} style={styles.emojiBtn}>
              <Text style={styles.emojiItem}>{em}</Text>
            </Pressable>
          ))}
        </View>

        {/* Imagem */}
        <ImagePickerButton label="📷 Adicionar imagem" onImagePicked={addImageCard} />
      </View>

      {/* Preview das cartas */}
      {cards.length > 0 && (
        <>
          <Text style={styles.countLabel}>{cards.length} carta(s)</Text>
          <View style={styles.cardsGrid}>
            {cards.map((c) => (
              <CustomCardPreview key={c.id} card={c} onRemove={() => removeCard(c.id)} />
            ))}
          </View>
        </>
      )}

      {/* Ações */}
      <View style={styles.actions}>
        {onCancel && (
          <AppButton title="Cancelar" onPress={onCancel} variant="ghost"
            size="md" style={styles.actionBtn} />
        )}
        <AppButton
          title={isSaving ? 'Salvando...' : isEditing ? '💾 Atualizar' : '💾 Salvar tema'}
          onPress={handleSave}
          disabled={isSaving || cards.length < 2 || !name.trim()}
          size="md"
          style={styles.actionBtn}
        />
      </View>
    </SectionCard>
  );
});

ThemeForm.displayName = 'ThemeForm';

const styles = StyleSheet.create({
  input: {
    minHeight: 50, backgroundColor: colors.background,
    borderRadius: 14, paddingHorizontal: 16,
    color: colors.text, borderWidth: 1, borderColor: colors.border, fontSize: 15,
  },
  addSection:  { gap: 10 },
  addLabel:    { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabRow:      { gap: 8, paddingVertical: 4 },
  tab: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.border,
  },
  tabActive:     { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  tabText:       { color: colors.textMuted,  fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  emojiBtn:  {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  emojiItem: { fontSize: 26 },
  countLabel:{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions:   { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1 },
});