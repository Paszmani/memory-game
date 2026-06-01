import type { AppSettings } from '@/types/settings';

export type VisualThemePatch = {
  branding?: Partial<AppSettings['branding']>;
  background?: Partial<AppSettings['background']>;
  cardStyle?: Partial<AppSettings['cardStyle']>;
  animation?: Partial<AppSettings['animation']>;
  ui?: Partial<AppSettings['ui']>;
  totem?: Partial<AppSettings['totem']>;
};

export interface VisualThemePreset {
  id: string;
  name: string;
  emoji?: string;
  preview: string[];
  patch: VisualThemePatch;
  createdAt: string;
  updatedAt: string;
}