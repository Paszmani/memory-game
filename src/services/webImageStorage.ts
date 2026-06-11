import { Platform } from 'react-native';

const DB_NAME = 'memory-game-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const URI_PREFIX = 'idb-image://';

interface StoredImageRecord {
  id: string;
  blob: Blob;
  mimeType: string;
  createdAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;
const objectUrlCache = new Map<string, string>();

function isWeb() {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

function canUseIndexedDb() {
  return isWeb() && typeof indexedDB !== 'undefined';
}

function createImageId(prefix = 'image') {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return `${prefix}_${random}`;
}

function openDb(): Promise<IDBDatabase> {
  if (!canUseIndexedDb()) {
    return Promise.reject(new Error('IndexedDB não está disponível.'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error('Erro ao abrir IndexedDB.'));
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
        });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });

  return dbPromise;
}

function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = operation(store);

        request.onerror = () => {
          reject(request.error ?? new Error('Erro no IndexedDB.'));
        };

        request.onsuccess = () => {
          resolve(request.result);
        };
      }),
  );
}

export function isIndexedDbImageUri(uri?: string | null) {
  return typeof uri === 'string' && uri.startsWith(URI_PREFIX);
}

export function getIndexedDbImageId(uri: string) {
  return uri.replace(URI_PREFIX, '');
}

export function makeIndexedDbImageUri(id: string) {
  return `${URI_PREFIX}${id}`;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error('Não foi possível ler a imagem selecionada.');
  }

  return response.blob();
}

export async function saveWebImageFromUri(
  uri: string,
  prefix = 'card',
): Promise<string> {
  if (!canUseIndexedDb()) {
    return uri;
  }

  const blob = await uriToBlob(uri);
  const id = createImageId(prefix);

  const record: StoredImageRecord = {
    id,
    blob,
    mimeType: blob.type || 'image/jpeg',
    createdAt: new Date().toISOString(),
  };

  await transaction('readwrite', (store) => store.put(record));

  return makeIndexedDbImageUri(id);
}

export async function resolveWebImageUri(uri?: string | null): Promise<string | undefined> {
  if (!uri) {
    return undefined;
  }

  if (!isIndexedDbImageUri(uri)) {
    return uri;
  }

  if (!canUseIndexedDb()) {
    return undefined;
  }

  const id = getIndexedDbImageId(uri);

  const cached = objectUrlCache.get(id);

  if (cached) {
    return cached;
  }

  const record = await transaction<StoredImageRecord | undefined>('readonly', (store) =>
    store.get(id),
  );

  if (!record?.blob) {
    return undefined;
  }

  const objectUrl = URL.createObjectURL(record.blob);

  objectUrlCache.set(id, objectUrl);

  return objectUrl;
}

export async function deleteWebImage(uri?: string | null): Promise<void> {
  if (!uri || !isIndexedDbImageUri(uri) || !canUseIndexedDb()) {
    return;
  }

  const id = getIndexedDbImageId(uri);
  const cached = objectUrlCache.get(id);

  if (cached) {
    URL.revokeObjectURL(cached);
    objectUrlCache.delete(id);
  }

  await transaction('readwrite', (store) => store.delete(id));
}

export async function clearWebImages(): Promise<void> {
  if (!canUseIndexedDb()) {
    return;
  }

  objectUrlCache.forEach((url) => URL.revokeObjectURL(url));
  objectUrlCache.clear();

  await transaction('readwrite', (store) => store.clear());
}