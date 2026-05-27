import { useEffect } from 'react';
import { Platform }  from 'react-native';
import { Stack }     from 'expo-router';

import { SettingsProvider } from '@/contexts/SettingsContext';
import { ThemesProvider }   from '@/contexts/ThemesContext';
import { ToastProvider }    from '@/components/ui/Toast';
import { ConfirmProvider }  from '@/components/ui/ConfirmDialog';
import { useSettings }      from '@/contexts/SettingsContext';
import { colors as base }   from '@/constants/colors';

// ── Mapa de fontes para CSS (web) ─────────────────────────────────────────────
const GOOGLE_FONTS_URL: Record<string, string> = {
  inter:      'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap',
  poppins:    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap',
  nunito:     'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;900&display=swap',
  roboto:     'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
  montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap',
};

const FONT_CSS_FAMILY: Record<string, string> = {
  system:     'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  inter:      '"Inter", system-ui, sans-serif',
  poppins:    '"Poppins", system-ui, sans-serif',
  nunito:     '"Nunito", system-ui, sans-serif',
  roboto:     '"Roboto", system-ui, sans-serif',
  montserrat: '"Montserrat", system-ui, sans-serif',
  serif:      'Georgia, "Times New Roman", serif',
  mono:       '"Courier New", Courier, monospace',
};

function hexToRgba(hex: string, a: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16) || 0;
  const g = parseInt(c.slice(2, 4), 16) || 0;
  const b = parseInt(c.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a})`;
}

function WebThemeApplier() {
  const { settings } = useSettings();
  const { fontFamily, primaryColor } = settings.ui;

  // ── Fonte ────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const fontUrl = GOOGLE_FONTS_URL[fontFamily];
    if (fontUrl) {
      const id = `gf-${fontFamily}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id   = id;
        link.rel  = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    }


    const cssFamily = FONT_CSS_FAMILY[fontFamily] ?? FONT_CSS_FAMILY.system;

    let styleEl = document.getElementById('rn-font-override') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'rn-font-override';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      *, *::before, *::after {
        font-family: ${cssFamily} !important;
      }
    `;
  }, [fontFamily]);

  // ── Cor primária ─────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--primary',       primaryColor);
    root.style.setProperty('--primary-glow',  hexToRgba(primaryColor, 0.15));
  }, [primaryColor]);

  return null;
}

function useWebSetup() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

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
    setMeta('theme-color',                            base.background);
    setMeta('mobile-web-app-capable',                'yes');
    setMeta('apple-mobile-web-app-capable',          'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title',             'Jogo da Memória');

    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link); }
    link.href = './manifest.json';

    const style = document.createElement('style');
    style.textContent = `
      html, body {
        overflow: hidden; overscroll-behavior: none;
        background: ${base.background}; height: 100%;
        -webkit-overflow-scrolling: touch;
      }
      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      ::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);

    document.body.style.backgroundColor          = base.background;
    document.documentElement.style.backgroundColor = base.background;

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
        <ConfirmProvider>
          <ToastProvider>
            <WebThemeApplier />
            <Stack
              screenOptions={{
                headerStyle:                { backgroundColor: base.surface },
                headerTintColor:            base.primary,
                headerTitleStyle:           { fontWeight: '800', fontSize: 17, color: base.text },
                headerBackVisible:          true,
                headerBackButtonDisplayMode: 'minimal',
                contentStyle:               { backgroundColor: base.background },
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