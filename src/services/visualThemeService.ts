import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getJson, setJson } from '@/services/storageService';
import type { AppSettings } from '@/types/settings';
import type { VisualThemePreset } from '@/types/visualTheme';
import { createId } from '@/utils/id';

export async function getVisualThemes(): Promise<VisualThemePreset[]> {
  return getJson<VisualThemePreset[]>(STORAGE_KEYS.visualThemes, []);
}

export async function createVisualThemeFromSettings(
  name: string,
  settings: AppSettings,
): Promise<VisualThemePreset> {
  const savedThemes = await getVisualThemes();
  const now = new Date().toISOString();

  const visualTheme: VisualThemePreset = {
    id: createId('visual_theme'),
    name: name.trim(),
    emoji: settings.branding.accentEmoji || '🎨',
    preview: [
      settings.background.type === 'solid'
        ? settings.background.solidColor
        : settings.background.gradientStart,
      settings.ui.primaryColor,
    ],
    patch: {
      branding: {
        gameTitle: settings.branding.gameTitle,
        gameSubtitle: settings.branding.gameSubtitle,
        logoUri: settings.branding.logoUri,
        accentEmoji: settings.branding.accentEmoji,
      },
      background: settings.background,
      cardStyle: settings.cardStyle,
      animation: settings.animation,
      ui: settings.ui,
      totem: {
        attractMessage: settings.totem.attractMessage,
        attractCenterImageUri: settings.totem.attractCenterImageUri,
        showBranding: settings.totem.showBranding,
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  await setJson(STORAGE_KEYS.visualThemes, [visualTheme, ...savedThemes]);

  return visualTheme;
}

export async function deleteVisualTheme(themeId: string): Promise<void> {
  const savedThemes = await getVisualThemes();
  const next = savedThemes.filter((theme) => theme.id !== themeId);

  await setJson(STORAGE_KEYS.visualThemes, next);
}