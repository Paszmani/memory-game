import { DEFAULT_ASSETS } from '@/constants/defaultAssets';

import type {
  AppSettings,
  CardShape,
  CardSizeOption,
  FontFamilyOption,
  UIFontSize,
} from '@/types/settings';

export const DEFAULT_SETTINGS: AppSettings = {
  branding: {
    gameTitle: 'Jogo da Memória',
    gameSubtitle: 'Encontre os pares',
    logoUri: DEFAULT_ASSETS.logo,
    accentEmoji: '',
    finishTitle: 'Parabéns!',
    finishMessage: 'Você completou o jogo!',
  },

  background: {
    type: 'image',
    solidColor: '#020B1F',
    gradientStart: '#020B1F',
    gradientEnd: '#0D47A1',
    gradientDirection: 'vertical',
    imageUri: DEFAULT_ASSETS.background,
    overlayOpacity: 0,
  },

  cardStyle: {
    shape: 'rounded',
    cardSize: 'medium',

    backColor: '#061A3D',

    /*
     * Verso padrão das cartas:
     * usa a imagem assets/default/logo-compro-card.png
     */
    backPattern: 'image',
    backImageUri: DEFAULT_ASSETS.logo,
    backPatternEmoji: '',
    backPatternColor: '#1E5AA8',

    frontColor: '#082653',

    borderColor: '#1E5AA8',
    borderStyleType: 'normal',
    borderWidth: 2,

    matchedColor: '#0D47A1',
    matchedOpacity: 0.88,

    textColor: '#FFFFFF',
    emojiSizeScale: 1,

    shadowEnabled: true,
    glowOnMatch: true,
  },

  animation: {
    enabled: true,
    flipStyle: 'horizontal',
    flipSpeedMs: 300,
    matchAnimation: 'bounce',
    winAnimation: 'stars',
  },

  ui: {
    primaryColor: '#0D47A1',
    surfaceColor: '#061A3D',
    borderColor: '#1E5AA8',
    textColor: '#FFFFFF',
    fontSize: 'medium',
    fontFamily: 'system',
    buttonStyle: 'filled',
    globalRadius: 18,
    useGlassmorphism: false,
  },

  gameBehavior: {
    soundEnabled: true,
    flipDelayMs: 800,
    showTimer: true,
    showMoves: true,
    gridColumns: 4,
    pairCount: 10,
    showLabels: false,
    hintAfterSeconds: 0,
  },

  totem: {
    attractScreenEnabled: true,
    attractTimeoutSeconds: 30,
    attractMessage: 'Toque para jogar!',
    attractCenterImageUri: DEFAULT_ASSETS.logo,
    autoResetAfterFinishSeconds: 15,
    kioskMode: false,
    showBranding: true,
  },
};

export const CARD_BORDER_RADIUS: Record<CardShape, number> = {
  sharp: 4,
  soft: 12,
  rounded: 20,
  circle: 999,
};

export const CARD_SIZE_SCALE: Record<CardSizeOption, number> = {
  small: 0.82,
  medium: 1,
  large: 1.22,
};

export const FONT_SIZE_SCALE: Record<UIFontSize, number> = {
  small: 0.82,
  medium: 1,
  large: 1.2,
  xlarge: 1.45,
};

export const FONT_FAMILY_MAP: Record<FontFamilyOption, string> = {
  system: 'System',
  inter: 'Inter_400Regular',
  poppins: 'Poppins_400Regular',
  nunito: 'Nunito_400Regular',
  roboto: 'Roboto_400Regular',
  montserrat: 'Montserrat_400Regular',
  serif: 'Georgia, serif',
  mono: 'Courier New, monospace',
};