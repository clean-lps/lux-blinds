import type { SnapsInput } from '@/contracts/product-rules';

const FACTORS: Record<string, number> = {
  '80%': 0.48,
  '100%': 0.52,
  '120%': 0.58,
};

function normalizeOpening(opening: unknown): { crazy: boolean; centerOpen: boolean } | null {
  if (typeof opening !== 'string') return null;

  const normalized = opening.trim().toUpperCase().replace(/\s+/g, ' ');
  const crazy = normalized.includes('CRAZY');
  const centerOpen = normalized.includes('C/O') || normalized.includes('CENTER OPEN') || normalized.includes('CENTER-OPEN');
  const oneWay = normalized.includes('O/W');

  if (!centerOpen && !oneWay) return null;
  return { crazy, centerOpen };
}

function forceOdd(value: number): number {
  const integer = Math.max(0, Math.trunc(value));
  if (integer === 0) return 0;
  return integer % 2 === 0 ? integer + 1 : integer;
}

function forceEven(value: number): number {
  const integer = Math.max(0, Math.trunc(value));
  if (integer === 0) return 0;
  return integer % 2 === 0 ? integer + 2 : integer + 1;
}

export function suggestSnaps(input: SnapsInput): string | null {
  const widthEighths = input?.widthEighths;
  if (!Number.isFinite(widthEighths) || !Number.isInteger(widthEighths) || widthEighths <= 0) return null;

  const factor = FACTORS[String(input.fullness ?? '').trim()];
  const opening = normalizeOpening(input.opening);
  if (!factor || !opening) return null;

  const base = (widthEighths / 8) * factor;
  const rounded = Math.floor((opening.centerOpen ? base / 2 : base) + 0.5);
  const count = opening.crazy ? forceEven(rounded) : forceOdd(rounded);

  return opening.centerOpen ? `${count} / ${count}` : String(count);
}
