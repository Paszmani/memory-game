import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SaveBar }      from '@/components/ui/SaveBar';
import { SectionCard }  from '@/components/ui/SectionCard';
import { SliderInput }  from '@/components/ui/SliderInput';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { colors }       from '@/constants/colors';
import { useSaveState } from '@/hooks/useSaveState';
import { GameBehaviorSettings, GridColumns } from '@/types/settings';

interface Props {
  value:  GameBehaviorSettings;
  onSave: (v: GameBehaviorSettings) => Promise<void>;
}

const COLUMN_OPTIONS: GridColumns[] = [2, 3, 4, 5, 6];

export const GameplaySettings = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);

  return (
    <SectionCard title="🎮 Gameplay">
      {/* Colunas do tabuleiro */}
      <Text style={styles.subLabel}>Colunas do Tabuleiro</Text>
      <View style={styles.row}>
        {COLUMN_OPTIONS.map((col) => (
          <Pressable
            key={col}
            onPress={() => update({ gridColumns: col })}
            style={[styles.colBtn, local.gridColumns === col && styles.colBtnActive]}
          >
            <Text style={[styles.colText, local.gridColumns === col && styles.colTextActive]}>
              {col}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Número de pares por dificuldade */}
      <SliderInput
        label="Pares — Fácil"
        value={local.pairCountEasy}
        min={2}
        max={8}
        step={1}
        unit=" pares"
        onChange={(v) => update({ pairCountEasy: v })}
      />
      <SliderInput
        label="Pares — Médio"
        value={local.pairCountMedium}
        min={4}
        max={16}
        step={2}
        unit=" pares"
        onChange={(v) => update({ pairCountMedium: v })}
      />
      <SliderInput
        label="Pares — Difícil"
        value={local.pairCountHard}
        min={8}
        max={24}
        step={2}
        unit=" pares"
        onChange={(v) => update({ pairCountHard: v })}
      />

      {/* Delay de virada */}
      <SliderInput
        label="Tempo para virar cartas erradas"
        value={local.flipDelayMs}
        min={300}
        max={2000}
        step={100}
        unit="ms"
        onChange={(v) => update({ flipDelayMs: v })}
        formatValue={(v) => `${(v / 1000).toFixed(1)}s`}
      />

      {/* Dica automática */}
      <SliderInput
        label="Dica automática após inatividade"
        value={local.hintAfterSeconds}
        min={0}
        max={30}
        step={5}
        unit="s"
        onChange={(v) => update({ hintAfterSeconds: v })}
        formatValue={(v) => v === 0 ? 'Desligado' : `${v}s`}
      />

      {/* Toggles */}
      <ToggleSwitch label="Mostrar cronômetro" value={local.showTimer} onToggle={(v) => update({ showTimer: v })} />
      <ToggleSwitch label="Mostrar jogadas"    value={local.showMoves} onToggle={(v) => update({ showMoves: v })} />
      <ToggleSwitch label="Mostrar pontuação"  value={local.showScore} onToggle={(v) => update({ showScore: v })} />
      <ToggleSwitch label="Som habilitado"     value={local.soundEnabled} onToggle={(v) => update({ soundEnabled: v })} />
      <ToggleSwitch
        label="Mostrar rótulos nas cartas"
        hint="Exibe o nome do item abaixo do emoji"
        value={local.showLabels}
        onToggle={(v) => update({ showLabels: v })}
      />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

GameplaySettings.displayName = 'GameplaySettings';

const styles = StyleSheet.create({
  subLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  row:      { flexDirection: 'row', gap: 8 },
  colBtn: {
    flex:            1,
    height:          44,
    borderRadius:    12,
    borderWidth:     1.5,
    borderColor:     colors.border,
    backgroundColor: colors.background,
    alignItems:      'center',
    justifyContent:  'center',
  },
  colBtnActive:  { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  colText:       { color: colors.textMuted, fontSize: 18, fontWeight: '700' },
  colTextActive: { color: colors.primary },
});