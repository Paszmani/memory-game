import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import {
  getAppSettings,
  saveAppSettings,
  resetAppSettings,
} from '@/services/settingsService';
import { AppSettings } from '@/types/settings';

export interface UseAppSettingsReturn {
  settings:       AppSettings;
  isLoading:      boolean;
  updateSettings: (partial: DeepPartial<AppSettings>) => Promise<void>;
  resetSettings:  () => Promise<void>;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export function useAppSettings(): UseAppSettingsReturn {
  const [settings,  setSettings]  = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await getAppSettings();
      setSettings(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (partial: DeepPartial<AppSettings>) => {
    setSettings((prev) => {
      const updated: AppSettings = {
        branding:     { ...prev.branding,     ...partial.branding },
        background:   { ...prev.background,   ...partial.background },
        cardStyle:    { ...prev.cardStyle,     ...partial.cardStyle },
        gameBehavior: { ...prev.gameBehavior,  ...partial.gameBehavior },
        totem:        { ...prev.totem,         ...partial.totem },
      };
      void saveAppSettings(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(async () => {
    const defaults = await resetAppSettings();
    setSettings(defaults);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { settings, isLoading, updateSettings, resetSettings };
}