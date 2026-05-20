import { CreateThemeInput } from '@/types/theme';

const MIN_THEME_NAME_LENGTH = 3;
const MIN_CARDS_COUNT       = 2;

export interface ValidationResult {
  isValid: boolean;
  errors:  string[];
}

function validateName(name: string): string[] {
  if (name.trim().length < MIN_THEME_NAME_LENGTH) {
    return [`O nome deve ter pelo menos ${MIN_THEME_NAME_LENGTH} caracteres.`];
  }
  return [];
}

function validateCards(cards: CreateThemeInput['cards']): string[] {
  const errors: string[] = [];

  if (cards.length < MIN_CARDS_COUNT) {
    errors.push(`O tema precisa ter pelo menos ${MIN_CARDS_COUNT} cartas.`);
  }

  const invalidCount = cards.filter((c) => !c.emoji && !c.imageUri).length;
  if (invalidCount > 0) {
    errors.push(`${invalidCount} carta(s) sem emoji ou imagem.`);
  }

  return errors;
}

export function validateThemeInput(input: CreateThemeInput): ValidationResult {
  const errors = [
    ...validateName(input.name),
    ...validateCards(input.cards),
  ];

  return { isValid: errors.length === 0, errors };
}