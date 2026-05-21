import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { colors } from '@/constants/colors';

// Injeta meta tags PWA no HTML somente na web
if (Platform.OS === 'web') {
  const meta = [
    { name: 'viewport',          content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'theme-color',       content: colors.background },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
  ];

  meta.forEach(({ name, content }) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.name = name;
      document.head.appendChild(el);
    }
    el.content = content;
  });

  // Manifest link
  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel  = 'manifest';
    document.head.appendChild(link);
  }
  link.href = '/manifest.json';
}

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle:      { backgroundColor: colors.surface },
        headerTintColor:  colors.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        contentStyle:     { backgroundColor: colors.background },
        animation:        'slide_from_right',
      }}
    >
      <Stack.Screen name="index"           options={{ title: 'Início',        headerShown: false }} />
      <Stack.Screen name="game/index"      options={{ title: 'Partida',       headerShown: false }} />
      <Stack.Screen name="customize/index" options={{ title: 'Personalizar' }} />
      <Stack.Screen name="records/index"   options={{ title: 'Recordes' }} />
      <Stack.Screen name="settings/index"  options={{ title: 'Configurações' }} />
    </Stack>
  );
}