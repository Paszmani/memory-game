import { useMemo } from 'react';

import { colors as base } from '@/constants/colors';
import { useSettings } from '@/contexts/SettingsContext';
import type { UISettings } from '@/types/settings';
import {
  getContrastColor,
  hexToRgba,
  isValidHexColor,
  lerpColor,
} from '@/utils/colorUtils';

function safeHex(value: string | undefined, fallback: string) {
  return value && isValidHexColor(value) ? value : fallback;
}

export function makeDynamicColors(ui?: Partial<UISettings>) {
  const primary = safeHex(ui?.primaryColor, base.primary);
  const surface = safeHex(ui?.surfaceColor, base.surface);
  const border = safeHex(ui?.borderColor, base.border);
  const text = safeHex(ui?.textColor, base.text);

  const background = base.background;
  const primaryText = getContrastColor(primary);

  const surfaceElevated = lerpColor(surface, '#FFFFFF', 0.06);
  const surfaceLight = lerpColor(surface, '#FFFFFF', 0.1);

  const textSecondary = lerpColor(text, background, 0.32);
  const textMuted = lerpColor(text, background, 0.55);

  const borderLight = lerpColor(border, '#FFFFFF', 0.16);
  const primaryBorder = lerpColor(border, primary, 0.58);

  const selectedBackground = lerpColor(surface, primary, 0.22);
  const selectedBorder = lerpColor(border, primary, 0.7);

  const glass = hexToRgba(surface, 0.72);
  const glassBorder = ui?.useGlassmorphism
    ? hexToRgba(primary, 0.24)
    : lerpColor(border, primary, 0.18);

  return {
    ...base,

    background,
    surface,
    surfaceElevated,
    surfaceLight,

    border,
    borderLight,

    text,
    textSecondary,
    textMuted,

    primary,
    primaryDark: lerpColor(primary, '#000000', 0.14),
    primaryText,

    primaryGlow: hexToRgba(primary, 0.18),
    primaryMedium: hexToRgba(primary, 0.3),
    primaryStrong: hexToRgba(primary, 0.58),

    primarySurface: lerpColor(surface, primary, 0.18),
    primarySurfaceStrong: lerpColor(surface, primary, 0.3),
    primaryBorder,

    selectedBackground,
    selectedBorder,
    selectedText: primary,

    buttonPrimaryBg: primary,
    buttonPrimaryBorder: lerpColor(primary, '#FFFFFF', 0.18),
    buttonPrimaryText: primaryText,

    warning: primary,
    glass,
    glassBorder,
    overlay: hexToRgba(background, 0.9),
  };
}

export function useColors() {
  const { settings } = useSettings();

  return useMemo(
    () => makeDynamicColors(settings.ui),
    [settings.ui],
  );
}

export { base as colors };
