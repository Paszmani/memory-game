import { useCallback, useEffect, useState } from 'react';

import {
  clearGameResults,
  getGameResults,
} from '@/services/scoreService';
import { GameResult } from '@/types/game';

export function useRecords() {
  const [records, setRecords] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);

    try {
      const results = await getGameResults();
      setRecords(results);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRecords = useCallback(async () => {
    await clearGameResults();
    await loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  return {
    records,
    isLoading,
    loadRecords,
    clearRecords,
  };
}