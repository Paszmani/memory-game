export interface CustomThemeCard {
  id: string;
  label: string;
  emoji?: string;
  imageUri?: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  description?: string;
  cards: CustomThemeCard[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThemeInput {
  name: string;
  description?: string;
  cards: CustomThemeCard[];
}