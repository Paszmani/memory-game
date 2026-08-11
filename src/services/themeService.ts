import { DEFAULT_THEME } from '@/constants/defaultTheme';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { validateThemeInput } from '@/domain/theme/themeValidation';
import { getJson, setJson, removeItem } from '@/services/storageService';
import { CreateThemeInput, CustomTheme, CustomThemeCard } from '@/types/theme';
import { createId } from '@/utils/id';

export async function getThemes(): Promise<CustomTheme[]> {
  const customThemes = await getJson<CustomTheme[]>(
    STORAGE_KEYS.customThemes,
    [],
  );

  return [DEFAULT_THEME, ...customThemes];
}

export async function createCustomTheme(
  input: CreateThemeInput,
): Promise<CustomTheme> {
  const validation = validateThemeInput(input);

  if (!validation.isValid) {
    throw new Error(validation.errors.join('\n'));
  }

  const customThemes = await getJson<CustomTheme[]>(
    STORAGE_KEYS.customThemes,
    [],
  );

  const now = new Date().toISOString();

  const newTheme: CustomTheme = {
    id: createId('theme'),
    name: input.name.trim(),
    cards: input.cards,
    createdAt: now,
    updatedAt: now,
  };

  await setJson(STORAGE_KEYS.customThemes, [newTheme, ...customThemes]);

  return newTheme;
}

export async function deleteCustomTheme(themeId: string): Promise<void> {
  const customThemes = await getJson<CustomTheme[]>(
    STORAGE_KEYS.customThemes,
    [],
  );

  const nextThemes = customThemes.filter((theme) => theme.id !== themeId);

  await setJson(STORAGE_KEYS.customThemes, nextThemes);
}

export async function clearCustomThemes(): Promise<void> {
  await removeItem(STORAGE_KEYS.customThemes);
}

export async function getCustomThemes(): Promise<CustomTheme[]> {
  return getJson<CustomTheme[]>(STORAGE_KEYS.customThemes, []);
}

/**
 * Grava temas de cartas vindos de um arquivo de tema exportado (settingsTransfer).
 * Cada tema entra como NOVO (id/timestamps regerados) — importar o mesmo arquivo
 * duas vezes duplica, de propósito: não sobrescreve o que o operador já tem.
 * Sem validação estrita (o filtro/saneamento é feito na camada de import).
 */
export async function importCustomThemes(
  incoming: { name: string; description?: string; cards: CustomThemeCard[] }[],
): Promise<number> {
  if (incoming.length === 0) return 0;

  const existing = await getJson<CustomTheme[]>(STORAGE_KEYS.customThemes, []);
  const now = new Date().toISOString();

  const added: CustomTheme[] = incoming.map((theme) => ({
    id: createId('theme'),
    name: theme.name,
    ...(theme.description ? { description: theme.description } : {}),
    cards: theme.cards,
    createdAt: now,
    updatedAt: now,
  }));

  await setJson(STORAGE_KEYS.customThemes, [...added, ...existing]);

  return added.length;
}

export async function updateCustomTheme(
  id: string,
  input: Partial<CreateThemeInput>,
): Promise<CustomTheme> {
  const themes = await getCustomThemes();
  const index  = themes.findIndex((t) => t.id === id);

  if (index === -1) throw new Error('Tema não encontrado.');

  const updated: CustomTheme = {
    ...themes[index],
    ...(input.name        ? { name:        input.name.trim() }        : {}),
    ...(input.description ? { description: input.description.trim() } : {}),
    ...(input.cards       ? { cards:       input.cards }               : {}),
    updatedAt: new Date().toISOString(),
  };

  themes[index] = updated;
  await setJson(STORAGE_KEYS.customThemes, themes);

  return updated;
}
