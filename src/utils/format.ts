const SECONDS_PER_MINUTE = 60;
const PAD_LENGTH = 2;
const PAD_CHAR = '0';

export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  const mm = String(minutes).padStart(PAD_LENGTH, PAD_CHAR);
  const ss = String(seconds).padStart(PAD_LENGTH, PAD_CHAR);

  return `${mm}:${ss}`;
}

export function formatDateTime(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

export function formatScore(score: number): string {
  return score.toLocaleString('pt-BR');
}

export function formatPlural(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}