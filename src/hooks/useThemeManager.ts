import { useCallback } from 'react';

import { useThemes }           from '@/contexts/ThemesContext';
import {
  createCustomTheme,
  deleteCustomTheme,
  updateCustomTheme,
} from '@/services/themeService';
import { CreateThemeInput }    from '@/types/theme';

export function useThemeManager() {
  const { themes, isLoading, reload } = useThemes();

  const addTheme = useCallback(async (input: CreateThemeInput) => {
    await createCustomTheme(input);
    await reload();
  }, [reload]);

  const editTheme = useCallback(async (id: string, input: Partial<CreateThemeInput>) => {
    await updateCustomTheme(id, input);
    await reload();
  }, [reload]);

  const removeTheme = useCallback(async (id: string) => {
    await deleteCustomTheme(id);
    await reload();
  }, [reload]);

  return {
    themes,
    isLoading,
    loadThemes: reload,
    addTheme,
    editTheme,
    removeTheme,
  };
}