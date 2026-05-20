import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);

  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch (e) {
    if (__DEV__) {
      console.warn(`[storageService] Falha ao parsear chave "${key}":`, e);
    }
    return fallback;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (__DEV__) {
      console.warn(`[storageService] Falha ao salvar chave "${key}":`, e);
    }
    throw e; 
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    if (__DEV__) {
      console.warn(`[storageService] Falha ao remover chave "${key}":`, e);
    }
    throw e;
  }
}