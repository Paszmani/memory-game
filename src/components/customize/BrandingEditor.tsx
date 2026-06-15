import React, { memo, useRef } from 'react';

import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { SaveBar } from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { useColors } from '@/hooks/useColors';
import { useResolvedImageUri } from '@/hooks/useResolvedImageUri';
import { useSaveState } from '@/hooks/useSaveState';
import { useTypography } from '@/hooks/useTypography';
import type { BrandingSettings } from '@/types/settings';

interface Props {
  value: BrandingSettings;
  onSave: (value: BrandingSettings) => Promise<void>;
}

const ACCENT_EMOJIS = ['🎮', '⭐', '🧠', '🏆', '✨', '🎯', '🚀', '💡', '🔥', ''];

export const BrandingEditor = memo(({ value, onSave }: Props) => {
  const colors = useColors();
  const typography = useTypography();

  const { localValue: local, status, update, save, reset } = useSaveState(
    value,
    onSave,
  );

  const subtitleRef = useRef<TextInput>(null);
  const finishMessageRef = useRef<TextInput>(null);

  const resolvedLogoUri = useResolvedImageUri(local.logoUri);
  const resolvedFinishIconUri = useResolvedImageUri(local.finishIconImageUri);
  const resolvedFinishBackgroundUri = useResolvedImageUri(
    local.finishBackgroundImageUri,
  );

  return (
    <SectionCard title="Identidade visual">
      <View
        style={[
          styles.preview,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {resolvedLogoUri ? (
          <Image
            source={{ uri: resolvedLogoUri }}
            style={styles.previewLogo}
            contentFit="cover"
            transition={160}
            cachePolicy="memory-disk"
          />
        ) : (
          <Text style={styles.previewEmoji}>{local.accentEmoji}</Text>
        )}

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
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Emoji de destaque
        </Text>

        <View style={styles.emojiRow}>
          {ACCENT_EMOJIS.map((emoji, index) => {
            const active = local.accentEmoji === emoji;

            return (
              <Pressable
                key={`${emoji}-${index}`}
                onPress={() => update({ accentEmoji: emoji })}
              >
                <Text
                  style={[
                    styles.emojiOption,
                    {
                      color: colors.text,
                    },
                    active && {
                      backgroundColor: colors.primaryGlow,
                      color: colors.primary,
                    },
                  ]}
                >
                  {emoji || '—'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Título do jogo
        </Text>

        <TextInput
          value={local.gameTitle}
          onChangeText={(gameTitle) => update({ gameTitle })}
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
            typography.bold,
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
          onChangeText={(gameSubtitle) => update({ gameSubtitle })}
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
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Logo personalizada da tela inicial
        </Text>

        <ImagePickerButton
          label={local.logoUri ? 'Trocar logo' : 'Adicionar logo'}
          mode="logo"
          onImagePicked={(logoUri) => update({ logoUri })}
        />

        {local.logoUri ? (
          <Pressable onPress={() => update({ logoUri: undefined })}>
            <Text
              style={[
                styles.remove,
                {
                  color: colors.danger,
                },
              ]}
            >
              Remover logo
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.separator} />

      <View
        style={[
          styles.preview,
          styles.finishPreview,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {resolvedFinishBackgroundUri ? (
          <>
            <Image
              source={{ uri: resolvedFinishBackgroundUri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={160}
              cachePolicy="memory-disk"
            />

            <View style={styles.finishOverlay} />
          </>
        ) : null}

        {resolvedFinishIconUri ? (
          <View
            style={[
              styles.finishIconWrap,
              {
                backgroundColor: colors.primaryGlow,
                borderColor: colors.primaryBorder,
              },
            ]}
          >
            <Image
              source={{ uri: resolvedFinishIconUri }}
              style={styles.finishIconImage}
              contentFit="contain"
              transition={160}
              cachePolicy="memory-disk"
            />
          </View>
        ) : (
          <Text style={styles.previewEmoji}>{local.finishIcon || '🏆'}</Text>
        )}

        <Text
          style={[
            styles.previewTitle,
            typography.black,
            {
              color: colors.primary,
            },
          ]}
        >
          {local.finishTitle || 'Parabéns!'}
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
          {local.finishMessage || 'Você completou o jogo!'}
        </Text>
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Título do menu final
        </Text>

        <TextInput
          value={local.finishTitle || ''}
          onChangeText={(finishTitle) => update({ finishTitle })}
          placeholder="Parabéns!"
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
          onSubmitEditing={() => finishMessageRef.current?.focus()}
        />
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Mensagem do menu final
        </Text>

        <TextInput
          ref={finishMessageRef}
          value={local.finishMessage || ''}
          onChangeText={(finishMessage) => update({ finishMessage })}
          placeholder="Você completou o jogo!"
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            styles.multilineInput,
            typography.regular,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Ícone principal do menu final
        </Text>

        <TextInput
          value={local.finishIcon || ''}
          onChangeText={(finishIcon) => update({ finishIcon })}
          placeholder="🏆"
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
        />
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Imagem do ícone principal
        </Text>

        <ImagePickerButton
          label={
            local.finishIconImageUri
              ? 'Trocar imagem do ícone'
              : 'Adicionar imagem do ícone'
          }
          mode="finish-icon"
          onImagePicked={(finishIconImageUri) =>
            update({ finishIconImageUri })
          }
        />

        {local.finishIconImageUri ? (
          <Pressable
            onPress={() => update({ finishIconImageUri: undefined })}
          >
            <Text
              style={[
                styles.remove,
                {
                  color: colors.danger,
                },
              ]}
            >
              Remover imagem do ícone
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.bold,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Papel de parede do menu final
        </Text>

        <ImagePickerButton
          label={
            local.finishBackgroundImageUri
              ? 'Trocar papel de parede'
              : 'Adicionar papel de parede'
          }
          mode="background"
          onImagePicked={(finishBackgroundImageUri) =>
            update({ finishBackgroundImageUri })
          }
        />

        {local.finishBackgroundImageUri ? (
          <Pressable
            onPress={() => update({ finishBackgroundImageUri: undefined })}
          >
            <Text
              style={[
                styles.remove,
                {
                  color: colors.danger,
                },
              ]}
            >
              Remover papel de parede
            </Text>
          </Pressable>
        ) : null}
      </View>

      <Text
        style={[
          styles.helper,
          typography.regular,
          {
            color: colors.textMuted,
          },
        ]}
      >
        As cores do menu final seguem as cores globais da interface: cor
        principal, superfície, borda e texto.
      </Text>

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
    overflow: 'hidden',
  },

  finishPreview: {
    minHeight: 230,
    justifyContent: 'center',
  },

  finishOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  previewLogo: {
    width: 74,
    height: 74,
    borderRadius: 20,
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

  finishIconWrap: {
    width: 82,
    height: 82,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  finishIconImage: {
    width: 68,
    height: 68,
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

  multilineInput: {
    minHeight: 96,
    paddingTop: 14,
    paddingBottom: 14,
  },

  remove: {
    fontSize: 13,
    fontWeight: '700',
  },

  helper: {
    fontSize: 12,
    lineHeight: 18,
  },

  separator: {
    height: 1,
    opacity: 0.35,
  },
});