import * as ImagePicker from 'expo-image-picker';

export interface PickImageOptions {
  aspect?: [number, number];
  quality?: number;
}

const DEFAULT_OPTIONS: PickImageOptions = {
  aspect:  [1, 1],
  quality: 0.85,
};

async function requestPermission(): Promise<boolean> {
  const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return granted;
}

export async function pickImageFromLibrary(
  options: PickImageOptions = DEFAULT_OPTIONS,
): Promise<string | null> {
  const hasPermission = await requestPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes:    ['images'],
    allowsEditing: true,
    aspect:        options.aspect,
    quality:       options.quality,
  });

  if (result.canceled) return null;

  return result.assets[0]?.uri ?? null;
}

export async function pickBackgroundImage(): Promise<string | null> {
  return pickImageFromLibrary({ aspect: [9, 16], quality: 0.9 });
}