import { STORAGE_KEYS } from '@/constants/storageKeys';
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import { AppSettings } from '@/types/settings';
import { getJson, setJson } from '@/services/storageService';

export async function getAppSettings(): Promise<AppSettings> {
  const saved = await getJson<Partial<AppSettings>>(STORAGE_KEYS.appSettings, {});

  return {
    branding:     { ...DEFAULT_SETTINGS.branding,     ...saved.branding },
    background:   { ...DEFAULT_SETTINGS.background,   ...saved.background },
    cardStyle:    { ...DEFAULT_SETTINGS.cardStyle,     ...saved.cardStyle },
    gameBehavior: { ...DEFAULT_SETTINGS.gameBehavior,  ...saved.gameBehavior },
    totem:        { ...DEFAULT_SETTINGS.totem,         ...saved.totem },
  };
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

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};