import type {
  AppSettings,
  CardFlipStyle,
  CardShape,
  UIFontSize,
} from '@/types/settings';

export const DEFAULT_SETTINGS: AppSettings = {
  branding: {
    gameTitle: 'Jogo da Memória',
    gameSubtitle: 'Encontre todos os pares!',
    accentEmoji: '🧠',
  },

  background: {
    type: 'gradient',
    solidColor: '#0A0F1E',
    gradientStart: '#0A0F1E',
    gradientEnd: '#1A2744',
    gradientDirection: 'vertical',
    overlayOpacity: 0.3,
  },

  cardStyle: {
    shape: 'rounded',
    backColor: '#141B2D',
    backPattern: 'emoji',
    backPatternEmoji: '⭐',
    backPatternColor: '#4FC3F7',
    frontColor: '#1E2A42',
    borderColor: '#4FC3F7',
    borderStyleType: 'normal',
    borderWidth: 2,
    matchedColor: '#00E676',
    matchedOpacity: 0.85,
    textColor: '#F0F4FF',
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
    primaryColor: '#4FC3F7',
    surfaceColor: '#141B2D',
    borderColor: '#2A3A5C',
    textColor: '#F0F4FF',
    fontSize: 'medium',
    buttonStyle: 'filled',
    globalRadius: 16,
    useGlassmorphism: false,
  },

  gameBehavior: {
    soundEnabled: true,
    flipDelayMs: 800,
    showTimer: true,
    showMoves: true,
    showScore: true,
    gridColumns: 4,
    pairCountEasy: 4,
    pairCountMedium: 8,
    pairCountHard: 12,
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

export const FLIP_SPEED_MS: Record<CardFlipStyle, number> = {
  horizontal: 300,
  vertical: 300,
  fade: 220,
  zoom: 260,
};

export const FONT_SIZE_SCALE: Record<UIFontSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
  xlarge: 1.35,
};
