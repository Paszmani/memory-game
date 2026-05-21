import { Platform, useWindowDimensions } from 'react-native';

import type { GridColumns } from '@/types/settings';

export function useResponsiveColumns(preferredColumns: GridColumns): GridColumns {
  const { width, height } = useWindowDimensions();

  const preferred = Math.max(2, Math.min(6, preferredColumns));
  const shortestSide = Math.min(width, height);

  if (Platform.OS === 'web') {
    if (width >= 1200) return Math.min(6, Math.max(preferred, 5)) as GridColumns;
    if (width >= 900) return Math.min(5, Math.max(preferred, 4)) as GridColumns;
    if (width >= 640) return Math.min(4, preferred) as GridColumns;
    if (width >= 420) return Math.min(3, preferred) as GridColumns;

    return 2;
  }

  if (shortestSide < 360) return 2;
  if (shortestSide < 520) return Math.min(3, preferred) as GridColumns;
  if (shortestSide < 760) return Math.min(4, preferred) as GridColumns;

  return Math.min(6, preferred) as GridColumns;
}
