export type BackgroundType = 'solid' | 'gradient' | 'image';

export type CardShape = 'rounded' | 'circle' | 'sharp' | 'soft';

export type GradientDirection = 'vertical' | 'horizontal' | 'diagonal';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface BackgroundSettings {
  type: BackgroundType;
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: GradientDirection;
  imageUri?: string;
}

export interface CardStyleSettings {
  shape: CardShape;
  backColor: string;
  frontColor: string;
  borderColor: string;
  matchedColor: string;
  textColor: string;
  borderWidth: number;
}

export interface GameBehaviorSettings {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  animationSpeed: AnimationSpeed;
  flipDelayMs: number;
  showTimer: boolean;
  showMoves: boolean;
  showScore: boolean;
}

export interface TotemSettings {
  attractScreenEnabled: boolean;
  attractTimeoutSeconds: number;
  attractMessage: string;
  autoResetAfterFinishSeconds: number;
  kioskMode: boolean;
}

export interface BrandingSettings {
  gameTitle: string;
  gameSubtitle: string;
  logoUri?: string;
}

export interface AppSettings {
  branding: BrandingSettings;
  background: BackgroundSettings;
  cardStyle: CardStyleSettings;
  gameBehavior: GameBehaviorSettings;
  totem: TotemSettings;
}