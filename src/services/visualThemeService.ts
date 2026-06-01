import { STORAGE_KEYS } from '@/constants/storageKeys';
import { getJson, setJson } from '@/services/storageService';
import type { AppSettings } from '@/types/settings';
import type { VisualThemePreset } from '@/types/visualTheme';
import { createId } from '@/utils/id';

function getBackgroundPreviewColor(settings: AppSettings) {
  if (settings.background.type === 'solid') {
    return settings.background.solidColor;
  }

  return settings.background.gradientStart;
}

function getSecondPreviewColor(settings: AppSettings) {
  if (settings.background.type === 'gradient') {
    return settings.background.gradientEnd;
  }

  return settings.ui.primaryColor;
}

export async function getVisualThemes(): Promise<VisualThemePreset[]> {
  return getJson<VisualThemePreset[]>(STORAGE_KEYS.visualThemes, []);
}

export async function saveVisualThemes(
  themes: VisualThemePreset[],
): Promise<void> {
  await setJson(STORAGE_KEYS.visualThemes, themes);
}

export async function createVisualThemeFromSettings(
  name: string,
  settings: AppSettings,
): Promise<VisualThemePreset> {
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    throw new Error('O nome do tema visual deve ter pelo menos 2 caracteres.');
  }

  const currentThemes = await getVisualThemes();
  const now = new Date().toISOString();

  const visualTheme: VisualThemePreset = {
    id: createId('visual_theme'),
    name: trimmedName,
    emoji: settings.branding.accentEmoji || '🎨',
    preview: [
      getBackgroundPreviewColor(settings),
      getSecondPreviewColor(settings),
    ],
    patch: {
      branding: {
        gameTitle: settings.branding.gameTitle,
        gameSubtitle: settings.branding.gameSubtitle,
        logoUri: settings.branding.logoUri,
        accentEmoji: settings.branding.accentEmoji,
      },

      background: {
        ...settings.background,
      },

      cardStyle: {
        ...settings.cardStyle,
      },

      animation: {
        ...settings.animation,
      },

      ui: {
        ...settings.ui,
      },

      totem: {
        attractMessage: settings.totem.attractMessage,
        attractCenterImageUri: settings.totem.attractCenterImageUri,
        showBranding: settings.totem.showBranding,
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  await saveVisualThemes([visualTheme, ...currentThemes]);

  return visualTheme;
}

export async function deleteVisualTheme(themeId: string): Promise<void> {
  const currentThemes = await getVisualThemes();

  const nextThemes = currentThemes.filter((theme) => theme.id !== themeId);

  await saveVisualThemes(nextThemes);
}