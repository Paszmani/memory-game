import { useEffect }    from 'react';
import { Platform }     from 'react-native';
import { Stack }        from 'expo-router';

import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemesProvider }   from '@/contexts/ThemesContext';
import { ToastProvider }    from '@/components/ui/Toast';
import { colors }           from '@/constants/colors';

function useWebSetup() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    // Meta tags PWA
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('viewport',
      'width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover,user-scalable=no');
    setMeta('theme-color',                            colors.background);
    setMeta('mobile-web-app-capable',                'yes');
    setMeta('apple-mobile-web-app-capable',          'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title',             'Jogo da Memória');

    // Manifest
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = './manifest.json';

    // Previne pull-to-refresh e scroll do sistema
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        overflow: hidden;
        overscroll-behavior: none;
        background-color: ${colors.background};
        height: 100%;
        -webkit-overflow-scrolling: touch;
      }
      * { -webkit-tap-highlight-color: transparent; }
    `;
    document.head.appendChild(style);

    // Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .catch((e) => console.warn('[SW]', e));
    }
  }, []);
}

export default function RootLayout() {
  useWebSetup();

  return (
    <SettingsProvider>
      <ThemesProvider>
        <ToastProvider>
          <Stack
            screenOptions={{
              headerStyle:        { backgroundColor: colors.surface },
              headerTintColor:    colors.primary,
              headerTitleStyle:   { fontWeight: '800', fontSize: 17, color: colors.text },
              headerBackVisible:  true,
              headerBackButtonDisplayMode: 'minimal',
              contentStyle:       { backgroundColor: colors.background },
              animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
            }}
          >
            <Stack.Screen name="index"           options={{ headerShown: false }} />
            <Stack.Screen name="game/index"      options={{ headerShown: false }} />
            <Stack.Screen name="customize/index" options={{ title: 'Personalizar' }} />
            <Stack.Screen name="records/index"   options={{ title: 'Histórico'    }} />
            <Stack.Screen name="settings/index"  options={{ title: 'Configurações' }} />
          </Stack>
        </ToastProvider>
      </ThemesProvider>
    </SettingsProvider>
  );
}