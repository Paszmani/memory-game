import React, { memo } from 'react';
import { StyleSheet } from 'react-native';

import { SaveBar }      from '@/components/ui/SaveBar';
import { SectionCard }  from '@/components/ui/SectionCard';
import { SliderInput }  from '@/components/ui/SliderInput';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { useSaveState } from '@/hooks/useSaveState';
import { GameBehaviorSettings } from '@/types/settings';

interface Props {
  value:  GameBehaviorSettings;
  onSave: (v: GameBehaviorSettings) => Promise<void>;
}

export const GameplaySettings = memo(({ value, onSave }: Props) => {
  const { localValue: local, status, update, save, reset } = useSaveState(value, onSave);

  return (
    <SectionCard title="🎮 Gameplay">
      <SliderInput
        label="Tempo para virar cartas erradas"
        value={local.flipDelayMs}
        min={300}
        max={2000}
        step={100}
        onChange={(v) => update({ flipDelayMs: v })}
        formatValue={(v) => `${(v / 1000).toFixed(1)}s`}
      />

      <SliderInput
        label="Dica automática após inatividade"
        value={local.hintAfterSeconds}
        min={0}
        max={30}
        step={5}
        onChange={(v) => update({ hintAfterSeconds: v })}
        formatValue={(v) => v === 0 ? 'Desligado' : `${v}s`}
      />

      <ToggleSwitch label="Mostrar cronômetro"     value={local.showTimer}    onToggle={(v) => update({ showTimer: v })} />
      <ToggleSwitch label="Mostrar jogadas"         value={local.showMoves}    onToggle={(v) => update({ showMoves: v })} />
      <ToggleSwitch label="Som habilitado"          value={local.soundEnabled} onToggle={(v) => update({ soundEnabled: v })} />
      <ToggleSwitch
        label="Rótulos nas cartas"
        hint="Exibe o nome do item abaixo do emoji"
        value={local.showLabels}
        onToggle={(v) => update({ showLabels: v })}
      />

      <SaveBar status={status} onSave={save} onReset={reset} />
    </SectionCard>
  );
});

GameplaySettings.displayName = 'GameplaySettings';

const styles = StyleSheet.create({});