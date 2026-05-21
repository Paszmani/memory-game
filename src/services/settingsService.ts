import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getJson, setJson } from '@/services/storageService';
import type { AppSettings, DeepPartial } from '@/types/settings';

function mergeSettings(saved: DeepPartial<AppSettings>): AppSettings {
  return {
    branding: {
      ...DEFAULT_SETTINGS.branding,
      ...saved.branding,
    },

    background: {
      ...DEFAULT_SETTINGS.background,
      ...saved.background,
    },

    cardStyle: {
      ...DEFAULT_SETTINGS.cardStyle,
      ...saved.cardStyle,
    },

    animation: {
      ...DEFAULT_SETTINGS.animation,
      ...saved.animation,
    },

    ui: {
      ...DEFAULT_SETTINGS.ui,
      ...saved.ui,
    },

    gameBehavior: {
      ...DEFAULT_SETTINGS.gameBehavior,
      ...saved.gameBehavior,
    },

    totem: {
      ...DEFAULT_SETTINGS.totem,
      ...saved.totem,
    },
  };
}

function mergePartialSettings(
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

export async function getAppSettings(): Promise<AppSettings> {
  const saved = await getJson<DeepPartial<AppSettings>>(
    STORAGE_KEYS.appSettings,
    {},
  );

  return mergeSettings(saved);
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await setJson(STORAGE_KEYS.appSettings, settings);
}

export async function updateAppSettings(
  partial: DeepPartial<AppSettings>,
): Promise<AppSettings> {
  const current = await getAppSettings();
  const updated = mergePartialSettings(current, partial);

  await saveAppSettings(updated);

  return updated;
}

export async function resetAppSettings(): Promise<AppSettings> {
  await saveAppSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
