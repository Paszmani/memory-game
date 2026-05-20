export const STORAGE_KEYS = {
  customThemes: '@memory_game/custom_themes',
  gameResults:  '@memory_game/game_results',
  appSettings:  '@memory_game/app_settings',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];