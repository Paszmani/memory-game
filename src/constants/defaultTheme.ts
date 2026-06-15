import type { CustomTheme } from '@/types/theme';

export const DEFAULT_THEME: CustomTheme = {
  id: 'default',
  name: 'Clássico',
  description: 'Tema padrão com emojis.',
  isDefault: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  cards: [
    {
      id: 'default-card-1',
      label: 'Foguete',
      emoji: '🚀',
    },
    {
      id: 'default-card-2',
      label: 'Estrela',
      emoji: '⭐',
    },
    {
      id: 'default-card-3',
      label: 'Coração',
      emoji: '💙',
    },
    {
      id: 'default-card-4',
      label: 'Troféu',
      emoji: '🏆',
    },
    {
      id: 'default-card-5',
      label: 'Controle',
      emoji: '🎮',
    },
    {
      id: 'default-card-6',
      label: 'Diamante',
      emoji: '💎',
    },
    {
      id: 'default-card-7',
      label: 'Quebra-cabeça',
      emoji: '🧩',
    },
    {
      id: 'default-card-8',
      label: 'Alvo',
      emoji: '🎯',
    },
  ],
};