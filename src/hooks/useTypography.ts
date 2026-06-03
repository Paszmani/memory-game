import { useMemo } from 'react';
import { Platform, TextStyle } from 'react-native';

import { useSettings } from '@/contexts/SettingsContext';
import type { FontFamilyOption } from '@/types/settings';

export type AppFontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'black';

export const WEB_FONT_FAMILY: Record<FontFamilyOption, string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  inter: '"Inter", system-ui, sans-serif',
  poppins: '"Poppins", system-ui, sans-serif',
  nunito: '"Nunito", system-ui, sans-serif',
  roboto: '"Roboto", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
};

const NATIVE_GOOGLE_FONTS = {
  inter: {
    regular: 'Inter_400Regular',
    medium: 'Inter_600SemiBold',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    black: 'Inter_900Black',
  },
  poppins: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_600SemiBold',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    black: 'Poppins_900Black',
  },
  nunito: {
    regular: 'Nunito_400Regular',
    medium: 'Nunito_600SemiBold',
    semibold: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
    black: 'Nunito_900Black',
  },
  roboto: {
    regular: 'Roboto_400Regular',
    medium: 'Roboto_500Medium',
    semibold: 'Roboto_500Medium',
    bold: 'Roboto_700Bold',
    black: 'Roboto_900Black',
  },
  montserrat: {
    regular: 'Montserrat_400Regular',
    medium: 'Montserrat_600SemiBold',
    semibold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
    black: 'Montserrat_900Black',
  },
} as const;

function getNativeGenericFamily(option: FontFamilyOption): string | undefined {
  if (option === 'system') {
    return undefined;
  }

  if (option === 'serif') {
    return Platform.OS === 'ios' ? 'Georgia' : 'serif';
  }

  if (option === 'mono') {
    return Platform.OS === 'ios' ? 'Courier New' : 'monospace';
  }

  return undefined;
}

export function resolveFontFamily(
  option: FontFamilyOption,
  weight: AppFontWeight = 'regular',
): string | undefined {
  if (Platform.OS === 'web') {
    return WEB_FONT_FAMILY[option];
  }

  if (option in NATIVE_GOOGLE_FONTS) {
    const key = option as keyof typeof NATIVE_GOOGLE_FONTS;
    return NATIVE_GOOGLE_FONTS[key][weight] ?? NATIVE_GOOGLE_FONTS[key].regular;
  }

  return getNativeGenericFamily(option);
}

export function getFontStyle(
  option: FontFamilyOption,
  weight: AppFontWeight = 'regular',
): TextStyle {
  const fontFamily = resolveFontFamily(option, weight);
  return fontFamily ? { fontFamily } : {};
}

export function useTypography() {
  const { settings } = useSettings();
  const currentFont = settings.ui.fontFamily ?? 'system';

  return useMemo(
    () => ({
      currentFont,
      webCssFamily: WEB_FONT_FAMILY[currentFont],
      getFontFamily: (
        option: FontFamilyOption = currentFont,
        weight: AppFontWeight = 'regular',
      ) => resolveFontFamily(option, weight),
      getFontStyle: (
        weight: AppFontWeight = 'regular',
        option: FontFamilyOption = currentFont,
      ) => getFontStyle(option, weight),
    }),
    [currentFont],
  );
}
