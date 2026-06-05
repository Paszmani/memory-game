import * as ImagePicker from 'expo-image-picker';
import { Dimensions, Platform } from 'react-native';

export interface ScreenInfo {
  width:         number;
  height:        number;
  aspectRatio:   string;
  recommendedW:  number;
  recommendedH:  number;
  description:   string;
}

export function getScreenInfo(): ScreenInfo {
  const { width, height } = Dimensions.get('screen');
  const pw = Math.min(width, height);
  const ph = Math.max(width, height);

  function gcd(a: number, b: number): number {
    return b === 0 ? a : gcd(b, a % b);
  }

  const d = gcd(pw, ph);
  const rW = pw / d;
  const rH = ph / d;
  const simplify = (w: number, h: number) => {
    const d2 = gcd(w, h);
    return `${w / d2}:${h / d2}`;
  };

  const ratio = simplify(pw, ph);

  // Resolução recomendada para fundo (mínimo Full HD)
  const scale     = Math.max(1, Math.ceil(1920 / ph));
  const recW      = Math.round(pw * scale);
  const recH      = Math.round(ph * scale);

  const description = `Tela: ${pw}×${ph}px — Proporção ${ratio}
Imagem recomendada: ${recW}×${recH}px (${ratio})`;

  return { width: pw, height: ph, aspectRatio: ratio, recommendedW: recW, recommendedH: recH, description };
}

async function blobToDataUrl(uri: string): Promise<string> {
  if (!uri.startsWith('blob:')) return uri;
  const res  = await fetch(uri);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader  = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

interface PickOptions {
  aspect?:  [number, number];
  quality?: number;
}

export async function pickImageFromLibrary(
  opts: PickOptions = { quality: 1 },
): Promise<string | null> {
  const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:    ['images'],
    allowsEditing: false,
    aspect:        opts.aspect,
    quality:       opts.quality,
    base64:        Platform.OS === 'web',
  });

  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;

  if (Platform.OS === 'web') {
    if (asset.base64) return `data:image/jpeg;base64,${asset.base64}`;
    return blobToDataUrl(asset.uri);
  }

  return asset.uri;
}

/** Escolhe imagem de fundo respeitando a proporção da tela */
export async function pickBackgroundImage(): Promise<{ uri: string; info: ScreenInfo } | null> {
  const info = getScreenInfo();

  // Aspect ratio inteiro para o ImagePicker
  const { width, height } = Dimensions.get('screen');
  const pw = Math.min(width, height);
  const ph = Math.max(width, height);

  const uri = await pickImageFromLibrary({ aspect: [pw, ph], quality: 1 });
  if (!uri) return null;

  return { uri, info };
}

export async function pickCardBackImage(): Promise<string | null> {
  return pickImageFromLibrary({ aspect: [1, 1], quality: 1 });
}

export async function pickAttractImage(): Promise<string | null> {
  const { width, height } = Dimensions.get('screen');
  const pw = Math.min(width, height);
  const ph = Math.max(width, height);
  return pickImageFromLibrary({ aspect: [pw, ph], quality: 1 });
}

export async function pickLogoImage(): Promise<string | null> {
  return pickImageFromLibrary({ aspect: [1, 1], quality: 1 });
}