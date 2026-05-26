import { useEffect }    from 'react';
import { Platform }     from 'react-native';
import { Stack }        from 'expo-router';

import { SettingsProvider } from '@/contexts/SettingsContext';
import { ToastProvider }    from '@/components/ui/Toast';
import { colors }           from '@/constants/colors';

function usePWAMetaTags() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const set = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    set('viewport',                          'width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover');
    set('theme-color',                        colors.background);
    set('mobile-web-app-capable',            'yes');
    set('apple-mobile-web-app-capable',      'yes');
    set('apple-mobile-web-app-status-bar-style', 'black-translucent');
    set('apple-mobile-web-app-title',        'Jogo da Memória');

    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link); }
    link.href = '/manifest.json';
  }, []);
}

export default function RootLayout() {
  usePWAMetaTags();

  return (
    <SettingsProvider>
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
          <Stack.Screen name="records/index"   options={{ title: 'Histórico' }} />
          <Stack.Screen name="settings/index"  options={{ title: 'Configurações' }} />
        </Stack>
      </ToastProvider>
    </SettingsProvider>
  );
}