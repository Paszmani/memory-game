import React, {
  createContext, useCallback,
  useContext, useEffect, useState,
} from 'react';

import { DEFAULT_THEME }  from '@/constants/defaultTheme';
import { getThemes }      from '@/services/themeService';
import { CustomTheme }    from '@/types/theme';

interface ThemesContextValue {
  themes:    CustomTheme[];
  isLoading: boolean;
  reload:    () => Promise<void>;
}

const ThemesContext = createContext<ThemesContextValue>({
  themes:    [DEFAULT_THEME],
  isLoading: false,
  reload:    async () => {},
});

export const useThemes = () => useContext(ThemesContext);

export function ThemesProvider({ children }: { children: React.ReactNode }) {
  const [themes,    setThemes]    = useState<CustomTheme[]>([DEFAULT_THEME]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await getThemes();
      setThemes(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  return (
    <ThemesContext.Provider value={{ themes, isLoading, reload }}>
      {children}
    </ThemesContext.Provider>
  );
}