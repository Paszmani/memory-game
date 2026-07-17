/**
 * Exportação/importação do tema (as AppSettings completas: cores, textos,
 * estilo das cartas, totem, campos de lead) como arquivo JSON — o análogo do
 * theme.json do Kiosk Maze. Funciona em TODAS as plataformas:
 *
 * - Web/Electron: download/upload via âncora e <input type=file>;
 * - Android/iOS: grava no cache e abre a folha nativa de compartilhamento
 *   (mesmo caminho do CSV de leads) / seletor de documentos do sistema.
 *
 * IMAGENS DO OPERADOR (fundo, verso das cartas, logo, attract, ícone final):
 * as configurações guardam apenas REFERÊNCIAS locais (`idb-image://` no
 * IndexedDB da web, `file://` no cache do Android) que não existem em outro
 * aparelho — exportar só a referência era o motivo de "as imagens não irem".
 * No export cada imagem é EMBUTIDA como data-URI dentro do JSON; no import
 * ela é re-persistida no armazenamento local da plataforma de destino.
 *
 * Os TEMAS DE CARTAS (pares/imagens) ficam fora: são outro sistema
 * (themeService) com imagens pesadas no armazenamento local.
 */

import { Platform } from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { mergeSettings } from '@/services/settingsService';
import {
  isIndexedDbImageUri,
  resolveWebImageUri,
  saveWebImageFromUri,
} from '@/services/webImageStorage';
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

// --- Imagens: embutir no export / re-persistir no import --------------------

interface ImageRef {
  prefix: string;
  get: (s: AppSettings) => string | undefined;
  set: (s: AppSettings, v: string | undefined) => void;
}

const IMAGE_REFS: ImageRef[] = [
  {
    prefix: 'background',
    get: (s) => s.background.imageUri,
    set: (s, v) => {
      s.background.imageUri = v;
    },
  },
  {
    prefix: 'card_back',
    get: (s) => s.cardStyle.backImageUri,
    set: (s, v) => {
      s.cardStyle.backImageUri = v;
    },
  },
  {
    prefix: 'attract_center',
    get: (s) => s.totem.attractCenterImageUri,
    set: (s, v) => {
      s.totem.attractCenterImageUri = v;
    },
  },
  {
    prefix: 'logo',
    get: (s) => s.branding.logoUri,
    set: (s, v) => {
      s.branding.logoUri = v;
    },
  },
  {
    prefix: 'finish_icon',
    get: (s) => s.branding.finishIconImageUri,
    set: (s, v) => {
      s.branding.finishIconImageUri = v;
    },
  },
];

function mimeFromUri(uri: string): string {
  const m = /\.(png|webp|gif|jpe?g)(\?|#|$)/i.exec(uri);
  const ext = m?.[1]?.toLowerCase();

  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('falha ao ler imagem'));
    reader.readAsDataURL(blob);
  });
}

/** Resolve uma referência local de imagem para data-URI portátil (best-effort). */
async function toPortableUri(uri: string | undefined): Promise<string | undefined> {
  if (!uri || uri.startsWith('data:')) return uri;

  try {
    if (isWebDocument()) {
      // idb-image:// vira object URL; blob:/http resolvem direto no fetch.
      const resolved = isIndexedDbImageUri(uri) ? await resolveWebImageUri(uri) : uri;

      if (!resolved) return undefined;

      return await blobToDataUri(await (await fetch(resolved)).blob());
    }

    if (uri.startsWith('file:')) {
      const base64 = await new File(uri).base64();

      return `data:${mimeFromUri(uri)};base64,${base64}`;
    }
  } catch {
    // Não derruba o export por causa de uma imagem: exporta a referência crua.
    return uri;
  }

  return uri;
}

/**
 * Re-persiste um data-URI importado no armazenamento local da plataforma:
 * web → IndexedDB (volta a ser `idb-image://`); nativo → arquivo em
 * `Paths.document` (data-URI gigante dentro do AsyncStorage estoura o cursor
 * do Android; arquivo também sobrevive à limpeza do cache do ImagePicker).
 */
async function persistImportedImage(dataUri: string, prefix: string): Promise<string> {
  if (!dataUri.startsWith('data:')) return dataUri;

  if (isWebDocument()) {
    try {
      return await saveWebImageFromUri(dataUri, prefix);
    } catch {
      return dataUri;
    }
  }

  const match = /^data:([^;,]+);base64,(.*)$/s.exec(dataUri);

  if (!match) return dataUri;

  try {
    const mime = match[1];
    const ext =
      mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : 'jpg';
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0));
    const file = new File(Paths.document, `tema_${prefix}_${Date.now()}.${ext}`);

    if (file.exists) file.delete();
    file.create();
    file.write(bytes);

    return file.uri;
  } catch {
    return dataUri;
  }
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

// --- Export ------------------------------------------------------------------

export async function exportSettingsFile(settings: AppSettings): Promise<ExportSettingsResult> {
  // Clone profundo: o embutimento de imagens não pode tocar o estado vivo.
  const portable = JSON.parse(JSON.stringify(settings)) as AppSettings;

  for (const ref of IMAGE_REFS) {
    ref.set(portable, await toPortableUri(ref.get(portable)));
  }

  const json = JSON.stringify(portable, null, 2);

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

// --- Import ------------------------------------------------------------------

async function restoreImages(settings: AppSettings): Promise<AppSettings> {
  for (const ref of IMAGE_REFS) {
    const value = ref.get(settings);

    if (value?.startsWith('data:')) {
      ref.set(settings, await persistImportedImage(value, ref.prefix));
    }
  }

  return settings;
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
        resolve(settings ? { status: 'ok', settings: await restoreImages(settings) } : { status: 'invalid' });
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
    return settings ? { status: 'ok', settings: await restoreImages(settings) } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}
