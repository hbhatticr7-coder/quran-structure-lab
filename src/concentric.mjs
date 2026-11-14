// Outline-free detector of concentric (ring) structure.
//
// A text unit is cut into B blocks of equal size. If the unit is a ring around
// some centre, then blocks at mirrored positions (c-1, c+1), (c-2, c+2), ...
// resemble each other, so high similarities line up along one anti-diagonal of
// the block-by-block similarity matrix. The detector asks whether any
// anti-diagonal is stronger than chance placement of the same similarities.
import { vector, cosine } from './similarity.mjs';
import { rng, shuffle } from './stats.mjs';

// verses: array of token arrays. Returns B blocks [{ tokens, from, to }] (verse
// indices, inclusive) with near-equal token counts, cut at verse boundaries.
export function makeBlocks(verses, B) {
  const n = verses.length;
  if (n < B) return null;
  const cum = [];
  let t = 0;
  for (const v of verses) cum.push((t += v.length));
  const total = t;
  // Cut after verse c_k, the boundary nearest to k/B of the text, keeping the
  // cuts strictly increasing and leaving at least one verse per later block.
  const cuts = [];
  let prev = -1;
  for (let k = 1; k < B; k++) {
    const target = (k * total) / B;
    const lo = prev + 1;
    const hi = n - 1 - (B - k);
    let best = lo;
    for (let i = lo; i <= hi; i++) if (Math.abs(cum[i] - target) < Math.abs(cum[best] - target)) best = i;
    cuts.push(best);
    prev = best;
  }
  const blocks = [];
  let from = 0;
  for (const c of [...cuts, n - 1]) {
    blocks.push({ from, to: c, tokens: verses.slice(from, c + 1).flat() });
    from = c + 1;
  }
  return blocks.every((b) => b.tokens.length > 0) ? blocks : null;
}

export function similarityMatrix(blocks, idf) {
  const vec = blocks.map((b) => vector(b.tokens, idf));
  const B = blocks.length;
  const S = Array.from({ length: B }, () => new Float64Array(B));
  for (let i = 0; i < B; i++) for (let j = i + 1; j < B; j++) S[i][j] = S[j][i] = cosine(vec[i], vec[j]);
  return S;
}

// Entries used: block pairs at least MIN_SEP apart. Each gets a score; scores
// are standardised; an anti-diagonal's strength is sum(z) / sqrt(count).
const MIN_SEP = 3;
const MIN_PAIRS = 3;

function entries(B) {
  const list = [];
  for (let i = 0; i < B; i++) for (let j = i + MIN_SEP; j < B; j++) list.push([i, j]);
  return list;
}

// 'align': similarity with the linear trend in separation removed.
// 'strict': similarity minus the mean of its four neighbours in the matrix, so
// only a partner that beats the partner's own neighbours counts.
function scores(S, B, mode) {
  const E = entries(B);
  let raw;
  if (mode === 'strict') {
    raw = E.map(([i, j]) => {
      const nb = [];
      for (const [a, b] of [[i, j - 1], [i, j + 1], [i - 1, j], [i + 1, j]]) if (a >= 0 && b < B && b - a >= 2) nb.push(S[a][b]);
      return S[i][j] - nb.reduce((t, x) => t + x, 0) / nb.length;
    });
  } else {
    const d = E.map(([i, j]) => j - i);
    const y = E.map(([i, j]) => S[i][j]);
    const md = d.reduce((t, x) => t + x, 0) / d.length;
    const my = y.reduce((t, x) => t + x, 0) / y.length;
    let sxy = 0;
    let sxx = 0;
    for (let k = 0; k < d.length; k++) {
      sxy += (d[k] - md) * (y[k] - my);
      sxx += (d[k] - md) ** 2;
    }
    const slope = sxx > 0 ? sxy / sxx : 0;
    raw = y.map((v, k) => v - my - slope * (d[k] - md));
  }
  const m = raw.reduce((t, x) => t + x, 0) / raw.length;
  const sd = Math.sqrt(raw.reduce((t, x) => t + (x - m) ** 2, 0) / raw.length) || 1;
  return { E, z: raw.map((x) => (x - m) / sd) };
}

// Returns { stat, centre, p } where centre is in block units (0-based, may be x.5)
// and p is the permutation p-value of the strongest anti-diagonal (it already
// accounts for having searched over all centres).
export function detectRing(S, { mode = 'align', perms = 5000, seed = 1 } = {}) {
  const B = S.length;
  const { E, z } = scores(S, B, mode);
  // Group entry indices by anti-diagonal a = i + j.
  const diag = new Map();
  E.forEach(([i, j], k) => {
    const a = i + j;
    if (!diag.has(a)) diag.set(a, []);
    diag.get(a).push(k);
  });
  const groups = [...diag].filter(([, ks]) => ks.length >= MIN_PAIRS);
  if (groups.length === 0) return null;
  const best = (zz) => {
    let top = -Infinity;
    let at = null;
    for (const [a, ks] of groups) {
      let s = 0;
      for (const k of ks) s += zz[k];
      s /= Math.sqrt(ks.length);
      if (s > top) {
        top = s;
        at = a;
      }
    }
    return [top, at];
  };
  const [stat, a] = best(z);
  const rand = rng(seed);
  let ge = 0;
  if (mode === 'strict') {
    // Neighbouring contrast scores share terms, so the scores themselves are not
    // exchangeable. Shuffle the raw similarities (all pairs at least 2 apart),
    // then recompute the contrasts.
    const cells = [];
    for (let i = 0; i < B; i++) for (let j = i + 2; j < B; j++) cells.push([i, j]);
    const vals = cells.map(([i, j]) => S[i][j]);
    const Sp = Array.from({ length: B }, (_, i) => Float64Array.from(S[i]));
    for (let b = 0; b < perms; b++) {
      shuffle(vals, rand);
      cells.forEach(([i, j], k) => {
        Sp[i][j] = Sp[j][i] = vals[k];
      });
      if (best(scores(Sp, B, mode).z)[0] >= stat - 1e-12) ge++;
    }
  } else {
    const zp = z.slice();
    for (let b = 0; b < perms; b++) {
      shuffle(zp, rand);
      if (best(zp)[0] >= stat - 1e-12) ge++;
    }
  }
  const ks = diag.get(a);
  const pairs = ks.map((k) => ({ i: E[k][0], j: E[k][1], z: z[k], similarity: S[E[k][0]][E[k][1]] }));
  return { stat, centre: a / 2, p: (ge + 1) / (perms + 1), pairs, guard: betweenGuard(S, pairs) };
}

// Guard against one long uniform section being mistaken for a ring.
// In a ring, mirror partners resemble each other more than they resemble the
// blocks lying between them. In a uniform section they do not.
// For each mirror pair (i, j) with blocks strictly between i+1 and j-1:
//   contrast = sim(i, j) - mean over those blocks k of (sim(i, k) + sim(k, j)) / 2
// The guard passes if the mean contrast is positive and at least half the pairs are positive.
export function betweenGuard(S, pairs) {
  const contrasts = [];
  for (const { i, j } of pairs) {
    let t = 0;
    let n = 0;
    for (let k = i + 2; k <= j - 2; k++) {
      t += (S[i][k] + S[k][j]) / 2;
      n++;
    }
    if (n > 0) contrasts.push(S[i][j] - t / n);
  }
  if (contrasts.length === 0) return { passes: false, meanContrast: 0, positive: 0, of: 0 };
  const meanContrast = contrasts.reduce((t, x) => t + x, 0) / contrasts.length;
  const positive = contrasts.filter((x) => x > 0).length;
  return { passes: meanContrast > 0 && positive * 2 >= contrasts.length, meanContrast, positive, of: contrasts.length };
}

// Parallel structure (A B C ... A B C ...): blocks a fixed distance apart
// resemble each other, so high similarities line up along one off-diagonal.
// Uses the 'strict' contrast scores, which compare each pair with its
// neighbours at slightly shorter and longer distances, so a smooth fall-off of
// similarity with distance does not count. Null: shuffle the raw similarities.
export function detectParallel(S, { perms = 5000, seed = 1 } = {}) {
  const B = S.length;
  const group = (E) => {
    const bands = new Map();
    E.forEach(([i, j], k) => {
      const d = j - i;
      if (!bands.has(d)) bands.set(d, []);
      bands.get(d).push(k);
    });
    return [...bands].filter(([, ks]) => ks.length >= MIN_PAIRS);
  };
  const first = scores(S, B, 'strict');
  const groups = group(first.E);
  if (groups.length === 0) return null;
  const best = (zz) => {
    let top = -Infinity;
    let at = null;
    for (const [d, ks] of groups) {
      let s = 0;
      for (const k of ks) s += zz[k];
      s /= Math.sqrt(ks.length);
      if (s > top) {
        top = s;
        at = d;
      }
    }
    return [top, at];
  };
  const [stat, offset] = best(first.z);
  const rand = rng(seed);
  const cells = [];
  for (let i = 0; i < B; i++) for (let j = i + 2; j < B; j++) cells.push([i, j]);
  const vals = cells.map(([i, j]) => S[i][j]);
  const Sp = Array.from({ length: B }, (_, i) => Float64Array.from(S[i]));
  let ge = 0;
  for (let b = 0; b < perms; b++) {
    shuffle(vals, rand);
    cells.forEach(([i, j], k) => {
      Sp[i][j] = Sp[j][i] = vals[k];
    });
    if (best(scores(Sp, B, 'strict').z)[0] >= stat - 1e-12) ge++;
  }
  return { stat, offset, p: (ge + 1) / (perms + 1) };
}
