export type CustomThemeCard = {
  id: string;
  label: string;
  emoji?: string;
  imageUri?: string;
};

export type CustomTheme = {
  id: string;
  name: string;
  cards: CustomThemeCard[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateThemeInput = {
  name: string;
  cards: CustomThemeCard[];
};