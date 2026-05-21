import { useWindowDimensions } from 'react-native';

export interface ResponsiveValues {
  width:        number;
  height:       number;
  isSmall:      boolean;  // < 380
  isMedium:     boolean;  // 380–767
  isLarge:      boolean;  // >= 768
  isTablet:     boolean;
  isLandscape:  boolean;
  sp: {           // Spacing
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fs: {           // Font sizes
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  cardSize:     number;  // Tamanho ideal de carta baseado na tela
  maxColumns:   number;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  const isSmall     = width < 380;
  const isLarge     = width >= 768;
  const isMedium    = !isSmall && !isLarge;
  const isLandscape = width > height;

  const base = isSmall ? 0.85 : isLarge ? 1.15 : 1.0;

  return {
    width,
    height,
    isSmall,
    isMedium,
    isLarge,
    isTablet:    isLarge,
    isLandscape,

    sp: {
      xs: Math.round(4  * base),
      sm: Math.round(8  * base),
      md: Math.round(16 * base),
      lg: Math.round(24 * base),
      xl: Math.round(32 * base),
    },

    fs: {
      xs:  Math.round(10 * base),
      sm:  Math.round(12 * base),
      md:  Math.round(15 * base),
      lg:  Math.round(18 * base),
      xl:  Math.round(24 * base),
      xxl: Math.round(36 * base),
    },

    cardSize:   Math.floor((Math.min(width, height * 0.7) - 60) / 4),
    maxColumns: isLarge ? 6 : isMedium ? 5 : 4,
  };
}