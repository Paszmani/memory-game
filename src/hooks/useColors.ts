import { useMemo } from 'react';

import { colors as base } from '@/constants/colors';
import { useSettings } from '@/contexts/SettingsContext';
import {
  getContrastColor,
  hexToRgba,
  isValidHexColor,
  lerpColor,
} from '@/utils/colorUtils';

function safeHex(value: string | undefined, fallback: string) {
  return value && isValidHexColor(value) ? value : fallback;
}

export function makeDynamicColors(primaryInput?: string) {
  const primary = safeHex(primaryInput, base.primary);

  const primaryText = getContrastColor(primary);

  return {
    ...base,

    primary,
    primaryText,

    primaryGlow: hexToRgba(primary, 0.15),
    primaryMedium: hexToRgba(primary, 0.3),
    primaryStrong: hexToRgba(primary, 0.6),

    primarySurface: lerpColor(base.background, primary, 0.12),
    primarySurfaceStrong: lerpColor(base.background, primary, 0.2),
    primaryBorder: lerpColor(base.border, primary, 0.55),

    selectedBackground: lerpColor(base.background, primary, 0.16),
    selectedBorder: lerpColor(base.border, primary, 0.65),
    selectedText: primary,

    buttonPrimaryBg: primary,
    buttonPrimaryBorder: lerpColor(primary, '#FFFFFF', 0.18),
    buttonPrimaryText: primaryText,
  };
}

export function useColors() {
  const { settings } = useSettings();

  return useMemo(
    () => makeDynamicColors(settings.ui.primaryColor),
    [settings.ui.primaryColor],
  );
}

export { base as colors };