import { useCallback, useEffect, useState } from 'react';

import {
  createCustomTheme,
  deleteCustomTheme,
  getThemes,
} from '@/services/themeService';
import { CreateThemeInput, CustomTheme } from '@/types/theme';

export function useThemeManager() {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadThemes = useCallback(async () => {
    setIsLoading(true);

    try {
      const storedThemes = await getThemes();
      setThemes(storedThemes);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTheme = useCallback(
    async (input: CreateThemeInput) => {
      await createCustomTheme(input);
      await loadThemes();
    },
    [loadThemes],
  );

  const removeTheme = useCallback(
    async (themeId: string) => {
      await deleteCustomTheme(themeId);
      await loadThemes();
    },
    [loadThemes],
  );

  useEffect(() => {
    void loadThemes();
  }, [loadThemes]);

  return {
    themes,
    isLoading,
    loadThemes,
    addTheme,
    removeTheme,
  };
}