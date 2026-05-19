import { STORAGE_KEYS } from '@/constants/storageKeys';
import { GameResult } from '@/types/game';
import { getJson, removeItem, setJson } from '@/services/storageService';

export async function getGameResults(): Promise<GameResult[]> {
  const results = await getJson<GameResult[]>(STORAGE_KEYS.gameResults, []);

  return results.sort((a, b) => b.score - a.score);
}

export async function saveGameResult(result: GameResult): Promise<void> {
  const results = await getJson<GameResult[]>(STORAGE_KEYS.gameResults, []);

  const nextResults = [result, ...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  await setJson(STORAGE_KEYS.gameResults, nextResults);
}

export async function clearGameResults(): Promise<void> {
  await removeItem(STORAGE_KEYS.gameResults);
}