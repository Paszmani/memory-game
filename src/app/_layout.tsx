import { useEffect, type ReactNode } from 'react';

import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Platform, Text, TextInput } from 'react-native';

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter';

import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';

import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';

import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from '@expo-google-fonts/roboto';

import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';

import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { ToastProvider } from '@/components/ui/Toast';
import { colors as baseColors } from '@/constants/colors';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import { ThemesProvider } from '@/contexts/ThemesContext';
import { WEB_FONT_FAMILY, resolveFontFamily } from '@/hooks/useTypography';

const GOOGLE_FONTS_URL: Record<string, string> = {
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

function hexToRgba(hex: string, opacity: number) {
  const cleanHex = hex.replace('#', '');

  const r = parseInt(cleanHex.slice(0, 2), 16) || 0;
  const g = parseInt(cleanHex.slice(2, 4), 16) || 0;
  const b = parseInt(cleanHex.slice(4, 6), 16) || 0;

  return `rgba(${r},${g},${b},${opacity})`;
}

function FontLoader({ children }: { children: ReactNode }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,

    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,

    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_900Black,

    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,

    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
}

function NativeFontApplier() {
  const { settings } = useSettings();
  const nativeFontFamily = resolveFontFamily(settings.ui.fontFamily, 'regular');

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const TextComponent = Text as typeof Text & {
      defaultProps?: { style?: unknown };
    };

    const TextInputComponent = TextInput as typeof TextInput & {
      defaultProps?: { style?: unknown };
    };

    const previousTextDefaults = TextComponent.defaultProps;
    const previousInputDefaults = TextInputComponent.defaultProps;

    const fontStyle = nativeFontFamily
      ? {
          fontFamily: nativeFontFamily,
        }
      : undefined;

    TextComponent.defaultProps = {
      ...previousTextDefaults,
      style: [fontStyle, previousTextDefaults?.style],
    };

    TextInputComponent.defaultProps = {
      ...previousInputDefaults,
      style: [fontStyle, previousInputDefaults?.style],
    };

    return () => {
      TextComponent.defaultProps = previousTextDefaults;
      TextInputComponent.defaultProps = previousInputDefaults;
    };
  }, [nativeFontFamily]);

  return null;
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

    const cssFamily = WEB_FONT_FAMILY[fontFamily] ?? WEB_FONT_FAMILY.system;

    let styleElement = document.getElementById(
      'rn-font-override',
    ) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'rn-font-override';
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      *, *::before, *::after {
        font-family: ${cssFamily} !important;
      }
    `;
  }, [fontFamily]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;

    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-glow', hexToRgba(primaryColor, 0.18));
    root.style.setProperty('--primary-medium', hexToRgba(primaryColor, 0.32));
    root.style.setProperty('--primary-strong', hexToRgba(primaryColor, 0.62));
  }, [primaryColor]);

  return null;
}

function useWebSetup() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    setMeta(
      'viewport',
      'width=device-width,initial-scale=1,viewport-fit=cover',
    );
    setMeta('theme-color', baseColors.background);
    setMeta('mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title', 'Jogo da Memória');

    let manifestLink = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    );

    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }

    manifestLink.href = './manifest.json';

    const styleId = 'memory-game-web-base-style';

    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');

      style.id = styleId;
      style.textContent = `
        html, body, #root {
          min-height: 100%;
          background: ${baseColors.background};
        }

        body {
          margin: 0;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        * {
          -webkit-tap-highlight-color: transparent;
          box-sizing: border-box;
        }

        ::-webkit-scrollbar {
          display: none;
        }
      `;

      document.head.appendChild(style);
    }

    document.body.style.backgroundColor = baseColors.background;
    document.documentElement.style.backgroundColor = baseColors.background;
  }, []);
}

function AppStack() {
  const { settings } = useSettings();
  const { primaryColor } = settings.ui;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: baseColors.surface,
        },
        headerTintColor: primaryColor,
        headerTitleStyle: {
          color: baseColors.text,
          fontWeight: '800',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: baseColors.background,
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
  useWebSetup();

  return (
    <FontLoader>
      <SettingsProvider>
        <ThemesProvider>
          <ToastProvider>
            <ConfirmProvider>
              <NativeFontApplier />
              <WebThemeApplier />
              <AppStack />
            </ConfirmProvider>
          </ToastProvider>
        </ThemesProvider>
      </SettingsProvider>
    </FontLoader>
  );
}