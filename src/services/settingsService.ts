import { STORAGE_KEYS }    from '@/constants/storageKeys';
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import { AppSettings, DeepPartial } from '@/types/settings';
import { getJson, setJson }        from '@/services/storageService';

function mergeSettings(saved: Partial<AppSettings>): AppSettings {
  return {
    branding:     { ...DEFAULT_SETTINGS.branding,     ...saved.branding },
    background:   { ...DEFAULT_SETTINGS.background,   ...saved.background },
    cardStyle:    { ...DEFAULT_SETTINGS.cardStyle,     ...saved.cardStyle },
    animation:    { ...DEFAULT_SETTINGS.animation,     ...saved.animation },
    ui:           { ...DEFAULT_SETTINGS.ui,            ...saved.ui },
    gameBehavior: { ...DEFAULT_SETTINGS.gameBehavior,  ...saved.gameBehavior },
    totem:        { ...DEFAULT_SETTINGS.totem,         ...saved.totem },
  };
}

export async function getAppSettings(): Promise<AppSettings> {
  const saved = await getJson<Partial<AppSettings>>(STORAGE_KEYS.appSettings, {});
  return mergeSettings(saved);
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await setJson(STORAGE_KEYS.appSettings, settings);
}

export async function updateAppSettings(
  partial: DeepPartial<AppSettings>,
): Promise<AppSettings> {
  const current = await getAppSettings();

  const updated: AppSettings = {
    branding:     { ...current.branding,     ...partial.branding },
    background:   { ...current.background,   ...partial.background },
    cardStyle:    { ...current.cardStyle,     ...partial.cardStyle },
    animation:    { ...current.animation,     ...partial.animation },
    ui:           { ...current.ui,            ...partial.ui },
    gameBehavior: { ...current.gameBehavior,  ...partial.gameBehavior },
    totem:        { ...current.totem,         ...partial.totem },
  };

  await saveAppSettings(updated);
  return updated;
}

export async function resetAppSettings(): Promise<AppSettings> {
  await saveAppSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}