import { useMemo } from 'react';

import { colors as base } from '@/constants/colors';
import { useSettings } from '@/contexts/SettingsContext';

function normalizeHex(value: string | undefined, fallback: string) {
  if (!value) return fallback;

  const raw = value.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(raw)) {
    return raw;
  }

  if (/^#[0-9A-Fa-f]{3}$/.test(raw)) {
    const r = raw[1];
    const g = raw[2];
    const b = raw[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return fallback;
}

function hexToRgba(hex: string | undefined, alpha: number, fallback = '#000000') {
  const safeHex = normalizeHex(hex, fallback).replace('#', '');

  const r = parseInt(safeHex.slice(0, 2), 16);
  const g = parseInt(safeHex.slice(2, 4), 16);
  const b = parseInt(safeHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function useColors() {
  const { settings } = useSettings();

  const primary = normalizeHex(settings.ui.primaryColor, base.primary);
  const surface = normalizeHex(settings.ui.surfaceColor, base.surface);
  const border = normalizeHex(settings.ui.borderColor, base.border);
  const text = normalizeHex(settings.ui.textColor, base.text);

  return useMemo(
    () => ({
      ...base,

      primary,
      surface,
      surfaceElevated: surface,
      border,
      borderLight: border,
      text,
      textSecondary: hexToRgba(text, 0.78, base.text),
      textMuted: hexToRgba(text, 0.48, base.text),

      glass: hexToRgba(surface, 0.82, base.surface),
      glassBorder: hexToRgba(primary, 0.25, base.primary),

      primaryGlow: hexToRgba(primary, 0.15, base.primary),
      primaryMedium: hexToRgba(primary, 0.3, base.primary),
      primaryStrong: hexToRgba(primary, 0.6, base.primary),
      primaryBorder: hexToRgba(primary, 0.35, base.primary),
      primarySurface: hexToRgba(primary, 0.1, base.primary),
      primarySurfaceStrong: hexToRgba(primary, 0.18, base.primary),

      buttonPrimaryBg: primary,
      buttonPrimaryBorder: primary,
      buttonPrimaryText: '#0A0A0A',
    }),
    [primary, surface, border, text],
  );
}

export { base as colors };