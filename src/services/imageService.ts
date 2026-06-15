import * as ImagePicker from 'expo-image-picker';

import { Dimensions, PixelRatio, Platform } from 'react-native';

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
  maxWidth?: number;
  maxHeight?: number;
  outputMimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export function getScreenInfo(): ScreenInfo {
  const { width, height } = Dimensions.get('window');
  const scale = Math.max(1, PixelRatio.get());

  const physicalWidth = Math.round(width * scale);
  const physicalHeight = Math.round(height * scale);

  const pw = Math.min(physicalWidth, physicalHeight);
  const ph = Math.max(physicalWidth, physicalHeight);

  function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
  }

  const simplify = (w: number, h: number) => {
    const divisor = gcd(w, h);
    return `${w / divisor}:${h / divisor}`;
  };

  const ratio = simplify(pw, ph);

  const recommendedW = pw;
  const recommendedH = ph;

  const description = `Tela: ${pw}×${ph}px — Proporção ${ratio}. Imagem recomendada: ${recommendedW}×${recommendedH}px (${ratio})`;

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
    allowsEditing: opts.allowsEditing ?? false,
    aspect: opts.aspect,
    quality: opts.quality ?? 0.88,
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
    return saveWebImageFromUri(asset.uri, opts.storagePrefix ?? 'image', {
      maxWidth: opts.maxWidth,
      maxHeight: opts.maxHeight,
      quality: opts.quality ?? 0.86,
      mimeType: opts.outputMimeType,
    });
  }

  return asset.uri;
}

export async function pickCardFrontImage(): Promise<string | null> {
  return pickImageFromLibrary({
    quality: 0.88,
    allowsEditing: false,
    persistOnWeb: true,
    storagePrefix: 'card_front',
    maxWidth: 1400,
    maxHeight: 1400,
  });
}

export async function pickCardBackImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    quality: 0.88,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'card_back',
    maxWidth: 1000,
    maxHeight: 1000,
  });
}

export async function pickBackgroundImage(): Promise<{
  uri: string;
  info: ScreenInfo;
} | null> {
  const info = getScreenInfo();

  const uri = await pickImageFromLibrary({
    aspect: [info.width, info.height],
    quality: 0.86,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'background',
    maxWidth: info.recommendedW,
    maxHeight: info.recommendedH,
    outputMimeType: 'image/jpeg',
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
  const info = getScreenInfo();

  return pickImageFromLibrary({
    aspect: [info.width, info.height],
    quality: 0.86,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'attract',
    maxWidth: info.recommendedW,
    maxHeight: info.recommendedH,
    outputMimeType: 'image/jpeg',
  });
}

export async function pickLogoImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    quality: 0.9,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'logo',
    maxWidth: 700,
    maxHeight: 700,
  });
}

export async function pickFinishIconImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    quality: 0.9,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'finish_icon',
    maxWidth: 700,
    maxHeight: 700,
  });
}