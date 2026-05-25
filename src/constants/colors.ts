export const colors = {

  background:      '#0A0A0A',
  surface:         '#141414',
  surfaceElevated: '#1E1E1E',
  surfaceLight:    '#2A2A2A',

  primary:         '#FFD600',
  primaryDark:     '#FFC000',
  primaryGlow:     'rgba(255, 214, 0, 0.18)',

  success:         '#FFFFFF',
  successGlow:     'rgba(255, 255, 255, 0.12)',
  danger:          '#FF4444',
  warning:         '#FF8800',

  text:            '#FFFFFF',
  textSecondary:   '#CCCCCC',
  textMuted:       '#777777',

  border:          '#2A2A2A',
  borderLight:     '#3A3A3A',

  overlay:         'rgba(0, 0, 0, 0.90)',
  glass:           'rgba(20, 20, 20, 0.80)',
  glassBorder:     'rgba(255, 214, 0, 0.25)',
} as const;

export type ColorKey = keyof typeof colors;