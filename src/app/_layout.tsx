import { Stack }    from 'expo-router';
import { Platform } from 'react-native';

import { ToastProvider } from '@/components/ui/Toast';
import { colors }        from '@/constants/colors';

if (Platform.OS === 'web') {
  const injectMeta = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
    el.content = content;
  };

  injectMeta('viewport',                         'width=device-width, initial-scale=1, viewport-fit=cover');
  injectMeta('theme-color',                      colors.background);
  injectMeta('mobile-web-app-capable',           'yes');
  injectMeta('apple-mobile-web-app-capable',     'yes');
  injectMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');

  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link); }
  link.href = '/manifest.json';
}

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerStyle:      { backgroundColor: colors.surface },
          headerTintColor:  colors.text,
          headerTitleStyle: { fontWeight: '800', fontSize: 18 },
          contentStyle:     { backgroundColor: colors.background },
          animation:        'slide_from_right',
        }}
      >
        <Stack.Screen name="index"           options={{ headerShown: false }} />
        <Stack.Screen name="game/index"      options={{ headerShown: false }} />
        <Stack.Screen name="customize/index" options={{ title: 'Personalizar' }} />
        <Stack.Screen name="records/index"   options={{ title: 'Recordes' }} />
        <Stack.Screen name="settings/index"  options={{ title: 'Configurações' }} />
      </Stack>
    </ToastProvider>
  );
}