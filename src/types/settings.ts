export type BackgroundType      = 'solid' | 'gradient' | 'image';
export type CardShape           = 'sharp' | 'soft' | 'rounded' | 'circle';
export type GradientDirection   = 'vertical' | 'horizontal' | 'diagonal';
export type CardFlipStyle       = 'horizontal' | 'vertical' | 'fade' | 'zoom';
export type MatchAnimation      = 'bounce' | 'glow' | 'pulse' | 'none';
export type WinAnimation        = 'confetti' | 'stars' | 'none';
export type CardBackPattern     = 'solid' | 'dots' | 'grid' | 'emoji';
export type BorderStyleType     = 'none' | 'subtle' | 'normal' | 'bold' | 'glow';
export type UIFontSize          = 'small' | 'medium' | 'large' | 'xlarge';
export type GridColumns         = 2 | 3 | 4 | 5 | 6;
export type ButtonStyleType     = 'filled' | 'outlined' | 'flat';


export interface BackgroundSettings {
  type:               BackgroundType;
  solidColor:         string;
  gradientStart:      string;
  gradientEnd:        string;
  gradientDirection:  GradientDirection;
  imageUri?:          string;
  overlayOpacity:     number; // 0–1, sobreposto à imagem
}

export interface CardStyleSettings {
  shape:             CardShape;
  backColor:         string;
  backPattern:       CardBackPattern;
  backPatternEmoji:  string;
  backPatternColor:  string;
  frontColor:        string;
  borderColor:       string;
  borderStyleType:   BorderStyleType;
  borderWidth:       number;
  matchedColor:      string;
  matchedOpacity:    number; // 0.5–1.0
  textColor:         string;
  emojiSizeScale:    number; // 0.6–1.8
  shadowEnabled:     boolean;
  glowOnMatch:       boolean;
}

export interface AnimationSettings {
  enabled:         boolean;
  flipStyle:       CardFlipStyle;
  flipSpeedMs:     number;
  matchAnimation:  MatchAnimation;
  winAnimation:    WinAnimation;
}

export interface UISettings {
  primaryColor:   string;
  surfaceColor:   string;
  borderColor:    string;
  textColor:      string;
  fontSize:       UIFontSize;
  buttonStyle:    ButtonStyleType;
  globalRadius:   number; // raio global de bordas (0–32)
  useGlassmorphism: boolean;
}

export interface GameBehaviorSettings {
  soundEnabled:     boolean;
  flipDelayMs:      number;
  showTimer:        boolean;
  showMoves:        boolean;
  showScore:        boolean;
  gridColumns:      GridColumns;
  pairCountEasy:    number;
  pairCountMedium:  number;
  pairCountHard:    number;
  showLabels:       boolean; // mostra rótulo sob os emojis
  hintAfterSeconds: number;  // 0 = desabilitado
}

export interface TotemSettings {
  attractScreenEnabled:         boolean;
  attractTimeoutSeconds:        number;
  attractMessage:               string;
  autoResetAfterFinishSeconds:  number;
  kioskMode:                    boolean;
  showBranding:                 boolean;
}

export interface BrandingSettings {
  gameTitle:    string;
  gameSubtitle: string;
  logoUri?:     string;
  accentEmoji:  string;
}

export interface AppSettings {
  branding:     BrandingSettings;
  background:   BackgroundSettings;
  cardStyle:    CardStyleSettings;
  animation:    AnimationSettings;
  ui:           UISettings;
  gameBehavior: GameBehaviorSettings;
  totem:        TotemSettings;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};