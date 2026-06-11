import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import {
  getAppSettings,
  resetAppSettings,
  saveAppSettings,
} from '@/services/settingsService';
import type { AppSettings, DeepPartial } from '@/types/settings';

interface SettingsContextValue {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (partial: DeepPartial<AppSettings>) => void;
  saveSettings: (settings: AppSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  updateSettings: () => {},
  saveSettings: async () => {},
  resetSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

function mergeDeep(
  prev: AppSettings,
  partial: DeepPartial<AppSettings>,
): AppSettings {
  return {
    branding: {
      ...prev.branding,
      ...partial.branding,
    },
    background: {
      ...prev.background,
      ...partial.background,
    },
    cardStyle: {
      ...prev.cardStyle,
      ...partial.cardStyle,
    },
    animation: {
      ...prev.animation,
      ...partial.animation,
    },
    ui: {
      ...prev.ui,
      ...partial.ui,
    },
    gameBehavior: {
      ...prev.gameBehavior,
      ...partial.gameBehavior,
    },
    totem: {
      ...prev.totem,
      ...partial.totem,
    },
  };
}

export function SettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const loaded = await getAppSettings();

        if (mounted) {
          setSettings(loaded);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[SettingsProvider] Falha ao carregar configurações:', error);
        }

        if (mounted) {
          setSettings(DEFAULT_SETTINGS);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = useCallback((partial: DeepPartial<AppSettings>) => {
    setSettings((prev) => {
      const next = mergeDeep(prev, partial);

      void saveAppSettings(next).catch((error) => {
        if (__DEV__) {
          console.warn('[SettingsProvider] Falha ao salvar configurações:', error);
        }
      });

      return next;
    });
  }, []);

  const saveSettings = useCallback(async (nextSettings: AppSettings) => {
    await saveAppSettings(nextSettings);
    setSettings(nextSettings);
  }, []);

  const resetSettings = useCallback(async () => {
    const defaults = await resetAppSettings();
    setSettings(defaults);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      updateSettings,
      saveSettings,
      resetSettings,
    }),
    [settings, isLoading, updateSettings, saveSettings, resetSettings],
  );

  /*
   * Evita a primeira renderização visual com DEFAULT_SETTINGS.
   * Isso corrige o bug da Web em que o design aparece quebrado
   * até alguma interação forçar uma nova renderização.
   */
  if (isLoading) {
    return null;
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}