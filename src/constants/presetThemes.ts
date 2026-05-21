import { AppSettings } from '@/types/settings';
import { DEFAULT_SETTINGS } from './defaultSettings';

export interface PresetTheme {
  id:       string;
  name:     string;
  emoji:    string;
  preview:  string[]; // 2 cores para preview
  patch:    DeepPartial<AppSettings>;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export const PRESET_THEMES: PresetTheme[] = [
  {
    id:      'dark-blue',
    name:    'Azul Noturno',
    emoji:   '🌊',
    preview: ['#0A0F1E', '#4FC3F7'],
    patch: {
      background: { type: 'gradient', gradientStart: '#0A0F1E', gradientEnd: '#1A2744', gradientDirection: 'vertical', solidColor: '#0A0F1E', overlayOpacity: 0 },
      cardStyle:  { backColor: '#141B2D', frontColor: '#1E2A42', borderColor: '#4FC3F7', matchedColor: '#00E676' },
      ui:         { primaryColor: '#4FC3F7', surfaceColor: '#141B2D', borderColor: '#2A3A5C', textColor: '#F0F4FF' },
    },
  },
  {
    id:      'purple-night',
    name:    'Noite Roxa',
    emoji:   '🌙',
    preview: ['#0D0A1E', '#B39DDB'],
    patch: {
      background: { type: 'gradient', gradientStart: '#0D0A1E', gradientEnd: '#2A1744', gradientDirection: 'vertical', solidColor: '#0D0A1E', overlayOpacity: 0 },
      cardStyle:  { backColor: '#1A1030', frontColor: '#251540', borderColor: '#B39DDB', matchedColor: '#69F0AE' },
      ui:         { primaryColor: '#B39DDB', surfaceColor: '#1A1030', borderColor: '#3D2A60', textColor: '#F0EAFF' },
    },
  },
  {
    id:      'forest',
    name:    'Floresta',
    emoji:   '🌿',
    preview: ['#0A1E0F', '#66BB6A'],
    patch: {
      background: { type: 'gradient', gradientStart: '#0A1E0F', gradientEnd: '#1A3022', gradientDirection: 'vertical', solidColor: '#0A1E0F', overlayOpacity: 0 },
      cardStyle:  { backColor: '#122018', frontColor: '#1C3025', borderColor: '#66BB6A', matchedColor: '#FFEB3B' },
      ui:         { primaryColor: '#66BB6A', surfaceColor: '#122018', borderColor: '#2A4030', textColor: '#E8F5E9' },
    },
  },
  {
    id:      'sunset',
    name:    'Pôr do Sol',
    emoji:   '🌅',
    preview: ['#1E0A10', '#FF7043'],
    patch: {
      background: { type: 'gradient', gradientStart: '#1E0A10', gradientEnd: '#3D1A1A', gradientDirection: 'diagonal', solidColor: '#1E0A10', overlayOpacity: 0 },
      cardStyle:  { backColor: '#2A1018', frontColor: '#3D1820', borderColor: '#FF7043', matchedColor: '#FFD740' },
      ui:         { primaryColor: '#FF7043', surfaceColor: '#2A1018', borderColor: '#5D2A20', textColor: '#FFF3E0' },
    },
  },
  {
    id:      'ocean',
    name:    'Oceano',
    emoji:   '🐋',
    preview: ['#021B30', '#0288D1'],
    patch: {
      background: { type: 'gradient', gradientStart: '#021B30', gradientEnd: '#0A3A5A', gradientDirection: 'vertical', solidColor: '#021B30', overlayOpacity: 0 },
      cardStyle:  { backColor: '#041E30', frontColor: '#0A2A45', borderColor: '#0288D1', matchedColor: '#00BCD4' },
      ui:         { primaryColor: '#0288D1', surfaceColor: '#041E30', borderColor: '#0A3A5A', textColor: '#E3F2FD' },
    },
  },
  {
    id:      'monochrome',
    name:    'Monocromático',
    emoji:   '⚫',
    preview: ['#111111', '#FFFFFF'],
    patch: {
      background: { type: 'solid', solidColor: '#111111', gradientStart: '#111111', gradientEnd: '#333333', gradientDirection: 'vertical', overlayOpacity: 0 },
      cardStyle:  { backColor: '#1A1A1A', frontColor: '#2A2A2A', borderColor: '#888888', matchedColor: '#FFFFFF' },
      ui:         { primaryColor: '#FFFFFF', surfaceColor: '#1A1A1A', borderColor: '#333333', textColor: '#FFFFFF' },
    },
  },
  {
    id:      'high-contrast',
    name:    'Alto Contraste',
    emoji:   '♿',
    preview: ['#000000', '#FFFF00'],
    patch: {
      background: { type: 'solid', solidColor: '#000000', gradientStart: '#000000', gradientEnd: '#000000', gradientDirection: 'vertical', overlayOpacity: 0 },
      cardStyle:  { backColor: '#000000', frontColor: '#111111', borderColor: '#FFFF00', matchedColor: '#00FF00', borderWidth: 3 },
      ui:         { primaryColor: '#FFFF00', surfaceColor: '#111111', borderColor: '#FFFF00', textColor: '#FFFFFF', fontSize: 'large' },
    },
  },
];