import { useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { colors as base } from '@/constants/colors';

function hexToRgba(hex: string, a: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) || 0;
  const g = parseInt(c.slice(2, 4), 16) || 0;
  const b = parseInt(c.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a})`;
}

export function useColors() {
  const { settings } = useSettings();
  const primary = settings.ui.primaryColor ?? base.primary;

  return useMemo(() => ({
    ...base,
    primary,
    primaryGlow:   hexToRgba(primary, 0.15),
    primaryMedium: hexToRgba(primary, 0.30),
    primaryStrong: hexToRgba(primary, 0.60),
  }), [primary]);
}

// Versão estática para uso fora de componentes (StyleSheet.create, etc.)
export { base as colors };