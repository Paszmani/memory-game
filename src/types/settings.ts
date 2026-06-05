export type BackgroundType = 'solid' | 'gradient' | 'image';

export type CardShape = 'sharp' | 'soft' | 'rounded' | 'circle';

export type CardSizeOption = 'small' | 'medium' | 'large';

export type GradientDirection = 'vertical' | 'horizontal' | 'diagonal';

export type CardFlipStyle = 'horizontal' | 'vertical' | 'fade' | 'zoom';

export type MatchAnimation = 'bounce' | 'glow' | 'pulse' | 'none';

export type WinAnimation = 'confetti' | 'stars' | 'none';

export type CardBackPattern =
  | 'solid'
  | 'dots'
  | 'grid'
  | 'emoji'
  | 'image';

export type BorderStyleType =
  | 'none'
  | 'subtle'
  | 'normal'
  | 'bold'
  | 'glow';

export type UIFontSize = 'small' | 'medium' | 'large' | 'xlarge';

export type GridColumns = 2 | 3 | 4 | 5 | 6;

export type ButtonStyleType = 'filled' | 'outlined' | 'flat';

export type FontFamilyOption =
  | 'system'
  | 'inter'
  | 'poppins'
  | 'nunito'
  | 'roboto'
  | 'montserrat'
  | 'serif'
  | 'mono';

export interface BackgroundSettings {
  type: BackgroundType;
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: GradientDirection;
  imageUri?: string;
  overlayOpacity: number;
}

export interface CardStyleSettings {
  shape: CardShape;

  /**
   * Controla o tamanho visual das cartas no jogo.
   * O MemoryBoard usa esse valor para ajustar o tamanho e a distribuição.
   */
  cardSize: CardSizeOption;

  backColor: string;
  backPattern: CardBackPattern;
  backPatternEmoji: string;
  backPatternColor: string;
  backImageUri?: string;

  frontColor: string;

  borderColor: string;
  borderStyleType: BorderStyleType;
  borderWidth: number;

  matchedColor: string;
  matchedOpacity: number;

  textColor: string;
  emojiSizeScale: number;

  shadowEnabled: boolean;
  glowOnMatch: boolean;
}

export interface AnimationSettings {
  enabled: boolean;
  flipStyle: CardFlipStyle;
  flipSpeedMs: number;
  matchAnimation: MatchAnimation;
  winAnimation: WinAnimation;
}

export interface UISettings {
  primaryColor: string;
  surfaceColor: string;
  borderColor: string;
  textColor: string;
  fontSize: UIFontSize;
  fontFamily: FontFamilyOption;
  buttonStyle: ButtonStyleType;
  globalRadius: number;
  useGlassmorphism: boolean;
}

export interface GameBehaviorSettings {
  soundEnabled: boolean;
  flipDelayMs: number;
  showTimer: boolean;
  showMoves: boolean;
  gridColumns: GridColumns;
  pairCount: number;
  showLabels: boolean;
  hintAfterSeconds: number;
}

export interface TotemSettings {
  attractScreenEnabled: boolean;
  attractTimeoutSeconds: number;
  attractMessage: string;
  attractCenterImageUri?: string;
  autoResetAfterFinishSeconds: number;
  kioskMode: boolean;
  showBranding: boolean;
}

export interface BrandingSettings {
  gameTitle: string;
  gameSubtitle: string;
  logoUri?: string;
  accentEmoji: string;
}

export interface AppSettings {
  branding: BrandingSettings;
  background: BackgroundSettings;
  cardStyle: CardStyleSettings;
  animation: AnimationSettings;
  ui: UISettings;
  gameBehavior: GameBehaviorSettings;
  totem: TotemSettings;
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};