import { useCallback, useEffect, useState } from 'react';

import { clearGameResults, getGameResults } from '@/services/scoreService';
import { GameResult } from '@/types/game';

export interface UseRecordsReturn {
  records:      GameResult[];
  isLoading:    boolean;
  loadRecords:  () => Promise<void>;
  clearRecords: () => Promise<void>;
}

export function useRecords(): UseRecordsReturn {
  const [records,   setRecords]   = useState<GameResult[]>([]);
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
    setRecords([]);
  }, []);

  useEffect(() => { void loadRecords(); }, [loadRecords]);

  return { records, isLoading, loadRecords, clearRecords };
}