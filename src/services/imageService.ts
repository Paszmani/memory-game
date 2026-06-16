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
  cropAspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  persistOnWeb?: boolean;
  storagePrefix?: string;
  maxWidth?: number;
  maxHeight?: number;
  outputMimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const CARD_IMAGE_SIZE = 1200;
const ICON_IMAGE_SIZE = 700;

export function getScreenInfo(): ScreenInfo {
  const { width, height } = Dimensions.get('window');
  const scale = Math.max(1, PixelRatio.get());

  const physicalWidth = Math.round(width * scale);
  const physicalHeight = Math.round(height * scale);

  const recommendedW = physicalWidth;
  const recommendedH = physicalHeight;

  function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
  }

  const divisor = gcd(recommendedW, recommendedH);
  const aspectRatio = `${recommendedW / divisor}:${recommendedH / divisor}`;

  const description = `Tela: ${recommendedW}×${recommendedH}px — Proporção ${aspectRatio}. Imagem recomendada: ${recommendedW}×${recommendedH}px (${aspectRatio})`;

  return {
    width: recommendedW,
    height: recommendedH,
    aspectRatio,
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

    /**
     * Android/iOS:
     * abre a tela nativa de recorte.
     *
     * Web:
     * o expo-image-picker ignora a edição nativa;
     * por isso o corte é reforçado depois no webImageStorage.
     */
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
      quality: opts.quality ?? 0.88,
      mimeType: opts.outputMimeType,
      cropAspect: opts.cropAspect ?? opts.aspect,
    });
  }

  return asset.uri;
}

/**
 * Frente das cartas:
 * sempre quadrado.
 */
export async function pickCardFrontImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    cropAspect: [1, 1],
    quality: 0.9,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'card_front',
    maxWidth: CARD_IMAGE_SIZE,
    maxHeight: CARD_IMAGE_SIZE,
  });
}

/**
 * Verso das cartas:
 * sempre quadrado.
 */
export async function pickCardBackImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    cropAspect: [1, 1],
    quality: 0.9,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'card_back',
    maxWidth: CARD_IMAGE_SIZE,
    maxHeight: CARD_IMAGE_SIZE,
  });
}

/**
 * Papel de parede:
 * sempre na proporção exata da tela atual.
 */
export async function pickBackgroundImage(): Promise<{
  uri: string;
  info: ScreenInfo;
} | null> {
  const info = getScreenInfo();

  const uri = await pickImageFromLibrary({
    aspect: [info.width, info.height],
    cropAspect: [info.width, info.height],
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

/**
 * Imagem central da tela de atração:
 * também segue a proporção da tela.
 */
export async function pickAttractImage(): Promise<string | null> {
  const info = getScreenInfo();

  return pickImageFromLibrary({
    aspect: [info.width, info.height],
    cropAspect: [info.width, info.height],
    quality: 0.86,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'attract',
    maxWidth: info.recommendedW,
    maxHeight: info.recommendedH,
    outputMimeType: 'image/jpeg',
  });
}

/**
 * Logo:
 * quadrado para manter consistência visual.
 */
export async function pickLogoImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    cropAspect: [1, 1],
    quality: 0.9,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'logo',
    maxWidth: ICON_IMAGE_SIZE,
    maxHeight: ICON_IMAGE_SIZE,
  });
}

/**
 * Ícone do menu final:
 * quadrado.
 */
export async function pickFinishIconImage(): Promise<string | null> {
  return pickImageFromLibrary({
    aspect: [1, 1],
    cropAspect: [1, 1],
    quality: 0.9,
    allowsEditing: true,
    persistOnWeb: true,
    storagePrefix: 'finish_icon',
    maxWidth: ICON_IMAGE_SIZE,
    maxHeight: ICON_IMAGE_SIZE,
  });
}