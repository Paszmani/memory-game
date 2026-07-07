import React, { memo, useEffect, useRef, useState } from 'react';

import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { DEFAULT_LEAD_FIELDS } from '@/constants/defaultSettings';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import { saveLead, terminalId, type Lead } from '@/services/leadService';
import type { LeadField } from '@/types/settings';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  visible: boolean;
  moves: number;
  elapsedSeconds: number;
  themeId: string;
  themeName: string;
  /** Chamado ao enviar ou pular — libera o modal de fim de jogo. */
  onDone: () => void;
}

/**
 * Formulário de captura de lead exibido ao completar o jogo. Como no Kiosk
 * Maze, o formulário é GERADO a partir dos campos configurados em
 * `totem.leadFields`: cada campo vira um controle conforme seu tipo, com
 * validação leve (obrigatório + formato de e-mail). O resultado da partida
 * entra como metadado (score = jogadas; tempo nos campos).
 */
export const LeadFormModal = memo(
  ({ visible, moves, elapsedSeconds, themeId, themeName, onDone }: Props) => {
    const colors = useColors();
    const typography = useTypography();
    const { settings } = useAppSettings();

    const [values, setValues] = useState<Record<string, string>>({});
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const radius = Math.max(14, settings.ui.globalRadius);

    const configured = settings.totem.leadFields;
    // Campos sem rótulo (recém-criados no editor) não aparecem no formulário.
    const activeFields = (configured?.length ? configured : DEFAULT_LEAD_FIELDS).filter(
      (f) => f.label.trim().length > 0,
    );

    // Estado limpo a cada abertura (o modal é reutilizado entre partidas).
    useEffect(() => {
      if (visible) {
        setValues({});
        setError('');
        setSent(false);
      }
    }, [visible]);

    useEffect(() => {
      return () => {
        if (doneTimer.current) clearTimeout(doneTimer.current);
      };
    }, []);

    function setValue(id: string, value: string) {
      setValues((prev) => ({ ...prev, [id]: value }));
    }

    async function handleSubmit() {
      for (const field of activeFields) {
        const value = (values[field.id] ?? '').trim();

        if (field.required && value.length === 0) {
          setError(`Preencha: ${field.label}`);
          return;
        }

        if (field.type === 'email' && value.length > 0 && !EMAIL_RE.test(value)) {
          setError('E-mail inválido.');
          return;
        }
      }
      setError('');

      const leadFields: Record<string, string> = {};

      for (const field of activeFields) {
        leadFields[field.id] = (values[field.id] ?? '').trim();
      }

      leadFields.tema = themeName;
      leadFields.tempoSegundos = String(elapsedSeconds);

      const lead: Lead = {
        fields: leadFields,
        score: moves,
        terminalId: terminalId(),
        themeId,
        timestamp: new Date().toISOString(),
      };

      try {
        await saveLead(lead);
        setSent(true);
        doneTimer.current = setTimeout(onDone, 1600);
      } catch {
        setError('Não foi possível salvar. Tente novamente.');
      }
    }

    const inputStyle = [
      styles.input,
      typography.regular,
      {
        color: colors.text,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: Math.max(10, settings.ui.globalRadius - 4),
      },
    ];

    function renderField(field: LeadField) {
      const value = values[field.id] ?? '';
      const label = field.label + (field.required ? ' *' : '');

      if (field.type === 'checkbox') {
        return (
          <ToggleSwitch
            key={field.id}
            label={label}
            value={value === 'sim'}
            onToggle={(v) => setValue(field.id, v ? 'sim' : '')}
          />
        );
      }

      if (field.type === 'select') {
        return (
          <View key={field.id} style={styles.selectWrap}>
            <Text style={[styles.selectLabel, typography.regular, { color: colors.textMuted }]}>
              {label}
            </Text>

            <View style={styles.selectOptions}>
              {(field.options ?? []).map((opt) => {
                const active = value === opt;

                return (
                  <Pressable
                    key={opt}
                    onPress={() => setValue(field.id, active ? '' : opt)}
                    style={[
                      styles.selectChip,
                      {
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: colors.border,
                        borderRadius: Math.max(10, settings.ui.globalRadius - 4),
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.semiBold,
                        { color: active ? colors.buttonPrimaryText : colors.text, fontSize: 14 },
                      ]}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      }

      return (
        <TextInput
          key={field.id}
          value={value}
          onChangeText={(t) => setValue(field.id, t)}
          placeholder={label}
          placeholderTextColor={colors.textMuted}
          autoCapitalize={field.type === 'email' ? 'none' : 'words'}
          keyboardType={
            field.type === 'email' ? 'email-address' : field.type === 'tel' ? 'phone-pad' : 'default'
          }
          inputMode={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
          maxLength={field.maxLength ?? 80}
          style={inputStyle}
        />
      );
    }

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                borderRadius: radius,
              },
            ]}
          >
            {sent ? (
              <Text style={[styles.thanks, typography.black, { color: colors.primary }]}>
                Obrigado! 🎉
              </Text>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
                <Text style={[styles.title, typography.black, { color: colors.primary }]}>
                  Cadastre-se!
                </Text>

                <Text style={[styles.subtitle, typography.regular, { color: colors.textSecondary }]}>
                  Deixe seus dados para concluir e concorrer.
                </Text>

                {activeFields.map(renderField)}

                {error ? (
                  <Text style={[styles.error, typography.regular]}>{error}</Text>
                ) : null}

                <View style={styles.actions}>
                  <AppButton title="Enviar" onPress={() => void handleSubmit()} fullWidth />

                  <AppButton
                    title="Agora não"
                    variant="ghost"
                    onPress={onDone}
                    fullWidth
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  },
);

LeadFormModal.displayName = 'LeadFormModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    padding: 24,
    maxHeight: '90%',
  },
  form: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  selectWrap: {
    gap: 6,
  },
  selectLabel: {
    fontSize: 13,
  },
  selectOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },
  error: {
    color: '#F87171',
    fontSize: 14,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  thanks: {
    fontSize: 26,
    textAlign: 'center',
    paddingVertical: 28,
  },
});
