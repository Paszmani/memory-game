import * as ImagePicker from 'expo-image-picker';

import { Dimensions, Platform } from 'react-native';

import { saveWebImageFromUri } from '@/services/webImageStorage';

export interface ScreenInfo {
  width: number;
  height: number;
  aspectRatio: string;
  recommendedW: number;
  recommendedH: number;
  description: string;
}

interface PickOptions {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  persistOnWeb?: boolean;
  storagePrefix?: string;
}

export function getScreenInfo(): ScreenInfo {
  const { width, height } = Dimensions.get('screen');

  const pw = Math.min(width, height);
  const ph = Math.max(width, height);

  function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
  }

  const simplify = (w: number, h: number) => {
    const divisor = gcd(w, h);

    return `${w / divisor}:${h / divisor}`;
  };

  const ratio = simplify(pw, ph);

  const scale = Math.max(1, Math.ceil(1920 / ph));
  const recommendedW = Math.round(pw * scale);
  const recommendedH = Math.round(ph * scale);

  const description = `Tela: ${pw}×${ph}px — Proporção ${ratio}
Imagem recomendada: ${recommendedW}×${recommendedH}px (${ratio})`;

  return {
    width: pw,
    height: ph,
    aspectRatio: ratio,
    recommendedW,
    recommendedH,
    description,
  };
}

export async function pickImageFromLibrary(
  opts: PickOptions = {},
): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],

    /*
     * Importante:
     * Para imagens de carta, o ideal é evitar crop/compressão.
     */
    allowsEditing: opts.allowsEditing ?? false,
    aspect: opts.aspect,
    quality: opts.quality ?? 1,

    /*
     * Na Web, não usamos base64 para salvar no tema.
     * O arquivo será persistido no IndexedDB e o tema salvará só uma referência.
     */
    base64: false,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];

  if (!asset?.uri) {
    return null;
  }

  if (Platform.OS === 'web' && opts.persistOnWeb !== false) {
    return saveWebImageFromUri(asset.uri, opts.storagePrefix ?? 'image');
  }

  return asset.uri;
}

export async function pickCardFrontImage(): Promise<string | null> {
  return pickImageFromLibrary({
    quality: 1,
    allowsEditing: false,
    persistOnWeb: true,
    storagePrefix: 'card_front',
  });
}

export async function pickCardBackImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    quality: 1,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'card_back',
  });
}

export async function pickBackgroundImage(): Promise<{
  uri: string;
  info: ScreenInfo;
} | null> {
  const info = getScreenInfo();

  const { width, height } = Dimensions.get('screen');

  const pw = Math.min(width, height);
  const ph = Math.max(width, height);

  const uri = await pickImageFromLibrary({
    aspect: [pw, ph],
    quality: 1,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'background',
  });

  if (!uri) {
    return null;
  }

  return {
    uri,
    info,
  };
}

export async function pickAttractImage(): Promise<string | null> {
  const { width, height } = Dimensions.get('screen');

  const pw = Math.min(width, height);
  const ph = Math.max(width, height);

  return pickImageFromLibrary({
    aspect: [pw, ph],
    quality: 1,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'attract',
  });
}

export async function pickLogoImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    quality: 1,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'logo',
  });
}