import { useEffect, useState } from 'react';

import { Platform } from 'react-native';

const DB_NAME = 'memory-game-images';
const STORE_NAME = 'images';
const URI_PREFIX = 'idb-image://';

interface StoredImageRecord {
  id: string;
  blob: Blob;
  mimeType?: string;
  createdAt?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;
const objectUrlCache = new Map<string, string>();

function isWeb() {
  return Platform.OS === 'web' && typeof window !== 'undefined';
}

function isIndexedDbImageUri(uri?: string | null) {
  return typeof uri === 'string' && uri.startsWith(URI_PREFIX);
}

function getImageId(uri: string) {
  return uri.replace(URI_PREFIX, '');
}

function openDb(): Promise<IDBDatabase> {
  if (!isWeb() || typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB não disponível.'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

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

function getStoredImage(id: string): Promise<StoredImageRecord | undefined> {
  return openDb().then(
    (db) =>
      new Promise<StoredImageRecord | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onerror = () => {
          reject(request.error ?? new Error('Erro ao ler imagem.'));
        };

        request.onsuccess = () => {
          resolve(request.result as StoredImageRecord | undefined);
        };
      }),
  );
}

async function resolveImageUri(uri?: string | null) {
  if (!uri) {
    return undefined;
  }

  if (!isIndexedDbImageUri(uri)) {
    return uri;
  }

  if (!isWeb()) {
    return undefined;
  }

  const id = getImageId(uri);
  const cached = objectUrlCache.get(id);

  if (cached) {
    return cached;
  }

  const record = await getStoredImage(id);

  if (!record?.blob) {
    return undefined;
  }

  const objectUrl = URL.createObjectURL(record.blob);

  objectUrlCache.set(id, objectUrl);

  return objectUrl;
}

export function useResolvedImageUri(uri?: string | null) {
  const [resolvedUri, setResolvedUri] = useState<string | undefined>(
    uri ?? undefined,
  );

  useEffect(() => {
    let mounted = true;

    setResolvedUri(uri ?? undefined);

    resolveImageUri(uri)
      .then((nextUri) => {
        if (mounted) {
          setResolvedUri(nextUri);
        }
      })
      .catch(() => {
        if (mounted) {
          setResolvedUri(undefined);
        }
      });

    return () => {
      mounted = false;
    };
  }, [uri]);

  return resolvedUri;
}