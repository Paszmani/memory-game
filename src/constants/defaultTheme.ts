import { CustomTheme } from '@/types/theme';

export const DEFAULT_THEME: CustomTheme = {
  id: 'default-emojis',
  name: 'Emojis padrão',
  isDefault: true,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  cards: [
    { id: 'cat', label: 'Gato', emoji: '🐱' },
    { id: 'dog', label: 'Cachorro', emoji: '🐶' },
    { id: 'fox', label: 'Raposa', emoji: '🦊' },
    { id: 'panda', label: 'Panda', emoji: '🐼' },
    { id: 'lion', label: 'Leão', emoji: '🦁' },
    { id: 'monkey', label: 'Macaco', emoji: '🐵' },
    { id: 'frog', label: 'Sapo', emoji: '🐸' },
    { id: 'penguin', label: 'Pinguim', emoji: '🐧' },
    { id: 'pizza', label: 'Pizza', emoji: '🍕' },
    { id: 'burger', label: 'Hambúrguer', emoji: '🍔' },
    { id: 'apple', label: 'Maçã', emoji: '🍎' },
    { id: 'star', label: 'Estrela', emoji: '⭐' },
  ],
};