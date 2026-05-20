import { AppSettings } from '@/types/settings';

export const DEFAULT_SETTINGS: AppSettings = {
  branding: {
    gameTitle:    'Jogo da Memória',
    gameSubtitle: 'Encontre todos os pares!',
  },

  background: {
    type:               'gradient',
    solidColor:         '#0A0F1E',
    gradientStart:      '#0A0F1E',
    gradientEnd:        '#1A2744',
    gradientDirection:  'vertical',
  },

  cardStyle: {
    shape:        'rounded',
    backColor:    '#141B2D',
    frontColor:   '#1E2A42',
    borderColor:  '#4FC3F7',
    matchedColor: '#00E676',
    textColor:    '#F0F4FF',
    borderWidth:  2,
  },

  gameBehavior: {
    soundEnabled:      true,
    animationsEnabled: true,
    animationSpeed:    'normal',
    flipDelayMs:       800,
    showTimer:         true,
    showMoves:         true,
    showScore:         true,
  },

  totem: {
    attractScreenEnabled:          true,
    attractTimeoutSeconds:         30,
    attractMessage:                'Toque para jogar!',
    autoResetAfterFinishSeconds:   15,
    kioskMode:                     false,
  },
};

export const ANIMATION_SPEED_MS: Record<string, number> = {
  slow:   600,
  normal: 350,
  fast:   180,
};

export const CARD_BORDER_RADIUS: Record<string, number> = {
  sharp:   4,
  soft:    12,
  rounded: 20,
  circle:  999,
};