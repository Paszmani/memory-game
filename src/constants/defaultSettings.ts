import { AppSettings } from '@/types/settings';

export const DEFAULT_SETTINGS: AppSettings = {
  branding: {
    gameTitle:    'Jogo da Memória',
    gameSubtitle: 'Encontre todos os pares!',
    accentEmoji:  '🧠',
  },

  background: {
    type:              'gradient',
    solidColor:        '#0A0F1E',
    gradientStart:     '#0A0F1E',
    gradientEnd:       '#1A2744',
    gradientDirection: 'vertical',
    overlayOpacity:    0.3,
  },

  cardStyle: {
    shape:             'rounded',
    backColor:         '#141B2D',
    backPattern:       'solid',
    backPatternEmoji:  '⭐',
    backPatternColor:  '#2A3A5C',
    frontColor:        '#1E2A42',
    borderColor:       '#4FC3F7',
    borderStyleType:   'normal',
    borderWidth:       2,
    matchedColor:      '#00E676',
    matchedOpacity:    0.85,
    textColor:         '#F0F4FF',
    emojiSizeScale:    1.0,
    shadowEnabled:     true,
    glowOnMatch:       true,
  },

  animation: {
    enabled:        true,
    flipStyle:      'horizontal',
    flipSpeedMs:    300,
    matchAnimation: 'bounce',
    winAnimation:   'stars',
  },

  ui: {
    primaryColor:     '#4FC3F7',
    surfaceColor:     '#141B2D',
    borderColor:      '#2A3A5C',
    textColor:        '#F0F4FF',
    fontSize:         'medium',
    buttonStyle:      'filled',
    globalRadius:     16,
    useGlassmorphism: false,
  },

  gameBehavior: {
    soundEnabled:     true,
    flipDelayMs:      800,
    showTimer:        true,
    showMoves:        true,
    showScore:        true,
    gridColumns:      4,
    pairCountEasy:    4,
    pairCountMedium:  8,
    pairCountHard:    12,
    showLabels:       false,
    hintAfterSeconds: 0,
  },

  totem: {
    attractScreenEnabled:         true,
    attractTimeoutSeconds:        30,
    attractMessage:               'Toque para jogar!',
    autoResetAfterFinishSeconds:  15,
    kioskMode:                    false,
    showBranding:                 true,
  },
};

// Raios de borda por formato de carta
export const CARD_BORDER_RADIUS: Record<string, number> = {
  sharp:   4,
  soft:    12,
  rounded: 20,
  circle:  999,
};

// Velocidade de animação em ms
export const FLIP_SPEED_MS: Record<string, number> = {
  slow:    600,
  normal:  300,
  fast:    150,
};

// Tamanho de fonte base por escala
export const FONT_SIZE_SCALE: Record<string, number> = {
  small:   0.85,
  medium:  1.0,
  large:   1.15,
  xlarge:  1.35,
};