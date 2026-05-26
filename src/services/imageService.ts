import * as ImagePicker from 'expo-image-picker';
import { Platform }     from 'react-native';

interface PickOptions {
  aspect?:  [number, number];
  quality?: number;
}

async function blobToDataUrl(uri: string): Promise<string> {
  if (!uri.startsWith('blob:')) return uri;
  const res    = await fetch(uri);
  const blob   = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function pickImageFromLibrary(
  opts: PickOptions = { aspect: [1, 1], quality: 0.75 },
): Promise<string | null> {
  const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:    ['images'],
    allowsEditing: true,
    aspect:        opts.aspect,
    quality:       opts.quality,
    base64:        Platform.OS === 'web', // solicita base64 direto na web
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) return null;

  // Na web, usa base64 direto (evita blob URL que expira)
  if (Platform.OS === 'web') {
    if (asset.base64) return `data:image/jpeg;base64,${asset.base64}`;
    return blobToDataUrl(asset.uri);
  }

  return asset.uri;
}

export async function pickBackgroundImage(): Promise<string | null> {
  return pickImageFromLibrary({ aspect: [9, 16], quality: 0.8 });
}