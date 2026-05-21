import { useEffect } from 'react';

import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { colors } from '@/constants/colors';

function usePwaMetaTags() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const metaTags = [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        name: 'theme-color',
        content: colors.background,
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
    ];

    metaTags.forEach(({ name, content }) => {
      let element = document.querySelector<HTMLMetaElement>(
        `meta[name="${name}"]`,
      );

      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }

      element.content = content;
    });

    let manifestLink = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    );

    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }

    manifestLink.href = '/manifest.json';
  }, []);
}

export default function RootLayout() {
  usePwaMetaTags();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Início', headerShown: false }}
      />

      <Stack.Screen
        name="game/index"
        options={{ title: 'Partida', headerShown: false }}
      />

      <Stack.Screen
        name="customize/index"
        options={{ title: 'Personalizar' }}
      />

      <Stack.Screen
        name="records/index"
        options={{ title: 'Recordes' }}
      />

      <Stack.Screen
        name="settings/index"
        options={{ title: 'Configurações' }}
      />
    </Stack>
  );
}