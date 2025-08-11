// Deterministic helpers to bind each level to a specific question/options order

export function levelIndex(level: number, length: number): number {
  if (length <= 0) return 0;
  return Math.abs(((level - 1) % length));
}

export function cyclePick<T>(array: T[], level: number, count: number): T[] {
  const start = levelIndex(level, array.length);
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(array[(start + i) % array.length]);
  }
  return result;
}

export function rotateArray<T>(array: T[], rotations: number): T[] {
  if (array.length === 0) return [];
  const r = ((rotations % array.length) + array.length) % array.length;
  return array.slice(r).concat(array.slice(0, r));
}

function hashSalt(salt: number | string): number {
  if (typeof salt === 'number') return Math.abs(salt) + 1;
  // djb2 simple hash
  let hash = 5381;
  for (let i = 0; i < salt.length; i++) {
    hash = ((hash << 5) + hash) + salt.charCodeAt(i);
  }
  return Math.abs(hash);
}

// Deterministic integer in [min, maxExclusive)
export function numberForLevel(level: number, min: number, maxExclusive: number, salt: number | string = 1): number {
  const range = maxExclusive - min;
  if (range <= 0) return min;
  const h = hashSalt(salt);
  const idx = (level * 1103515245 + h) >>> 0; // LCG-like
  const mod = idx % range;
  return min + mod;
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return Math.abs(a);
}

// Returns a co-prime step relative to modulus based on a seed
export function coprimeStep(modulus: number, seed: number = 97): number {
  if (modulus <= 1) return 1;
  let step = Math.max(2, seed % modulus);
  while (gcd(step, modulus) !== 1) {
    step = (step + 1) % modulus;
    if (step < 2) step = 2;
  }
  return step;
}

// Deterministic unique-like index traversal across [0, modulus)
export function uniqueIndex(level: number, modulus: number, seed: number = 97): number {
  if (modulus <= 0) return 0;
  const step = coprimeStep(modulus, seed);
  const idx = ((level - 1) * step) % modulus;
  return idx;
}


