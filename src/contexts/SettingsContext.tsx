import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { DEFAULT_SETTINGS }  from '@/constants/defaultSettings';
import {
  getAppSettings,
  saveAppSettings,
  resetAppSettings,
} from '@/services/settingsService';
import { AppSettings, DeepPartial } from '@/types/settings';

interface SettingsContextValue {
  settings:       AppSettings;
  isLoading:      boolean;
  updateSettings: (partial: DeepPartial<AppSettings>) => void;
  saveSettings:   (s: AppSettings) => Promise<void>;
  resetSettings:  () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings:       DEFAULT_SETTINGS,
  isLoading:      true,
  updateSettings: () => {},
  saveSettings:   async () => {},
  resetSettings:  async () => {},
});

export const useSettings = () => useContext(SettingsContext);

function mergeDeep(prev: AppSettings, partial: DeepPartial<AppSettings>): AppSettings {
  return {
    branding:     { ...prev.branding,     ...partial.branding },
    background:   { ...prev.background,   ...partial.background },
    cardStyle:    { ...prev.cardStyle,     ...partial.cardStyle },
    animation:    { ...prev.animation,     ...partial.animation },
    ui:           { ...prev.ui,            ...partial.ui },
    gameBehavior: { ...prev.gameBehavior,  ...partial.gameBehavior },
    totem:        { ...prev.totem,         ...partial.totem },
  };
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings,  setSettings]  = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAppSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  /** Atualiza estado + persiste. Todos os consumidores re-renderizam imediatamente. */
  const updateSettings = useCallback((partial: DeepPartial<AppSettings>) => {
    setSettings((prev) => {
      const next = mergeDeep(prev, partial);
      void saveAppSettings(next); // persiste em background
      return next;               // atualiza estado sincronamente
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

  return (
    <SettingsContext.Provider
      value={{ settings, isLoading, updateSettings, saveSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}