import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import {
  getAppSettings,
  resetAppSettings,
  saveAppSettings,
} from '@/services/settingsService';
import type { AppSettings, DeepPartial } from '@/types/settings';

export interface UseAppSettingsReturn {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (partial: DeepPartial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

function mergeSettings(
  previous: AppSettings,
  partial: DeepPartial<AppSettings>,
): AppSettings {
  return {
    branding: {
      ...previous.branding,
      ...partial.branding,
    },

    background: {
      ...previous.background,
      ...partial.background,
    },

    cardStyle: {
      ...previous.cardStyle,
      ...partial.cardStyle,
    },

    animation: {
      ...previous.animation,
      ...partial.animation,
    },

    ui: {
      ...previous.ui,
      ...partial.ui,
    },

    gameBehavior: {
      ...previous.gameBehavior,
      ...partial.gameBehavior,
    },

    totem: {
      ...previous.totem,
      ...partial.totem,
    },
  };
}

export function useAppSettings(): UseAppSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
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

  const updateSettings = useCallback(
    async (partial: DeepPartial<AppSettings>) => {
      setSettings((previous) => {
        const updated = mergeSettings(previous, partial);

        void saveAppSettings(updated);

        return updated;
      });
    },
    [],
  );

  const resetSettings = useCallback(async () => {
    const defaults = await resetAppSettings();
    setSettings(defaults);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
}
