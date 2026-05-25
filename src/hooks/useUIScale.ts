import { useAppSettings }  from '@/hooks/useAppSettings';
import { FONT_SIZE_SCALE } from '@/constants/defaultSettings';

export interface UIScaleReturn {
  scale:    number;
  fs:       (base: number) => number;
  radius:   (base: number) => number;
}

/**
 * Retorna multiplicadores de escala baseados nas configurações de UI.
 * Usar em qualquer componente que precise respeitar fontSize global.
 */
export function useUIScale(): UIScaleReturn {
  const { settings } = useAppSettings();
  const scale = FONT_SIZE_SCALE[settings.ui.fontSize] ?? 1.0;

  return {
    scale,
    fs:     (base: number) => Math.round(base * scale),
    radius: (base: number) => Math.round(base * (settings.ui.globalRadius / 16)),
  };
}