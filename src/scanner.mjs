// The code scanner (batch 20): a fixed family of arithmetic patterns over
// sura number, verse count, word count and letter count, evaluated on any
// arrangement of the 114 suras.
//
// An arrangement is a permutation: perm[position] = sura (both 1..114).
// A pattern = (grouping rule, aggregate, kind of hit). See PREREGISTRATION_batch20.md.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from './corpus.mjs';
import { rng } from './stats.mjs';

const N = 114;
const isMark = (c) => /[ً-ٰٕۖ-ۭـ]/.test(c);
const strip = (w) => [...w].filter((c) => !isMark(c)).join('');

// Verse, word and letter counts per sura from the Tanzil Uthmani text.
// Words: whitespace-separated tokens holding at least one letter.
// Letters: base letters, marks and the standalone hamza not counted.
// The basmala prefixed to verse 1 is left out, except in sura 1 where it is the verse.
export function loadCounts(file = path.join(ROOT_DIR, 'data', 'quran-uthmani.txt')) {
  const V = new Int32Array(N + 1);
  const W = new Int32Array(N + 1);
  const L = new Int32Array(N + 1);
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
    if (!m) continue;
    const s = +m[1];
    const v = +m[2];
    let words = m[3].trim().split(/\s+/).filter((w) => strip(w).length > 0);
    if (v === 1 && s !== 1 && s !== 9 && strip(words[0]) === 'بسم') words = words.slice(4);
    V[s]++;
    W[s] += words.length;
    for (const w of words) for (const ch of strip(w)) if (ch !== 'ء') L[s]++;
  }
  return { V, W, L };
}

export const DIVISORS = [2, 3, 5, 7, 19];
export const QUANTITIES = ['number', 'verses', 'words', 'letters', 'number+verses', 'number+words', 'number+letters'];
export const AGGREGATES = ['how many suras', 'sum of numbers', 'sum of verses', 'sum of words', 'sum of letters', 'sum of number+verses', 'sum of number+words', 'sum of number+letters'];
export const KINDS = ['equal', 'total', 'both divisible by 7', 'both divisible by 19'];
const NQ = QUANTITIES.length;
const NP = DIVISORS.length + 1; // divisors, then "prime"
const R_VGTN = NQ * NP;
const R_HALF = NQ * NP + 1;
export const NRULES = NQ * NP + 2;
const NF = AGGREGATES.length;
const NK = KINDS.length;
export const NPATTERNS = NRULES * NF * NK;

export const ruleName = (r) => {
  if (r === R_VGTN) return 'verses greater than number';
  if (r === R_HALF) return 'number at most 57';
  const q = QUANTITIES[Math.floor(r / NP)];
  const p = r % NP;
  return p < DIVISORS.length ? `${q} divisible by ${DIVISORS[p]}` : `${q} prime`;
};
export const patternParts = (k) => ({ rule: Math.floor(k / (NF * NK)), aggregate: Math.floor(k / NK) % NF, kind: k % NK });
export const patternName = (k) => {
  const p = patternParts(k);
  return `[${ruleName(p.rule)}] ${AGGREGATES[p.aggregate]}: ${KINDS[p.kind]}`;
};
// The one rule whose outcome was known before the plan was written.
export const KNOWN_RULE = QUANTITIES.indexOf('number+verses') * NP + DIVISORS.indexOf(2);

export function makeScanner({ V, W, L }) {
  let maxX = 0;
  for (let s = 1; s <= N; s++) maxX = Math.max(maxX, L[s] + N, W[s] + N, V[s] + N);
  const prime = new Uint8Array(maxX + 1).fill(1);
  prime[0] = prime[1] = 0;
  for (let i = 2; i * i <= maxX; i++) if (prime[i]) for (let j = i * i; j <= maxX; j += i) prime[j] = 0;

  const TOT = new Float64Array(NF);
  TOT[0] = N;
  for (let s = 1; s <= N; s++) {
    TOT[1] += s;
    TOT[2] += V[s];
    TOT[3] += W[s];
    TOT[4] += L[s];
  }
  TOT[5] = TOT[1] + TOT[2];
  TOT[6] = TOT[1] + TOT[3];
  TOT[7] = TOT[1] + TOT[4];
  const TARGETS = [TOT[0], TOT[1], TOT[2], TOT[3], TOT[4]];
  const isTarget = (x) => x === TARGETS[0] || x === TARGETS[1] || x === TARGETS[2] || x === TARGETS[3] || x === TARGETS[4];

  const acc = new Float64Array(NRULES * 5); // per rule: count, sum n, sum v, sum w, sum l of the "yes" group
  const xs = new Int32Array(NQ);
  const A = new Float64Array(NF);

  // Group aggregates of every rule for an arrangement.
  function accumulate(perm) {
    acc.fill(0);
    for (let pos = 1; pos <= N; pos++) {
      const s = perm[pos];
      const v = V[s];
      const w = W[s];
      const l = L[s];
      xs[0] = pos;
      xs[1] = v;
      xs[2] = w;
      xs[3] = l;
      xs[4] = pos + v;
      xs[5] = pos + w;
      xs[6] = pos + l;
      for (let q = 0; q < NQ; q++) {
        const x = xs[q];
        for (let d = 0; d < DIVISORS.length; d++)
          if (x % DIVISORS[d] === 0) {
            const o = (q * NP + d) * 5;
            acc[o]++;
            acc[o + 1] += pos;
            acc[o + 2] += v;
            acc[o + 3] += w;
            acc[o + 4] += l;
          }
        if (prime[x]) {
          const o = (q * NP + DIVISORS.length) * 5;
          acc[o]++;
          acc[o + 1] += pos;
          acc[o + 2] += v;
          acc[o + 3] += w;
          acc[o + 4] += l;
        }
      }
      if (v > pos) {
        const o = R_VGTN * 5;
        acc[o]++;
        acc[o + 1] += pos;
        acc[o + 2] += v;
        acc[o + 3] += w;
        acc[o + 4] += l;
      }
      if (pos <= 57) {
        const o = R_HALF * 5;
        acc[o]++;
        acc[o + 1] += pos;
        acc[o + 2] += v;
        acc[o + 3] += w;
        acc[o + 4] += l;
      }
    }
  }
  function loadRule(r) {
    const o = r * 5;
    A[0] = acc[o];
    A[1] = acc[o + 1];
    A[2] = acc[o + 2];
    A[3] = acc[o + 3];
    A[4] = acc[o + 4];
    A[5] = A[1] + A[2];
    A[6] = A[1] + A[3];
    A[7] = A[1] + A[4];
  }

  // Fill out[k] = 1 where pattern k holds.
  function scan(perm, out) {
    accumulate(perm);
    let k = 0;
    for (let r = 0; r < NRULES; r++) {
      loadRule(r);
      const both = A[0] > 0 && A[0] < N;
      for (let f = 0; f < NF; f++) {
        const a = A[f];
        const b = TOT[f] - a;
        out[k++] = both && a === b ? 1 : 0;
        out[k++] = both && (isTarget(a) || isTarget(b)) ? 1 : 0;
        out[k++] = both && a % 7 === 0 && b % 7 === 0 ? 1 : 0;
        out[k++] = both && a % 19 === 0 && b % 19 === 0 ? 1 : 0;
      }
    }
    return out;
  }

  // The two group values of a pattern, for reporting.
  function values(perm, k) {
    accumulate(perm);
    const p = patternParts(k);
    loadRule(p.rule);
    return { groupSize: A[0], yes: A[p.aggregate], no: TOT[p.aggregate] - A[p.aggregate] };
  }

  // Distance of an "equal" or "total" pattern from holding (0 = holds). Used only to plant patterns in the check.
  function deviation(perm, k, reuse = false) {
    if (!reuse) accumulate(perm);
    const p = patternParts(k);
    loadRule(p.rule);
    const a = A[p.aggregate];
    const b = TOT[p.aggregate] - a;
    const empty = !(A[0] > 0 && A[0] < N);
    if (p.kind === 0) return Math.abs(a - b) + (empty ? 1e9 : 0);
    if (p.kind === 1) {
      let best = Infinity;
      for (const t of TARGETS) best = Math.min(best, Math.abs(a - t), Math.abs(b - t));
      return best + (empty ? 1e9 : 0);
    }
    throw new Error('deviation is defined for "equal" and "total" patterns only');
  }

  return { scan, values, deviation, totals: Array.from(TOT) };
}

export const identity = () => {
  const p = new Int32Array(N + 1);
  for (let i = 1; i <= N; i++) p[i] = i;
  return p;
};

// Null A: the 114 suras in a uniformly random order.
export function freeOrders(seed) {
  const rand = rng(seed);
  const perm = identity();
  return () => {
    for (let i = N; i > 1; i--) {
      const j = 1 + Math.floor(rand() * i);
      const t = perm[i];
      perm[i] = perm[j];
      perm[j] = t;
    }
    return perm;
  };
}

// Null B: random orders that run from long to short as loosely as the real
// order does (the method of batch 11). Each sura gets the key
// -ln(words) + noise; the noise is calibrated so that the mean number of pairs
// out of length order equals the real order's; draws within 10% of it are kept.
export function matchedOrders(W, seed) {
  const rand = rng(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const disorder = (perm) => {
    let d = 0;
    for (let a = 1; a <= N; a++) {
      const wa = W[perm[a]];
      for (let b = a + 1; b <= N; b++) if (wa < W[perm[b]]) d++;
    }
    return d;
  };
  const target = disorder(identity());
  const base = new Float64Array(N + 1);
  for (let s = 1; s <= N; s++) base[s] = -Math.log(W[s]);
  const keys = new Float64Array(N + 1);
  const idx = Array.from({ length: N }, (_, i) => i + 1);
  const perm = new Int32Array(N + 1);
  const draw = (sigma) => {
    for (let s = 1; s <= N; s++) keys[s] = base[s] + sigma * gauss();
    idx.sort((a, b) => keys[a] - keys[b]);
    for (let i = 0; i < N; i++) perm[i + 1] = idx[i];
    return perm;
  };
  let lo = 0;
  let hi = 4;
  for (let it = 0; it < 30; it++) {
    const mid = (lo + hi) / 2;
    let m = 0;
    for (let k = 0; k < 300; k++) m += disorder(draw(mid));
    if (m / 300 < target) lo = mid;
    else hi = mid;
  }
  const sigma = (lo + hi) / 2;
  const stats = { sigma, target, generated: 0, kept: 0 };
  const next = () => {
    for (;;) {
      const p = draw(sigma);
      stats.generated++;
      if (Math.abs(disorder(p) - target) <= 0.1 * target) {
        stats.kept++;
        return p;
      }
    }
  };
  next.stats = stats;
  return next;
}

// How often each pattern holds across `draws` arrangements, and the surprise
// weight of each: -log10(frequency), with frequency floored at 1/(draws+1).
export function calibrate(scanner, next, draws) {
  const hits = new Float64Array(NPATTERNS);
  const out = new Uint8Array(NPATTERNS);
  for (let d = 0; d < draws; d++) {
    scanner.scan(next(), out);
    for (let k = 0; k < NPATTERNS; k++) hits[k] += out[k];
  }
  const freq = new Float64Array(NPATTERNS);
  const weight = new Float64Array(NPATTERNS);
  for (let k = 0; k < NPATTERNS; k++) {
    freq[k] = hits[k] / draws;
    weight[k] = -Math.log10(Math.max(freq[k], 1 / (draws + 1)));
    if (weight[k] < 1e-12) weight[k] = 0;
  }
  return { freq, weight, draws };
}

// The pre-registered sub-families, as masks over patterns.
export function masks() {
  const m = { primary: new Uint8Array(NPATTERNS), identities: new Uint8Array(NPATTERNS), divisibility: new Uint8Array(NPATTERNS), everything: new Uint8Array(NPATTERNS) };
  for (let k = 0; k < NPATTERNS; k++) {
    const p = patternParts(k);
    m.everything[k] = 1;
    if (p.rule === KNOWN_RULE) continue;
    m.primary[k] = 1;
    if (p.kind <= 1) m.identities[k] = 1;
    else m.divisibility[k] = 1;
  }
  return m;
}

// Statistics of one scanned arrangement under a mask.
export function score(out, weight, mask) {
  let surprise = 0;
  let count = 0;
  let rarest = 0;
  for (let k = 0; k < NPATTERNS; k++)
    if (out[k] && mask[k]) {
      surprise += weight[k];
      if (weight[k] > 0) count++;
      if (weight[k] > rarest) rarest = weight[k];
    }
  return { surprise, count, rarest };
}
