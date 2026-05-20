export function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '');
  const fullHex = cleaned.length === 3
    ? cleaned.split('').map(c => c + c).join('')
    : cleaned;

  const r = parseInt(fullHex.slice(0, 2), 16);
  const g = parseInt(fullHex.slice(2, 4), 16);
  const b = parseInt(fullHex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getContrastColor(hex: string): '#000000' | '#FFFFFF' {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);

  // Fórmula de luminância relativa (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function isValidHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

export function lerpColor(colorA: string, colorB: string, t: number): string {
  const parse = (hex: string) => {
    const c = hex.replace('#', '');
    return [
      parseInt(c.slice(0, 2), 16),
      parseInt(c.slice(2, 4), 16),
      parseInt(c.slice(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = parse(colorA);
  const [r2, g2, b2] = parse(colorB);

  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(lerp(r1, r2))}${toHex(lerp(g1, g2))}${toHex(lerp(b1, b2))}`;
}