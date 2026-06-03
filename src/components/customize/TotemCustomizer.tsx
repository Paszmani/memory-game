import React, { memo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ImagePickerButton } from '@/components/customize/ImagePickerButton';
import { AppButton } from '@/components/ui/AppButton';
import { SaveBar } from '@/components/ui/SaveBar';
import { SectionCard } from '@/components/ui/SectionCard';
import { SliderInput } from '@/components/ui/SliderInput';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useSaveState } from '@/hooks/useSaveState';
import { useTypography } from '@/hooks/useTypography';
import type { TotemSettings } from '@/types/settings';

interface Props {
  value: TotemSettings;
  onSave: (v: TotemSettings) => Promise<void>;
}

export const TotemCustomizer = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);

  const colors = useColors();
  const typography = useTypography();
  const { settings } = useAppSettings();

  const radius = Math.max(12, settings.ui.globalRadius ?? 16);
  const useGlass = settings.ui.useGlassmorphism;

  return (
    <SectionCard title="Totem">
      <ToggleSwitch
        label="Tela de atração"
        value={local.attractScreenEnabled}
        onToggle={(attractScreenEnabled) => update({ attractScreenEnabled })}
      />

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.getFontStyle('semibold'),
            { color: colors.textSecondary },
          ]}
        >
          Mensagem de atração
        </Text>

        <TextInput
          value={local.attractMessage}
          onChangeText={(attractMessage) => update({ attractMessage })}
          placeholder="Toque para jogar!"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            typography.getFontStyle('regular'),
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: useGlass ? colors.glass : colors.surface,
              borderRadius: radius,
            },
          ]}
        />
      </View>

      <SliderInput
        label="Tempo para ativar a atração"
        value={local.attractTimeoutSeconds}
        min={5}
        max={180}
        step={1}
        onChange={(attractTimeoutSeconds) => update({ attractTimeoutSeconds })}
        formatValue={(value) => `${value}s`}
      />

      <SliderInput
        label="Reinício automático após finalizar"
        value={local.autoResetAfterFinishSeconds}
        min={5}
        max={180}
        step={1}
        onChange={(autoResetAfterFinishSeconds) => update({ autoResetAfterFinishSeconds })}
        formatValue={(value) => `${value}s`}
      />

      <View style={styles.field}>
        <Text
          style={[
            styles.label,
            typography.getFontStyle('semibold'),
            { color: colors.textSecondary },
          ]}
        >
          Imagem central da tela de atração
        </Text>

        <ImagePickerButton
          label={local.attractCenterImageUri ? 'Trocar imagem' : 'Selecionar imagem'}
          onImagePicked={(uri) => update({ attractCenterImageUri: uri })}
        />

        {local.attractCenterImageUri ? (
          <View style={styles.inlineAction}>
            <AppButton
              title="Remover imagem"
              variant="ghost"
              size="sm"
              onPress={() => update({ attractCenterImageUri: undefined })}
            />
          </View>
        ) : null}

        {local.attractCenterImageUri ? (
          <Text
            style={[
              styles.helper,
              typography.getFontStyle('regular'),
              { color: colors.primary },
            ]}
          >
            Imagem configurada para a home e para o jogo.
          </Text>
        ) : null}
      </View>

      <ToggleSwitch
        label="Modo quiosque"
        value={local.kioskMode}
        onToggle={(kioskMode) => update({ kioskMode })}
      />

      <ToggleSwitch
        label="Exibir marca"
        value={local.showBranding}
        onToggle={(showBranding) => update({ showBranding })}
      />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

TotemCustomizer.displayName = 'TotemCustomizer';

const styles = StyleSheet.create({
  field: {
    gap: 10,
  },
  label: {
    fontSize: 13,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  helper: {
    fontSize: 12,
  },
  inlineAction: {
    alignItems: 'flex-start',
  },
});
