import { useEffect }    from 'react';
import { Platform }     from 'react-native';
import { Stack }        from 'expo-router';

import { SettingsProvider } from '@/contexts/SettingsContext';
import { ToastProvider }    from '@/components/ui/Toast';
import { colors }           from '@/constants/colors';

function useWebSetup() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    // 1) Meta tags PWA
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('viewport', 'width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover,user-scalable=no');
    setMeta('theme-color',                        colors.background);
    setMeta('mobile-web-app-capable',             'yes');
    setMeta('apple-mobile-web-app-capable',       'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');

    // Link manifest
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link); }
    link.href = './manifest.json';

    // 2) Previne pull-to-refresh e overscroll no mobile
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';

    // 3) Registra Service Worker para PWA instalável
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .catch((err) => console.warn('SW registration failed:', err));
    }

    // 4) Aplica cor de fundo via CSS (evita flash branco)
    document.body.style.backgroundColor = colors.background;
    document.documentElement.style.backgroundColor = colors.background;

  }, []);
}

export default function RootLayout() {
  useWebSetup();

  return (
    <SettingsProvider>
      <ToastProvider>
        <Stack
          screenOptions={{
            headerStyle:        { backgroundColor: colors.surface },
            headerTintColor:    colors.primary,       // ← amarelo (visível)
            headerTitleStyle:   { fontWeight: '800', fontSize: 17, color: colors.text },
            headerBackVisible:  true,
            contentStyle:       { backgroundColor: colors.background },
            animation:          Platform.OS === 'web' ? 'none' : 'slide_from_right',
          }}
        >
          <Stack.Screen name="index"           options={{ headerShown: false }} />
          <Stack.Screen name="game/index"      options={{ headerShown: false }} />
          <Stack.Screen name="customize/index" options={{ title: 'Personalizar', headerBackTitle: 'Voltar' }} />
          <Stack.Screen name="records/index"   options={{ title: 'Histórico',    headerBackTitle: 'Voltar' }} />
          <Stack.Screen name="settings/index"  options={{ title: 'Configurações', headerBackTitle: 'Voltar' }} />
        </Stack>
      </ToastProvider>
    </SettingsProvider>
  );
}