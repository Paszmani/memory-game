import { useEffect, useLayoutEffect, useState } from 'react';

import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';

import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { ToastProvider } from '@/components/ui/Toast';
import { colors as base } from '@/constants/colors';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ThemesProvider } from '@/contexts/ThemesContext';
import type { FontFamilyOption } from '@/types/settings';

const GOOGLE_FONTS_URL: Partial<Record<FontFamilyOption, string>> = {
  inter:
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap',
  poppins:
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap',
  nunito:
    'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap',
  roboto:
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
  montserrat:
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap',
};

const FONT_CSS_FAMILY: Record<FontFamilyOption, string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  inter: '"Inter", system-ui, sans-serif',
  poppins: '"Poppins", system-ui, sans-serif',
  nunito: '"Nunito", system-ui, sans-serif',
  roboto: '"Roboto", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
};

const useWebLayoutEffect = Platform.OS === 'web' ? useLayoutEffect : useEffect;

function hexToRgba(hex: string, opacity: number) {
  const clean = hex.replace('#', '');

  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;

  return `rgba(${r},${g},${b},${opacity})`;
}

function ensureMeta(name: string, content: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  let element = document.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function ensureStyle(id: string, css: string) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  let style = document.getElementById(id) as HTMLStyleElement | null;

  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }

  style.textContent = css;
}

function useWebBootstrap() {
  const [isReady, setIsReady] = useState(Platform.OS !== 'web');

  useWebLayoutEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      setIsReady(true);
      return;
    }

    ensureMeta(
      'viewport',
      'width=device-width,initial-scale=1,viewport-fit=cover',
    );
    ensureMeta('theme-color', base.background);
    ensureMeta('mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    ensureMeta('apple-mobile-web-app-title', 'Jogo da Memória');

    let manifestLink = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    );

    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }

    manifestLink.href = './manifest.json';

    ensureStyle(
      'memory-game-web-base-style',
      `
        html,
        body,
        #root {
          width: 100%;
          min-width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          background: ${base.background};
        }

        html,
        body {
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        body {
          position: relative;
        }

        #root {
          display: flex;
          flex-direction: column;
        }

        #root > div {
          min-height: 100vh;
          min-height: 100dvh;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        input,
        textarea,
        button,
        select {
          font: inherit;
        }

        ::-webkit-scrollbar {
          display: none;
        }
      `,
    );

    document.body.style.backgroundColor = base.background;
    document.documentElement.style.backgroundColor = base.background;

    setIsReady(true);
  }, []);

  return isReady;
}

function WebThemeApplier() {
  const { settings } = useSettings();
  const { fontFamily, primaryColor } = settings.ui;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const fontUrl = GOOGLE_FONTS_URL[fontFamily];

    if (fontUrl) {
      const id = `gf-${fontFamily}`;

      if (!document.getElementById(id)) {
        const link = document.createElement('link');

        link.id = id;
        link.rel = 'stylesheet';
        link.href = fontUrl;

        document.head.appendChild(link);
      }
    }

    const cssFamily = FONT_CSS_FAMILY[fontFamily] ?? FONT_CSS_FAMILY.system;

    ensureStyle(
      'rn-font-override',
      `
        *,
        *::before,
        *::after {
          font-family: ${cssFamily} !important;
        }
      `,
    );
  }, [fontFamily]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;

    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-glow', hexToRgba(primaryColor, 0.15));
    root.style.setProperty('--primary-medium', hexToRgba(primaryColor, 0.3));
    root.style.setProperty('--primary-strong', hexToRgba(primaryColor, 0.6));
  }, [primaryColor]);

  return null;
}

function AppStack() {
  const { settings } = useSettings();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: base.surface,
        },
        headerTintColor: settings.ui.primaryColor,
        headerTitleStyle: {
          color: base.text,
          fontWeight: '800',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: base.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="game/index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="customize/index"
        options={{
          title: 'Personalizar',
          headerShown: true,
          headerBackTitle: 'Início',
        }}
      />

      <Stack.Screen
        name="records/index"
        options={{
          title: 'Recordes',
          headerShown: true,
          headerBackTitle: 'Início',
        }}
      />

      <Stack.Screen
        name="settings/index"
        options={{
          title: 'Configurações',
          headerShown: true,
          headerBackTitle: 'Início',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const isWebReady = useWebBootstrap();

  if (!isWebReady) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SettingsProvider>
        <ThemesProvider>
          <ToastProvider>
            <ConfirmProvider>
              <WebThemeApplier />
              <AppStack />
            </ConfirmProvider>
          </ToastProvider>
        </ThemesProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}