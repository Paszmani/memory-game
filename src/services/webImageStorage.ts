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

export interface WebImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

let dbPromise: Promise<IDBDatabase> | null = null;
const objectUrlCache = new Map<string, string>();

function isWeb() {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

function canUseIndexedDb() {
  return isWeb() && typeof indexedDB !== 'undefined';
}

function canUseCanvas() {
  return isWeb() && typeof document !== 'undefined';
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

  dbPromise = new Promise((resolve, reject) => {
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
      new Promise((resolve, reject) => {
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

async function optimizeImageBlob(
  blob: Blob,
  options: WebImageOptimizationOptions = {},
): Promise<Blob> {
  const shouldOptimize =
    !!options.maxWidth ||
    !!options.maxHeight ||
    !!options.mimeType ||
    typeof options.quality === 'number';

  if (!canUseCanvas() || !shouldOptimize || blob.type === 'image/gif') {
    return blob;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = document.createElement('img');

    image.onload = () => {
      try {
        const sourceWidth = image.naturalWidth || image.width;
        const sourceHeight = image.naturalHeight || image.height;

        if (!sourceWidth || !sourceHeight) {
          URL.revokeObjectURL(objectUrl);
          resolve(blob);
          return;
        }

        const maxWidth = options.maxWidth ?? sourceWidth;
        const maxHeight = options.maxHeight ?? sourceHeight;

        const scale = Math.min(
          1,
          maxWidth / sourceWidth,
          maxHeight / sourceHeight,
        );

        const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
        const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

        const outputType =
          options.mimeType ??
          (blob.type === 'image/png' ? 'image/png' : 'image/jpeg');

        const shouldResize =
          targetWidth !== sourceWidth || targetHeight !== sourceHeight;

        if (!shouldResize && !options.mimeType && !options.quality) {
          URL.revokeObjectURL(objectUrl);
          resolve(blob);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve(blob);
          return;
        }

        if (outputType === 'image/jpeg') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (optimizedBlob) => {
            URL.revokeObjectURL(objectUrl);
            resolve(optimizedBlob ?? blob);
          },
          outputType,
          outputType === 'image/png' ? undefined : options.quality ?? 0.86,
        );
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve(blob);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(blob);
    };

    image.src = objectUrl;
  });
}

export async function saveWebImageFromUri(
  uri: string,
  prefix = 'card',
  options: WebImageOptimizationOptions = {},
): Promise<string> {
  if (!canUseIndexedDb()) {
    return uri;
  }

  const originalBlob = await uriToBlob(uri);
  const blob = await optimizeImageBlob(originalBlob, options);

  const id = createImageId(prefix);

  const record: StoredImageRecord = {
    id,
    blob,
    mimeType: blob.type || originalBlob.type || 'image/jpeg',
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

  const record = await transaction<StoredImageRecord | undefined>(
    'readonly',
    (store) => store.get(id),
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