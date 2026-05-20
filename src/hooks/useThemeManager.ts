import { useCallback, useEffect, useState } from 'react';

import {
  createCustomTheme,
  deleteCustomTheme,
  getThemes,
} from '@/services/themeService';
import { CreateThemeInput, CustomTheme } from '@/types/theme';

export interface UseThemeManagerReturn {
  themes:      CustomTheme[];
  isLoading:   boolean;
  loadThemes:  () => Promise<void>;
  addTheme:    (input: CreateThemeInput) => Promise<void>;
  removeTheme: (id: string) => Promise<void>;
}

export function useThemeManager(): UseThemeManagerReturn {
  const [themes,    setThemes]    = useState<CustomTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadThemes = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await getThemes();
      setThemes(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTheme = useCallback(async (input: CreateThemeInput) => {
    await createCustomTheme(input);
    await loadThemes();
  }, [loadThemes]);

  const removeTheme = useCallback(async (id: string) => {
    await deleteCustomTheme(id);
    await loadThemes();
  }, [loadThemes]);

  useEffect(() => { void loadThemes(); }, [loadThemes]);

  return { themes, isLoading, loadThemes, addTheme, removeTheme };
}