/**
 * Exportação/importação do tema (as AppSettings completas: cores, textos,
 * estilo das cartas, totem, campos de lead) como arquivo JSON — o análogo do
 * theme.json do Kiosk Maze. Funciona em TODAS as plataformas:
 *
 * - Web/Electron: download/upload via âncora e <input type=file>;
 * - Android/iOS: grava no cache e abre a folha nativa de compartilhamento
 *   (mesmo caminho do CSV de leads) / seletor de documentos do sistema.
 *
 * Os TEMAS DE CARTAS (pares/imagens) ficam fora: são outro sistema
 * (themeService) com imagens pesadas no armazenamento local.
 */

import { Platform } from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { mergeSettings } from '@/services/settingsService';
import type { AppSettings } from '@/types/settings';

export type ExportSettingsResult = 'downloaded' | 'shared' | 'unsupported';
export type ImportSettingsResult =
  | { status: 'ok'; settings: AppSettings }
  | { status: 'cancelled' }
  | { status: 'invalid' }
  | { status: 'unsupported' };

const FILE_NAME = 'memoria-tema.json';

function isWebDocument(): boolean {
  return Platform.OS === 'web' && typeof document !== 'undefined';
}

/** Valida e mescla um JSON externo sobre os defaults (campo ausente não quebra). */
function parseSettings(text: string): AppSettings | null {
  try {
    const parsed: unknown = JSON.parse(text);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    // Campo ausente cai no padrão (mesma regra do resolveTheme do Kiosk
    // Maze: um tema incompleto nunca quebra o app).
    return mergeSettings(parsed as Partial<AppSettings>);
  } catch {
    return null;
  }
}

export async function exportSettingsFile(settings: AppSettings): Promise<ExportSettingsResult> {
  const json = JSON.stringify(settings, null, 2);

  if (isWebDocument()) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    return 'downloaded';
  }

  // Nativo: mesmo caminho do CSV de leads — grava no cache e compartilha
  // (e-mail/Drive/WhatsApp). O destinatário importa o arquivo em outro totem.
  if (!(await Sharing.isAvailableAsync())) return 'unsupported';

  const file = new File(Paths.cache, FILE_NAME);

  if (file.exists) file.delete();
  file.create();
  file.write(json);

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Compartilhar tema (JSON)',
    UTI: 'public.json',
  });

  return 'shared';
}

export async function importSettingsFile(): Promise<ImportSettingsResult> {
  if (isWebDocument()) {
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

        const settings = parseSettings(await file.text());
        resolve(settings ? { status: 'ok', settings } : { status: 'invalid' });
      };

      // Nem todo ambiente dispara 'cancel'; quando dispara, avisamos.
      input.addEventListener('cancel', () => resolve({ status: 'cancelled' }));
      input.click();
    });
  }

  // Nativo: seletor de documentos do sistema. `type` amplo de propósito —
  // apps de e-mail/WhatsApp gravam .json com MIME genérico e um filtro
  // estrito esconderia o arquivo; a validação real é o parse abaixo.
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'application/octet-stream'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (picked.canceled) return { status: 'cancelled' };

  const uri = picked.assets[0]?.uri;

  if (!uri) return { status: 'cancelled' };

  try {
    const settings = parseSettings(await new File(uri).text());
    return settings ? { status: 'ok', settings } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}
