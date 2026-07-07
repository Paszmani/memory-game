/**
 * Exportação/importação do tema (as AppSettings completas: cores, textos,
 * estilo das cartas, totem, campos de lead) como arquivo JSON — o análogo do
 * theme.json do Kiosk Maze. Funciona na web e no Electron (o renderer é web);
 * no app nativo os botões informam indisponibilidade.
 *
 * Os TEMAS DE CARTAS (pares/imagens) ficam fora: são outro sistema
 * (themeService) com imagens pesadas no armazenamento local.
 */

import { Platform } from 'react-native';

import { mergeSettings } from '@/services/settingsService';
import type { AppSettings } from '@/types/settings';

export type ExportSettingsResult = 'ok' | 'unsupported';
export type ImportSettingsResult =
  | { status: 'ok'; settings: AppSettings }
  | { status: 'cancelled' }
  | { status: 'invalid' }
  | { status: 'unsupported' };

function isWebDocument(): boolean {
  return Platform.OS === 'web' && typeof document !== 'undefined';
}

export function exportSettingsFile(settings: AppSettings): ExportSettingsResult {
  if (!isWebDocument()) return 'unsupported';

  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = 'memoria-tema.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return 'ok';
}

export function importSettingsFile(): Promise<ImportSettingsResult> {
  if (!isWebDocument()) return Promise.resolve({ status: 'unsupported' });

  return new Promise((resolve) => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'application/json,.json';

    input.onchange = async () => {
      const file = input.files && input.files[0];

      if (!file) {
        resolve({ status: 'cancelled' });
        return;
      }

      try {
        const parsed: unknown = JSON.parse(await file.text());

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          resolve({ status: 'invalid' });
          return;
        }

        // Campo ausente cai no padrão (mesma regra do resolveTheme do Kiosk
        // Maze: um tema incompleto nunca quebra o app).
        resolve({ status: 'ok', settings: mergeSettings(parsed as Partial<AppSettings>) });
      } catch {
        resolve({ status: 'invalid' });
      }
    };

    // Nem todo ambiente dispara 'cancel'; quando dispara, avisamos.
    input.addEventListener('cancel', () => resolve({ status: 'cancelled' }));
    input.click();
  });
}
