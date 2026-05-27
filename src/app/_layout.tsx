import { useEffect } from 'react';
import { Platform }  from 'react-native';
import { Stack }     from 'expo-router';

import { SettingsProvider }  from '@/contexts/SettingsContext';
import { ThemesProvider }    from '@/contexts/ThemesContext';
import { ToastProvider }     from '@/components/ui/Toast';
import { ConfirmProvider }   from '@/components/ui/ConfirmDialog';
import { colors }            from '@/constants/colors';
import { useSettings }       from '@/contexts/SettingsContext';

const GOOGLE_FONTS: Record<string, string> = {
  inter:      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap',
  poppins:    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap',
  nunito:     'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap',
  roboto:     'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
  montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap',
};

const WEB_FONT_CSS: Record<string, string> = {
  system:     'system-ui, sans-serif',
  inter:      '"Inter", system-ui, sans-serif',
  poppins:    '"Poppins", system-ui, sans-serif',
  nunito:     '"Nunito", system-ui, sans-serif',
  roboto:     '"Roboto", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  serif:      'Georgia, serif',
  mono:       '"Courier New", monospace',
};

/** Carrega e aplica a fonte no web */
function WebFontApplier() {
  const { settings } = useSettings();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const font = settings.ui.fontFamily;

    // Injeta Google Font se necessário
    const url = GOOGLE_FONTS[font];
    if (url) {
      let link = document.querySelector<HTMLLinkElement>(`link[data-gf="${font}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.setAttribute('data-gf', font);
        document.head.appendChild(link);
      }
      link.href = url;
    }

    // Aplica ao body
    document.body.style.fontFamily  = WEB_FONT_CSS[font] ?? 'system-ui';
  }, [settings.ui.fontFamily]);

  return null;
}

function useWebSetup() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('viewport',
      'width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover,user-scalable=no');
    setMeta('theme-color',                            colors.background);
    setMeta('mobile-web-app-capable',                'yes');
    setMeta('apple-mobile-web-app-capable',          'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title',             'Jogo da Memória');

    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link); }
    link.href = './manifest.json';

    const style = document.createElement('style');
    style.textContent = `
      html, body { overflow: hidden; overscroll-behavior: none;
        background-color: ${colors.background}; height: 100%;
        -webkit-overflow-scrolling: touch; }
      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      ::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .catch((e) => console.warn('[SW]', e));
    }

    document.body.style.backgroundColor         = colors.background;
    document.documentElement.style.backgroundColor = colors.background;
  }, []);
}

export default function RootLayout() {
  useWebSetup();

  return (
    <SettingsProvider>
      <ThemesProvider>
        <ConfirmProvider>
          <ToastProvider>
            <WebFontApplier />
            <Stack
              screenOptions={{
                headerStyle:                { backgroundColor: colors.surface },
                headerTintColor:            colors.primary,
                headerTitleStyle:           { fontWeight: '800', fontSize: 17, color: colors.text },
                headerBackVisible:          true,
                headerBackButtonDisplayMode: 'minimal',
                contentStyle:               { backgroundColor: colors.background },
                animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
              }}
            >
              <Stack.Screen name="index"           options={{ headerShown: false }} />
              <Stack.Screen name="game/index"      options={{ headerShown: false }} />
              <Stack.Screen name="customize/index" options={{ title: 'Personalizar' }} />
              <Stack.Screen name="records/index"   options={{ title: 'Histórico'     }} />
              <Stack.Screen name="settings/index"  options={{ title: 'Configurações' }} />
            </Stack>
          </ToastProvider>
        </ConfirmProvider>
      </ThemesProvider>
    </SettingsProvider>
  );
}