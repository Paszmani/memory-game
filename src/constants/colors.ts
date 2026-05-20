export const colors = {
  background:       'rgb(10, 10, 10)',
  surface:          '#141B2D',
  surfaceElevated:  '#1E2A42',
  surfaceLight:     '#2A3A5C',

  primary:          '#4FC3F7',
  primaryDark:      '#0288D1',
  primaryGlow:      'rgba(79, 195, 247, 0.2)',

  success:          '#00E676',
  successGlow:      'rgba(0, 230, 118, 0.15)',
  danger:           '#FF5252',
  dangerGlow:       'rgba(255, 82, 82, 0.15)',
  warning:          '#FFD740',

  text:             '#F0F4FF',
  textSecondary:    '#B0BEC5',
  textMuted:        '#607D8B',

  border:           '#2A3A5C',
  borderLight:      '#3D5270',

  overlay:          'rgba(10, 15, 30, 0.88)',
  glass:            'rgba(20, 27, 45, 0.75)',
  glassBorder:      'rgba(79, 195, 247, 0.15)',
} as const;

export type ColorKey = keyof typeof colors;