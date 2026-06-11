export const colors = {
  background: '#020B1F',

  surface: '#061A3D',
  surfaceElevated: '#082653',
  surfaceLight: '#0D3470',

  primary: '#0D47A1',
  primaryDark: '#082E6F',
  primaryGlow: 'rgba(13, 71, 161, 0.22)',

  success: '#4FC3F7',
  successGlow: 'rgba(79, 195, 247, 0.16)',

  danger: '#FF4444',
  warning: '#1E88E5',

  text: '#FFFFFF',
  textSecondary: '#D6E6FF',
  textMuted: '#7FA6D9',

  border: '#1E5AA8',
  borderLight: '#2E78D6',

  overlay: 'rgba(2, 11, 31, 0.92)',

  glass: 'rgba(6, 26, 61, 0.82)',
  glassBorder: 'rgba(46, 120, 214, 0.35)',
} as const;

export type ColorKey = keyof typeof colors;