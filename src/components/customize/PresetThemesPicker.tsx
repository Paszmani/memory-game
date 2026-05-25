import React, { memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SaveBar }        from '@/components/ui/SaveBar';
import { SectionCard }    from '@/components/ui/SectionCard';
import { colors }         from '@/constants/colors';
import { PRESET_THEMES }  from '@/constants/presetThemes';
import { AppSettings }    from '@/types/settings';

interface Props {
  onApply: (patch: DeepPartial<AppSettings>) => Promise<void>;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export const PresetThemesPicker = memo(({ onApply }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status,     setStatus]     = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle');

  function handleSelect(id: string) {
    setSelectedId(id);
    setStatus('dirty');
  }

  async function handleSave() {
    const preset = PRESET_THEMES.find((p) => p.id === selectedId);
    if (!preset) return;

    setStatus('saving');
    try {
      await onApply(preset.patch);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  }

  return (
    <SectionCard title="🎨 Temas Prontos">
      <Text style={styles.hint}>
        Selecione um tema para aplicar cores e estilos de uma vez.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {PRESET_THEMES.map((preset) => {
          const isSelected = selectedId === preset.id;

          return (
            <Pressable
              key={preset.id}
              onPress={() => handleSelect(preset.id)}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              {/* Mini preview de cores */}
              <View style={styles.colorPreview}>
                <View style={[styles.colorHalf, { backgroundColor: preset.preview[0] }]} />
                <View style={[styles.colorHalf, { backgroundColor: preset.preview[1] }]} />
              </View>

              <Text style={styles.presetEmoji}>{preset.emoji}</Text>
              <Text style={[styles.presetName, isSelected && styles.presetNameSelected]}>
                {preset.name}
              </Text>

              {isSelected && <View style={styles.checkmark}><Text style={styles.check}>✓</Text></View>}
            </Pressable>
          );
        })}
      </ScrollView>

      <SaveBar status={status} onSave={handleSave} onReset={() => { setSelectedId(null); setStatus('idle'); }} />
    </SectionCard>
  );
});

PresetThemesPicker.displayName = 'PresetThemesPicker';

const styles = StyleSheet.create({
  hint: {
    color:    colors.textMuted,
    fontSize: 13,
  },
  scroll: {
    gap:           10,
    paddingBottom: 4,
  },
  card: {
    width:           100,
    alignItems:      'center',
    gap:             6,
    padding:         10,
    borderRadius:    16,
    borderWidth:     2,
    borderColor:     colors.border,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderColor:     colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  colorPreview: {
    width:        60,
    height:       36,
    borderRadius: 10,
    overflow:     'hidden',
    flexDirection:'row',
    borderWidth:  1,
    borderColor:  colors.border,
  },
  colorHalf: {
    flex: 1,
  },
  presetEmoji:       { fontSize: 22 },
  presetName: {
    color:     colors.textSecondary,
    fontSize:  11,
    fontWeight:'600',
    textAlign: 'center',
  },
  presetNameSelected: { color: colors.primary },
  checkmark: {
    position:        'absolute',
    top:             6,
    right:           6,
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: colors.primary,
    alignItems:      'center',
    justifyContent:  'center',
  },
  check: { color: colors.background, fontSize: 10, fontWeight: '900' },
});