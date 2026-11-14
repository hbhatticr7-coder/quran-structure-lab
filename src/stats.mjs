// Small dependency-free statistics helpers.

// Seeded PRNG (mulberry32) so every run is reproducible.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const mean = (xs) => xs.reduce((t, x) => t + x, 0) / xs.length;

export function sd(xs) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((t, x) => t + (x - m) ** 2, 0) / xs.length);
}

// One-sided permutation p-value with the +1 correction.
export function pUpper(observed, nullValues) {
  let ge = 0;
  for (const x of nullValues) if (x >= observed - 1e-12) ge++;
  return (ge + 1) / (nullValues.length + 1);
}

// All perfect matchings of an even-length list: [[ [a,b], [c,d], ... ], ...]
export function allMatchings(items) {
  if (items.length === 0) return [[]];
  const [first, ...rest] = items;
  const out = [];
  for (let i = 0; i < rest.length; i++) {
    const partner = rest[i];
    const remaining = rest.filter((_, k) => k !== i);
    for (const m of allMatchings(remaining)) out.push([[first, partner], ...m]);
  }
  return out;
}
