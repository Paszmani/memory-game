import { STORAGE_KEYS } from '@/constants/storageKeys';
import { GameResult } from '@/types/game';
import { getJson, removeItem, setJson } from '@/services/storageService';

export async function getGameResults(): Promise<GameResult[]> {
  try {
    const results = await getJson<GameResult[]>(STORAGE_KEYS.gameResults, []);
    return results.sort((a, b) => b.score - a.score);
  } catch (err) {
    console.warn('[scoreService] Erro ao carregar resultados:', err);
    return [];
  }
}

export async function saveGameResult(result: GameResult): Promise<void> {
  try {
    const results = await getJson<GameResult[]>(STORAGE_KEYS.gameResults, []);

    const nextResults = [result, ...results]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    await setJson(STORAGE_KEYS.gameResults, nextResults);
  } catch (err) {
    throw new Error(
      `Não foi possível salvar o resultado: ${err instanceof Error ? err.message : String(err)}`,
    );  
  }
}

export async function clearGameResults(): Promise<void> {
  try {
    await removeItem(STORAGE_KEYS.gameResults);
  } catch (err) {
    throw new Error(
      `Não foi possível limpar os resultados: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}