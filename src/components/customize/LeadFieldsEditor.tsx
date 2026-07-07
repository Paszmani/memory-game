import React, { useState } from 'react';

import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useColors } from '@/hooks/useColors';
import { useTypography } from '@/hooks/useTypography';
import { createId } from '@/utils/id';
import type { LeadField, LeadFieldType } from '@/types/settings';

const TYPE_OPTIONS: { key: LeadFieldType; label: string }[] = [
  { key: 'text', label: 'Texto' },
  { key: 'email', label: 'E-mail' },
  { key: 'tel', label: 'Telefone' },
  { key: 'select', label: 'Escolha' },
  { key: 'checkbox', label: 'Sim/Não' },
];

interface Props {
  fields: LeadField[];
  onChange: (fields: LeadField[]) => void;
}

/** Lista editável dos campos do formulário de lead (rótulo, tipo, obrigatório, opções). */
export function LeadFieldsEditor({ fields, onChange }: Props) {
  function updateField(id: string, partial: Partial<LeadField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...partial } : f)));
  }

  function addField() {
    onChange([
      ...fields,
      { id: createId('campo'), label: '', type: 'text', required: false },
    ]);
  }

  function removeField(id: string) {
    onChange(fields.filter((f) => f.id !== id));
  }

  return (
    <View style={styles.list}>
      {fields.map((field) => (
        <FieldCard
          key={field.id}
          field={field}
          canRemove={fields.length > 1}
          onChange={(partial) => updateField(field.id, partial)}
          onRemove={() => removeField(field.id)}
        />
      ))}

      <AppButton title="+ Adicionar campo" variant="secondary" onPress={addField} fullWidth />
    </View>
  );
}

function FieldCard({
  field,
  canRemove,
  onChange,
  onRemove,
}: {
  field: LeadField;
  canRemove: boolean;
  onChange: (partial: Partial<LeadField>) => void;
  onRemove: () => void;
}) {
  const colors = useColors();
  const typography = useTypography();
  const { settings } = useAppSettings();

  const radius = Math.max(10, settings.ui.globalRadius - 4);

  // Texto local das opções: evita brigar com o cursor ao digitar vírgulas
  // (o valor commitado é o array já normalizado).
  const [optionsText, setOptionsText] = useState((field.options ?? []).join(', '));

  function commitOptions(text: string) {
    setOptionsText(text);
    onChange({
      options: text
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    });
  }

  const inputStyle = [
    styles.input,
    typography.regular,
    {
      color: colors.text,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius,
    },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.primarySurface,
          borderColor: colors.border,
          borderRadius: Math.max(14, settings.ui.globalRadius),
        },
      ]}
    >
      <View style={styles.labelRow}>
        <TextInput
          value={field.label}
          onChangeText={(label) => onChange({ label })}
          placeholder="Rótulo do campo (ex.: Empresa)"
          placeholderTextColor={colors.textMuted}
          maxLength={40}
          style={[inputStyle, styles.labelInput]}
        />

        {canRemove && (
          <Pressable
            onPress={onRemove}
            style={[styles.removeBtn, { borderColor: colors.border, borderRadius: radius }]}
          >
            <Text style={[typography.semiBold, { color: colors.textMuted, fontSize: 16 }]}>✕</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.typeRow}>
        {TYPE_OPTIONS.map((opt) => {
          const active = field.type === opt.key;

          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange({ type: opt.key })}
              style={[
                styles.typeChip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius,
                },
              ]}
            >
              <Text
                style={[
                  typography.semiBold,
                  { color: active ? colors.buttonPrimaryText : colors.text, fontSize: 13 },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {field.type === 'select' && (
        <TextInput
          value={optionsText}
          onChangeText={commitOptions}
          placeholder="Opções separadas por vírgula (ex.: P, M, G)"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
        />
      )}

      <ToggleSwitch
        label="Obrigatório"
        value={field.required}
        onToggle={(required) => onChange({ required })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    fontSize: 15,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  labelInput: {
    flex: 1,
  },
  removeBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
});
