import React, { memo, useRef } from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { SaveBar } from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { useColors } from '@/hooks/useColors';
import { useSaveState } from '@/hooks/useSaveState';
import { useTypography } from '@/hooks/useTypography';
import type { BrandingSettings } from '@/types/settings';

interface Props {
  value: BrandingSettings;
  onSave: (value: BrandingSettings) => Promise<void>;
}

const ACCENT_EMOJIS = ['🎮', '🧠', '⭐', '🚀', '🎯', '🧩', '✨', '🔥', '💎', '🏆'];

export const BrandingEditor = memo(({ value, onSave }: Props) => {
  const colors = useColors();
  const typography = useTypography();

  const { localValue: local, status, update, save, reset } = useSaveState(
    value,
    onSave,
  );

  const subtitleRef = useRef<TextInput>(null);

  return (
    <SectionCard title="Identidade">
      <View
        style={[
          styles.preview,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={styles.previewEmoji}>{local.accentEmoji}</Text>

        <Text
          style={[
            styles.previewTitle,
            typography.black,
            {
              color: colors.primary,
            },
          ]}
        >
          {local.gameTitle || 'Título do jogo'}
        </Text>

        <Text
          style={[
            styles.previewSubtitle,
            typography.regular,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {local.gameSubtitle || 'Subtítulo'}
        </Text>
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.semiBold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Emoji de destaque
        </Text>

        <View style={styles.emojiRow}>
          {ACCENT_EMOJIS.map((emoji) => {
            const active = local.accentEmoji === emoji;

            return (
              <Text
                key={emoji}
                onPress={() =>
                  update({
                    accentEmoji: emoji,
                  })
                }
                style={[
                  styles.emojiOption,
                  active && {
                    backgroundColor: colors.primaryGlow,
                    color: colors.primary,
                  },
                ]}
              >
                {emoji}
              </Text>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.semiBold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Título do jogo
        </Text>

        <TextInput
          value={local.gameTitle}
          onChangeText={(gameTitle) =>
            update({
              gameTitle,
            })
          }
          placeholder="Jogo da Memória"
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
          onSubmitEditing={() => subtitleRef.current?.focus()}
        />
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.semiBold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Subtítulo
        </Text>

        <TextInput
          ref={subtitleRef}
          value={local.gameSubtitle}
          onChangeText={(gameSubtitle) =>
            update({
              gameSubtitle,
            })
          }
          placeholder="Encontre todos os pares!"
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
          returnKeyType="done"
        />
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.semiBold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Logo personalizada (opcional)
        </Text>

        <ImagePickerButton
          onImagePicked={(logoUri) =>
            update({
              logoUri,
            })
          }
        />

        {!!local.logoUri && (
          <Text
            style={[
              styles.success,
              typography.semiBold,
              {
                color: colors.success,
              },
            ]}
          >
            ✅ Logo configurada
          </Text>
        )}
      </View>

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

BrandingEditor.displayName = 'BrandingEditor';

const styles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    gap: 6,
    borderWidth: 1,
  },
  previewEmoji: {
    fontSize: 44,
  },
  previewTitle: {
    fontSize: 24,
    textAlign: 'center',
  },
  previewSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiOption: {
    fontSize: 28,
    padding: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  success: {
    fontSize: 13,
  },
});