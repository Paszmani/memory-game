import { useSettings } from '@/contexts/SettingsContext';
import type { AppSettings, DeepPartial } from '@/types/settings';

export interface UseAppSettingsReturn {
  settings: AppSettings;
  isLoading: boolean;
  updateSettings: (partial: DeepPartial<AppSettings>) => void;
  saveSettings: (settings: AppSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
}

export function useAppSettings(): UseAppSettingsReturn {
  return useSettings();
}
