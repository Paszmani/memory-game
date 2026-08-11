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
 * Os TEMAS DE CARTAS (pares/imagens) também viajam: são outro sistema
 * (themeService, chave `custom_themes`), mas o export anexa todos os temas
 * personalizados sob a chave `cardThemes` no topo do JSON — invisível ao
 * mergeSettings, que só lê as 7 chaves do AppSettings, então arquivos antigos
 * (sem a chave) e builds antigas (que a ignoram) continuam compatíveis. As
 * imagens de cada carta usam o mesmo esquema local das demais e passam pela
 * mesma maquinária de embutir (export) / re-persistir (import).
 */

import { Platform } from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
// API legada: le/grava qualquer esquema de URI (file://, content://) em base64
// no Android — o que a API nova (new File().base64()) não faz de forma
// confiável e era o motivo de as imagens não irem no export/import.
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { mergeSettings } from '@/services/settingsService';
import { getCustomThemes, importCustomThemes } from '@/services/themeService';
import {
  isIndexedDbImageUri,
  resolveWebImageUri,
  saveWebImageFromUri,
} from '@/services/webImageStorage';
import type { AppSettings } from '@/types/settings';
import type { CustomTheme, CustomThemeCard } from '@/types/theme';

export type ExportSettingsResult = 'downloaded' | 'shared' | 'unsupported';
export type ImportSettingsResult =
  | { status: 'ok'; settings: AppSettings; importedCardThemes: number }
  | { status: 'cancelled' }
  | { status: 'invalid' }
  | { status: 'unsupported' };

/** JSON no disco: AppSettings no topo + temas de cartas sob `cardThemes`. */
type ExportPayload = AppSettings & { cardThemes: CustomTheme[] };

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

    // Nativo (Android/iOS): a API legada lê file:// E content:// — a nova só
    // lê caminhos file:// gerenciados, e a imagem do ImagePicker às vezes vem
    // como content://, o que fazia o export cair no `catch` e embutir a
    // referência crua (que não existe em outro aparelho).
    const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    return `data:${mimeFromUri(uri)};base64,${base64}`;
  } catch {
    // Não derruba o export por causa de uma imagem: exporta a referência crua.
    return uri;
  }
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
    // Grava o base64 direto num arquivo durável (documentDirectory) via API
    // legada — sem atob/Uint8Array (que falhava silenciosamente em alguns
    // aparelhos). O arquivo sobrevive à limpeza do cache do ImagePicker.
    const dir = LegacyFileSystem.documentDirectory ?? '';
    const dest = `${dir}tema_${prefix}_${Date.now()}.${ext}`;

    await LegacyFileSystem.writeAsStringAsync(dest, match[2], {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });

    return dest;
  } catch {
    return dataUri;
  }
}

// --- Temas de cartas: embutir imagens / sanear na leitura -------------------

/** Embute a imagem de cada carta de cada tema como data-URI portátil. */
async function toPortableCardThemes(themes: CustomTheme[]): Promise<CustomTheme[]> {
  return Promise.all(
    themes.map(async (theme) => ({
      ...theme,
      cards: await Promise.all(
        theme.cards.map(async (card) => ({
          ...card,
          imageUri: await toPortableUri(card.imageUri),
        })),
      ),
    })),
  );
}

/**
 * Re-persiste as imagens data-URI das cartas no armazenamento de destino.
 * Prefixo único por carta (`card_t{ti}_c{ci}`): no nativo o nome do arquivo é
 * `tema_<prefix>_<Date.now()>` e as gravações correm em paralelo — sem prefixo
 * distinto, duas cartas gravadas no mesmo milissegundo colidiriam.
 */
async function restoreCardThemeImages(themes: CustomTheme[]): Promise<CustomTheme[]> {
  return Promise.all(
    themes.map(async (theme, ti) => ({
      ...theme,
      cards: await Promise.all(
        theme.cards.map(async (card, ci) =>
          card.imageUri?.startsWith('data:')
            ? { ...card, imageUri: await persistImportedImage(card.imageUri, `card_t${ti}_c${ci}`) }
            : card,
        ),
      ),
    })),
  );
}

/** Extrai temas de cartas do JSON cru, descartando formatos inválidos. */
function extractCardThemes(obj: Record<string, unknown>): CustomTheme[] {
  const raw = obj.cardThemes;

  if (!Array.isArray(raw)) return [];

  return raw.filter(
    (theme): theme is CustomTheme =>
      !!theme &&
      typeof theme === 'object' &&
      typeof (theme as CustomTheme).name === 'string' &&
      Array.isArray((theme as CustomTheme).cards),
  );
}

interface ParsedFile {
  settings: AppSettings;
  cardThemes: CustomTheme[];
}

/** Valida e mescla um JSON externo sobre os defaults (campo ausente não quebra). */
function parseFile(text: string): ParsedFile | null {
  try {
    const parsed: unknown = JSON.parse(text);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const obj = parsed as Record<string, unknown>;

    // Campo ausente cai no padrão (mesma regra do resolveTheme do Kiosk
    // Maze: um tema incompleto nunca quebra o app).
    return {
      settings: mergeSettings(obj as Partial<AppSettings>),
      cardThemes: extractCardThemes(obj),
    };
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

  // Temas de cartas personalizados (o DEFAULT_THEME não vive em custom_themes,
  // então não entra aqui) com as imagens de cada carta embutidas.
  const cardThemes = await toPortableCardThemes(await getCustomThemes());

  const payload: ExportPayload = { ...portable, cardThemes };
  const json = JSON.stringify(payload, null, 2);

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

/**
 * Reidrata um arquivo já validado: re-persiste as imagens das settings E dos
 * temas de cartas, grava os temas em custom_themes (sempre como novos) e
 * devolve o resultado 'ok'. Persistir os temas aqui — e não na tela — mantém a
 * mesma disciplina de efeito colateral já usada para as imagens das settings.
 */
async function finalizeImport(parsed: ParsedFile): Promise<ImportSettingsResult> {
  const settings = await restoreImages(parsed.settings);

  const restoredThemes = await restoreCardThemeImages(parsed.cardThemes);
  const importedCardThemes = await importCustomThemes(
    restoredThemes.map((theme) => ({
      name: theme.name,
      description: theme.description,
      cards: theme.cards as CustomThemeCard[],
    })),
  );

  return { status: 'ok', settings, importedCardThemes };
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

        const parsed = parseFile(await file.text());
        resolve(parsed ? await finalizeImport(parsed) : { status: 'invalid' });
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
    const parsed = parseFile(await new File(uri).text());
    return parsed ? await finalizeImport(parsed) : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}
