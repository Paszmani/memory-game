import { useEffect, useState } from 'react';

import { resolveWebImageUri } from '@/services/webImageStorage';

export function useResolvedImageUri(uri?: string | null) {
  const [resolvedUri, setResolvedUri] = useState<string | undefined>(
    uri ?? undefined,
  );

  useEffect(() => {
    let alive = true;

    setResolvedUri(uri ?? undefined);

    resolveWebImageUri(uri)
      .then((nextUri) => {
        if (alive) {
          setResolvedUri(nextUri);
        }
      })
      .catch(() => {
        if (alive) {
          setResolvedUri(undefined);
        }
      });

    return () => {
      alive = false;
    };
  }, [uri]);

  return resolvedUri;
}