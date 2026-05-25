import { STORAGE_KEYS }  from '@/constants/storageKeys';
import { GameResult }    from '@/types/game';
import { getJson, removeItem, setJson } from '@/services/storageService';

const MAX_RESULTS = 50;

export async function getGameResults(): Promise<GameResult[]> {
  const results = await getJson<GameResult[]>(STORAGE_KEYS.gameResults, []);
  return results.sort((a, b) =>
    new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
  );
}

export async function saveGameResult(result: GameResult): Promise<void> {
  const current = await getJson<GameResult[]>(STORAGE_KEYS.gameResults, []);
  const updated = [result, ...current].slice(0, MAX_RESULTS);
  await setJson(STORAGE_KEYS.gameResults, updated);
}

export async function clearGameResults(): Promise<void> {
  await removeItem(STORAGE_KEYS.gameResults);
}