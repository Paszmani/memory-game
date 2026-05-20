const RADIX = 36;
const RANDOM_SLICE_START = 2;
const RANDOM_SLICE_END = 9;

export function createId(prefix = 'id'): string {
  const timestamp = Date.now().toString(RADIX);
  const entropy  = Math.random().toString(RADIX).slice(RANDOM_SLICE_START, RANDOM_SLICE_END);

  return `${prefix}_${timestamp}_${entropy}`;
}