import { DEFAULT_ASSETS } from '@/constants/defaultAssets';
import type { CustomTheme } from '@/types/theme';

export const DEFAULT_THEME: CustomTheme = {
  id: 'default-compro-card',
  name: 'Compro Card',
  description: 'Tema padrão com cartões Compro Card.',
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  cards: [
    {
      id: 'default-card-alimentacao-amor',
      label: 'Alimentação Amor',
      imageUri: DEFAULT_ASSETS.cards.alimentacaoAmor,
    },
    {
      id: 'default-card-compras',
      label: 'Compras',
      imageUri: DEFAULT_ASSETS.cards.compras,
    },
    {
      id: 'default-card-corporativo',
      label: 'Corporativo',
      imageUri: DEFAULT_ASSETS.cards.corporativo,
    },
    {
      id: 'default-card-premiacao',
      label: 'Premiação',
      imageUri: DEFAULT_ASSETS.cards.premiacao,
    },
    {
      id: 'default-card-saude',
      label: 'Saúde',
      imageUri: DEFAULT_ASSETS.cards.saude,
    },
    {
      id: 'default-card-combustivel',
      label: 'Combustível',
      imageUri: DEFAULT_ASSETS.cards.combustivel,
    },
    {
      id: 'default-card-amizade',
      label: 'Amizade',
      imageUri: DEFAULT_ASSETS.cards.amizade,
    },
    {
      id: 'default-card-paz',
      label: 'Paz',
      imageUri: DEFAULT_ASSETS.cards.paz,
    },
    {
      id: 'default-card-gratidao',
      label: 'Gratidão',
      imageUri: DEFAULT_ASSETS.cards.gratidao,
    },
    {
      id: 'default-card-presente',
      label: 'Presente',
      imageUri: DEFAULT_ASSETS.cards.presente,
    },
  ],
};