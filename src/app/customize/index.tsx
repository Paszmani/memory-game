import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { BackgroundPicker } from '@/components/customize/BackgroundPicker';
import { BrandingEditor } from '@/components/customize/BrandingEditor';
import { CardStylePicker } from '@/components/customize/CardStylePicker';
import { ThemeForm } from '@/components/customize/ThemeForm';
import { AppButton } from '@/components/ui/AppButton';
import { ColorPickerInput } from '@/components/ui/ColorPickerInput';
import { SectionCard } from '@/components/ui/SectionCard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useThemeManager } from '@/hooks/useThemeManager';
import type {
  AppSettings,
  BorderStyleType,
  ButtonStyleType,
  CardBackPattern,
  CardFlipStyle,
  DeepPartial,
  GridColumns,
  MatchAnimation,
  UIFontSize,
  WinAnimation,
} from '@/types/settings';
import type { CustomTheme } from '@/types/theme';
import { confirmAction, showDialogMessage } from '@/utils/dialog';

type Tab = 'themes' | 'appearance' | 'game' | 'totem';

const TABS: { key: Tab; label: string }[] = [
  { key: 'themes', label: 'Temas' },
  { key: 'appearance', label: 'Aparência' },
  { key: 'game', label: 'Jogo' },
  { key: 'totem', label: 'Totem' },
];

function mergeSettings(
  current: AppSettings,
  partial: DeepPartial<AppSettings>,
): AppSettings {
  return {
    branding: {
      ...current.branding,
      ...partial.branding,
    },
    background: {
      ...current.background,
      ...partial.background,
    },
    cardStyle: {
      ...current.cardStyle,
      ...partial.cardStyle,
    },
    animation: {
      ...current.animation,
      ...partial.animation,
    },
    ui: {
      ...current.ui,
      ...partial.ui,
    },
    gameBehavior: {
      ...current.gameBehavior,
      ...partial.gameBehavior,
    },
    totem: {
      ...current.totem,
      ...partial.totem,
    },
  };
}

export default function CustomizeScreen() {
  const { width } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState<Tab>('themes');
  const { settings, updateSettings } = useAppSettings();
  const { themes, addTheme, removeTheme } = useThemeManager();

  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isWide = width >= 920;

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draftSettings) !== JSON.stringify(settings),
    [draftSettings, settings],
  );

  const updateDraft = useCallback((partial: DeepPartial<AppSettings>) => {
    setDraftSettings((current) => mergeSettings(current, partial));
  }, []);

  const handleSaveCustomization = useCallback(async () => {
    setIsSaving(true);

    try {
      await updateSettings(draftSettings);
      setLastSavedAt(new Date().toLocaleTimeString('pt-BR'));
    } finally {
      setIsSaving(false);
    }
  }, [draftSettings, updateSettings]);

  const handleDiscardChanges = useCallback(() => {
    setDraftSettings(settings);
  }, [settings]);

  const handleDeleteTheme = useCallback(
    (theme: CustomTheme) => {
      if (theme.isDefault) {
        showDialogMessage('Tema padrão', 'O tema padrão não pode ser removido.');
        return;
      }

      confirmAction({
        title: 'Remover tema',
        message: `Deseja remover "${theme.name}"?`,
        confirmText: 'Remover',
        destructive: true,
        onConfirm: () => removeTheme(theme.id),
      });
    },
    [removeTheme],
  );

  return (
    <ScreenContainer maxContentWidth={1120}>
      <View style={styles.tabRow}>
        {TABS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setActiveTab(key)}
            style={[styles.tab, activeTab === key && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === key && styles.tabLabelActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'themes' && (
        <>
          <SectionCard title="Temas disponíveis">
            {themes.map((theme) => (
              <View key={theme.id} style={styles.themeRow}>
                <View style={styles.themeInfo}>
                  <Text style={styles.themeName}>{theme.name}</Text>

                  {!!theme.description && (
                    <Text style={styles.themeDesc}>{theme.description}</Text>
                  )}

                  <Text style={styles.themeMeta}>
                    {theme.cards.length} cartas
                    {theme.isDefault ? ' · Padrão' : ''}
                  </Text>
                </View>

                <View style={styles.themeActions}>
                  <AppButton
                    title="Jogar"
                    size="sm"
                    onPress={() =>
                      router.push(`/game?difficulty=custom&themeId=${theme.id}`)
                    }
                  />

                  {!theme.isDefault && (
                    <AppButton
                      title="Remover"
                      size="sm"
                      variant="danger"
                      onPress={() => handleDeleteTheme(theme)}
                    />
                  )}
                </View>
              </View>
            ))}
          </SectionCard>

          <ThemeForm onSubmit={addTheme} />
        </>
      )}

      {activeTab === 'appearance' && (
        <>
          <SaveBar
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            lastSavedAt={lastSavedAt}
            onSave={handleSaveCustomization}
            onDiscard={handleDiscardChanges}
          />

          <View style={isWide ? styles.appearanceGrid : styles.appearanceStack}>
            <View style={styles.appearanceColumn}>
              <BrandingEditor
                value={draftSettings.branding}
                onChange={(branding) => updateDraft({ branding })}
              />

              <BackgroundPicker
                value={draftSettings.background}
                onChange={(background) => updateDraft({ background })}
              />
            </View>

            <View style={styles.appearanceColumn}>
              <CardStylePicker
                value={draftSettings.cardStyle}
                onChange={(cardStyle) => updateDraft({ cardStyle })}
              />

              <AdvancedAppearanceEditor
                value={draftSettings}
                onChange={updateDraft}
              />
            </View>
          </View>

          <SaveBar
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            lastSavedAt={lastSavedAt}
            onSave={handleSaveCustomization}
            onDiscard={handleDiscardChanges}
          />
        </>
      )}

      {activeTab === 'game' && (
        <>
          <SaveBar
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            lastSavedAt={lastSavedAt}
            onSave={handleSaveCustomization}
            onDiscard={handleDiscardChanges}
          />

          <GameBehaviorSettings
            value={draftSettings.gameBehavior}
            onChange={(gameBehavior) => updateDraft({ gameBehavior })}
          />
        </>
      )}

      {activeTab === 'totem' && (
        <>
          <SaveBar
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
            lastSavedAt={lastSavedAt}
            onSave={handleSaveCustomization}
            onDiscard={handleDiscardChanges}
          />

          <TotemSettings
            value={draftSettings.totem}
            onChange={(totem) => updateDraft({ totem })}
          />
        </>
      )}
    </ScreenContainer>
  );
}

function SaveBar({
  hasUnsavedChanges,
  isSaving,
  lastSavedAt,
  onSave,
  onDiscard,
}: {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
}) {
  return (
    <SectionCard title="Salvamento">
      <View style={styles.saveBar}>
        <View style={styles.saveInfo}>
          <Text style={styles.saveTitle}>
            {hasUnsavedChanges ? 'Alterações não salvas' : 'Tudo salvo'}
          </Text>

          <Text style={styles.saveDescription}>
            {hasUnsavedChanges
              ? 'Revise a personalização e toque em Salvar para aplicar.'
              : lastSavedAt
                ? `Último salvamento: ${lastSavedAt}`
                : 'As configurações atuais já estão aplicadas.'}
          </Text>
        </View>

        <View style={styles.saveActions}>
          <AppButton
            title="Descartar"
            variant="ghost"
            size="sm"
            disabled={!hasUnsavedChanges || isSaving}
            onPress={onDiscard}
          />

          <AppButton
            title={isSaving ? 'Salvando...' : 'Salvar personalização'}
            variant={hasUnsavedChanges ? 'success' : 'secondary'}
            size="sm"
            disabled={!hasUnsavedChanges || isSaving}
            onPress={() => void onSave()}
          />
        </View>
      </View>
    </SectionCard>
  );
}

function AdvancedAppearanceEditor({
  value,
  onChange,
}: {
  value: AppSettings;
  onChange: (partial: DeepPartial<AppSettings>) => void;
}) {
  return (
    <SectionCard title="Personalização avançada">
      <View style={styles.fieldGroup}>
        <Text style={styles.groupTitle}>Interface</Text>

        <ColorPickerInput
          label="Cor principal"
          value={value.ui.primaryColor}
          onChange={(primaryColor) =>
            onChange({ ui: { ...value.ui, primaryColor } })
          }
        />

        <ColorPickerInput
          label="Cor dos painéis"
          value={value.ui.surfaceColor}
          onChange={(surfaceColor) =>
            onChange({ ui: { ...value.ui, surfaceColor } })
          }
        />

        <ColorPickerInput
          label="Cor do texto"
          value={value.ui.textColor}
          onChange={(textColor) =>
            onChange({ ui: { ...value.ui, textColor } })
          }
        />

        <ColorPickerInput
          label="Cor das bordas"
          value={value.ui.borderColor}
          onChange={(borderColor) =>
            onChange({ ui: { ...value.ui, borderColor } })
          }
        />

        <OptionRow<UIFontSize>
          label="Tamanho geral da fonte"
          value={value.ui.fontSize}
          options={[
            { label: 'Pequeno', value: 'small' },
            { label: 'Médio', value: 'medium' },
            { label: 'Grande', value: 'large' },
            { label: 'Extra', value: 'xlarge' },
          ]}
          onChange={(fontSize) => onChange({ ui: { ...value.ui, fontSize } })}
        />

        <OptionRow<ButtonStyleType>
          label="Estilo dos botões"
          value={value.ui.buttonStyle}
          options={[
            { label: 'Preenchido', value: 'filled' },
            { label: 'Contorno', value: 'outlined' },
            { label: 'Plano', value: 'flat' },
          ]}
          onChange={(buttonStyle) =>
            onChange({ ui: { ...value.ui, buttonStyle } })
          }
        />

        <NumberOption
          label="Raio global"
          value={value.ui.globalRadius}
          min={0}
          max={32}
          step={2}
          onChange={(globalRadius) =>
            onChange({ ui: { ...value.ui, globalRadius } })
          }
        />

        <ToggleOption
          label="Efeito vidro nos painéis"
          value={value.ui.useGlassmorphism}
          onToggle={(useGlassmorphism) =>
            onChange({ ui: { ...value.ui, useGlassmorphism } })
          }
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.groupTitle}>Verso e estilo das cartas</Text>

        <OptionRow<CardBackPattern>
          label="Padrão do verso"
          value={value.cardStyle.backPattern}
          options={[
            { label: 'Sólido', value: 'solid' },
            { label: 'Pontos', value: 'dots' },
            { label: 'Grade', value: 'grid' },
            { label: 'Emoji', value: 'emoji' },
          ]}
          onChange={(backPattern) =>
            onChange({ cardStyle: { ...value.cardStyle, backPattern } })
          }
        />

        <TextField
          label="Emoji do verso"
          value={value.cardStyle.backPatternEmoji}
          onChangeText={(backPatternEmoji) =>
            onChange({ cardStyle: { ...value.cardStyle, backPatternEmoji } })
          }
        />

        <ColorPickerInput
          label="Cor do padrão do verso"
          value={value.cardStyle.backPatternColor}
          onChange={(backPatternColor) =>
            onChange({ cardStyle: { ...value.cardStyle, backPatternColor } })
          }
        />

        <OptionRow<BorderStyleType>
          label="Estilo da borda"
          value={value.cardStyle.borderStyleType}
          options={[
            { label: 'Nenhuma', value: 'none' },
            { label: 'Sutil', value: 'subtle' },
            { label: 'Normal', value: 'normal' },
            { label: 'Forte', value: 'bold' },
            { label: 'Brilho', value: 'glow' },
          ]}
          onChange={(borderStyleType) =>
            onChange({ cardStyle: { ...value.cardStyle, borderStyleType } })
          }
        />

        <NumberOption
          label="Espessura da borda"
          value={value.cardStyle.borderWidth}
          min={0}
          max={8}
          step={1}
          onChange={(borderWidth) =>
            onChange({ cardStyle: { ...value.cardStyle, borderWidth } })
          }
        />

        <NumberOption
          label="Opacidade do par encontrado"
          value={value.cardStyle.matchedOpacity}
          min={0.5}
          max={1}
          step={0.05}
          onChange={(matchedOpacity) =>
            onChange({ cardStyle: { ...value.cardStyle, matchedOpacity } })
          }
        />

        <NumberOption
          label="Tamanho dos emojis"
          value={value.cardStyle.emojiSizeScale}
          min={0.6}
          max={1.8}
          step={0.1}
          onChange={(emojiSizeScale) =>
            onChange({ cardStyle: { ...value.cardStyle, emojiSizeScale } })
          }
        />

        <ToggleOption
          label="Sombra nas cartas"
          value={value.cardStyle.shadowEnabled}
          onToggle={(shadowEnabled) =>
            onChange({ cardStyle: { ...value.cardStyle, shadowEnabled } })
          }
        />

        <ToggleOption
          label="Brilho ao encontrar par"
          value={value.cardStyle.glowOnMatch}
          onToggle={(glowOnMatch) =>
            onChange({ cardStyle: { ...value.cardStyle, glowOnMatch } })
          }
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.groupTitle}>Animações</Text>

        <ToggleOption
          label="Animações ativadas"
          value={value.animation.enabled}
          onToggle={(enabled) =>
            onChange({ animation: { ...value.animation, enabled } })
          }
        />

        <OptionRow<CardFlipStyle>
          label="Estilo de virada"
          value={value.animation.flipStyle}
          options={[
            { label: 'Horizontal', value: 'horizontal' },
            { label: 'Vertical', value: 'vertical' },
            { label: 'Fade', value: 'fade' },
            { label: 'Zoom', value: 'zoom' },
          ]}
          onChange={(flipStyle) =>
            onChange({ animation: { ...value.animation, flipStyle } })
          }
        />

        <NumberOption
          label="Velocidade da virada"
          value={value.animation.flipSpeedMs}
          min={120}
          max={900}
          step={30}
          suffix="ms"
          onChange={(flipSpeedMs) =>
            onChange({ animation: { ...value.animation, flipSpeedMs } })
          }
        />

        <OptionRow<MatchAnimation>
          label="Animação de acerto"
          value={value.animation.matchAnimation}
          options={[
            { label: 'Bounce', value: 'bounce' },
            { label: 'Glow', value: 'glow' },
            { label: 'Pulse', value: 'pulse' },
            { label: 'Nenhuma', value: 'none' },
          ]}
          onChange={(matchAnimation) =>
            onChange({ animation: { ...value.animation, matchAnimation } })
          }
        />

        <OptionRow<WinAnimation>
          label="Animação de vitória"
          value={value.animation.winAnimation}
          options={[
            { label: 'Confete', value: 'confetti' },
            { label: 'Estrelas', value: 'stars' },
            { label: 'Nenhuma', value: 'none' },
          ]}
          onChange={(winAnimation) =>
            onChange({ animation: { ...value.animation, winAnimation } })
          }
        />
      </View>
    </SectionCard>
  );
}

function GameBehaviorSettings({
  value,
  onChange,
}: {
  value: AppSettings['gameBehavior'];
  onChange: (value: Partial<AppSettings['gameBehavior']>) => void;
}) {
  return (
    <SectionCard title="Comportamento do jogo">
      <ToggleOption
        label="Som ativado"
        value={value.soundEnabled}
        onToggle={(soundEnabled) => onChange({ soundEnabled })}
      />

      <ToggleOption
        label="Mostrar cronômetro"
        value={value.showTimer}
        onToggle={(showTimer) => onChange({ showTimer })}
      />

      <ToggleOption
        label="Mostrar movimentos"
        value={value.showMoves}
        onToggle={(showMoves) => onChange({ showMoves })}
      />

      <ToggleOption
        label="Mostrar pontuação"
        value={value.showScore}
        onToggle={(showScore) => onChange({ showScore })}
      />

      <ToggleOption
        label="Mostrar nomes nas cartas"
        value={value.showLabels}
        onToggle={(showLabels) => onChange({ showLabels })}
      />

      <OptionRow<GridColumns>
        label="Colunas preferidas"
        value={value.gridColumns}
        options={[
          { label: '2', value: 2 },
          { label: '3', value: 3 },
          { label: '4', value: 4 },
          { label: '5', value: 5 },
          { label: '6', value: 6 },
        ]}
        onChange={(gridColumns) => onChange({ gridColumns })}
      />

      <NumberOption
        label="Pares no fácil"
        value={value.pairCountEasy}
        min={2}
        max={12}
        step={1}
        onChange={(pairCountEasy) => onChange({ pairCountEasy })}
      />

      <NumberOption
        label="Pares no médio"
        value={value.pairCountMedium}
        min={4}
        max={18}
        step={1}
        onChange={(pairCountMedium) => onChange({ pairCountMedium })}
      />

      <NumberOption
        label="Pares no difícil"
        value={value.pairCountHard}
        min={6}
        max={24}
        step={1}
        onChange={(pairCountHard) => onChange({ pairCountHard })}
      />

      <NumberOption
        label="Tempo para desvirar cartas"
        value={value.flipDelayMs}
        min={300}
        max={2000}
        step={100}
        suffix="ms"
        onChange={(flipDelayMs) => onChange({ flipDelayMs })}
      />

      <NumberOption
        label="Dica após inatividade"
        value={value.hintAfterSeconds}
        min={0}
        max={120}
        step={5}
        suffix="s"
        onChange={(hintAfterSeconds) => onChange({ hintAfterSeconds })}
      />
    </SectionCard>
  );
}

function TotemSettings({
  value,
  onChange,
}: {
  value: AppSettings['totem'];
  onChange: (value: Partial<AppSettings['totem']>) => void;
}) {
  return (
    <SectionCard title="Configurações do Totem">
      <ToggleOption
        label="Tela de atração ativada"
        value={value.attractScreenEnabled}
        onToggle={(attractScreenEnabled) => onChange({ attractScreenEnabled })}
      />

      <ToggleOption
        label="Modo kiosk"
        value={value.kioskMode}
        onToggle={(kioskMode) => onChange({ kioskMode })}
      />

      <ToggleOption
        label="Mostrar marca na atração"
        value={value.showBranding}
        onToggle={(showBranding) => onChange({ showBranding })}
      />

      <TextField
        label="Mensagem da tela de atração"
        value={value.attractMessage}
        onChangeText={(attractMessage) => onChange({ attractMessage })}
      />

      <NumberOption
        label="Inatividade para atração"
        value={value.attractTimeoutSeconds}
        min={5}
        max={120}
        step={5}
        suffix="s"
        onChange={(attractTimeoutSeconds) => onChange({ attractTimeoutSeconds })}
      />

      <NumberOption
        label="Auto-reset após fim"
        value={value.autoResetAfterFinishSeconds}
        min={0}
        max={120}
        step={5}
        suffix="s"
        onChange={(autoResetAfterFinishSeconds) =>
          onChange({ autoResetAfterFinishSeconds })
        }
      />
    </SectionCard>
  );
}

function ToggleOption({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}) {
  return (
    <Pressable style={styles.toggleRow} onPress={() => onToggle(!value)}>
      <Text style={styles.toggleLabel}>{label}</Text>

      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
      </View>
    </Pressable>
  );
}

function OptionRow<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.optionBlock}>
      <Text style={styles.optionLabel}>{label}</Text>

      <View style={styles.optionRow}>
        {options.map((option) => {
          const active = option.value === value;

          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              style={[styles.optionButton, active && styles.optionButtonActive]}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  active && styles.optionButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function NumberOption({
  label,
  value,
  min,
  max,
  step,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const decrease = () =>
    onChange(Math.max(min, Number((value - step).toFixed(2))));
  const increase = () =>
    onChange(Math.min(max, Number((value + step).toFixed(2))));

  return (
    <View style={styles.numberOption}>
      <Text style={styles.optionLabel}>{label}</Text>

      <View style={styles.stepper}>
        <Pressable style={styles.stepperButton} onPress={decrease}>
          <Text style={styles.stepperText}>−</Text>
        </Pressable>

        <Text style={styles.stepperValue}>
          {value}
          {suffix}
        </Text>

        <Pressable style={styles.stepperButton} onPress={increase}>
          <Text style={styles.stepperText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function TextField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.textField}>
      <Text style={styles.optionLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    minWidth: 72,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.primaryGlow,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: colors.primary,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  themeInfo: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  themeName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  themeDesc: {
    color: colors.textMuted,
    fontSize: 13,
  },
  themeMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  themeActions: {
    gap: 6,
  },
  appearanceGrid: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  appearanceStack: {
    gap: 16,
  },
  appearanceColumn: {
    flex: 1,
    gap: 16,
    minWidth: 0,
  },
  saveBar: {
    gap: 14,
  },
  saveInfo: {
    gap: 4,
  },
  saveTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  saveDescription: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  saveActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fieldGroup: {
    gap: 12,
    paddingVertical: 8,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  optionBlock: {
    gap: 8,
  },
  optionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  optionButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  optionButtonTextActive: {
    color: colors.primary,
  },
  numberOption: {
    gap: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  stepperValue: {
    minWidth: 70,
    textAlign: 'center',
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textMuted,
  },
  toggleThumbOn: {
    backgroundColor: colors.background,
    alignSelf: 'flex-end',
  },
  textField: {
    gap: 8,
  },
  input: {
    minHeight: 48,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
  },
});
