import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_SETTINGS }  from '@/constants/defaultSettings';
import {
  getAppSettings,
  saveAppSettings,
  resetAppSettings,
} from '@/services/settingsService';
import { AppSettings, DeepPartial } from '@/types/settings';

export interface UseAppSettingsReturn {
  settings:       AppSettings;
  isLoading:      boolean;
  updateSettings: (partial: DeepPartial<AppSettings>) => void;
  saveSettings:   (settings: AppSettings) => Promise<void>;
  resetSettings:  () => Promise<void>;
}

export function useAppSettings(): UseAppSettingsReturn {
  const [settings,  setSettings]  = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getAppSettings().then((loaded) => {
      if (!cancelled) {
        setSettings(loaded);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const updateSettings = useCallback((partial: DeepPartial<AppSettings>) => {
    setSettings((prev) => {
      const next: AppSettings = {
        branding:     { ...prev.branding,     ...partial.branding },
        background:   { ...prev.background,   ...partial.background },
        cardStyle:    { ...prev.cardStyle,     ...partial.cardStyle },
        animation:    { ...prev.animation,     ...partial.animation },
        ui:           { ...prev.ui,            ...partial.ui },
        gameBehavior: { ...prev.gameBehavior,  ...partial.gameBehavior },
        totem:        { ...prev.totem,         ...partial.totem },
      };
      void saveAppSettings(next);
      return next;
    });
  }, []);

  const saveSettings = useCallback(async (s: AppSettings) => {
    await saveAppSettings(s);
    setSettings(s);
  }, []);

  const resetSettings = useCallback(async () => {
    const defaults = await resetAppSettings();
    setSettings(defaults);
  }, []);

  return { settings, isLoading, updateSettings, saveSettings, resetSettings };
}