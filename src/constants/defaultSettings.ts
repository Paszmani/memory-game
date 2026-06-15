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
    gameSubtitle: 'GRUPO SB',
    accentEmoji: '',
    finishTitle: 'Parabéns!',
    finishMessage: 'Você completou o jogo!',
  },

  background: {
    type: 'gradient',
    solidColor: '#0A0A0A',
    gradientStart: '#0A0A0A',
    gradientEnd: '#1A1A0A',
    gradientDirection: 'vertical',
    overlayOpacity: 0.3,
  },

  cardStyle: {
    shape: 'rounded',
    cardSize: 'medium',

    backColor: '#141414',
    backPattern: 'solid',
    backPatternEmoji: '⭐',
    backPatternColor: '#2A2A2A',

    frontColor: '#1E1E1E',

    borderColor: '#FFD600',
    borderStyleType: 'normal',
    borderWidth: 2,

    matchedColor: '#FFFFFF',
    matchedOpacity: 0.85,

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
    primaryColor: '#FFD600',
    surfaceColor: '#141414',
    borderColor: '#2A2A2A',
    textColor: '#FFFFFF',
    fontSize: 'medium',
    fontFamily: 'system',
    buttonStyle: 'filled',
    globalRadius: 16,
    useGlassmorphism: false,
  },

  gameBehavior: {
    soundEnabled: true,
    flipDelayMs: 800,
    previewCardsOnStart: true,
    previewCardsDurationMs: 5000,
    showTimer: true,
    showMoves: true,
    gridColumns: 4,
    pairCount: 8,
    showLabels: false,
    hintAfterSeconds: 0,
  },

  totem: {
    attractScreenEnabled: true,
    attractTimeoutSeconds: 30,
    attractMessage: 'Toque para jogar!',
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