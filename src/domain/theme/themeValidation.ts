import { CreateThemeInput } from '@/types/theme';

export type ThemeValidationResult = {
  isValid: boolean;
  errors: string[];
};

export function validateThemeInput(
  input: CreateThemeInput,
): ThemeValidationResult {
  const errors: string[] = [];

  if (input.name.trim().length < 3) {
    errors.push('O nome do tema precisa ter pelo menos 3 caracteres.');
  }

  if (input.cards.length < 2) {
    errors.push('O tema precisa ter pelo menos 2 cartas.');
  }

  const invalidCards = input.cards.filter(
    (card) => !card.emoji && !card.imageUri,
  );

  if (invalidCards.length > 0) {
    errors.push('Todas as cartas precisam ter um emoji ou uma imagem.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}