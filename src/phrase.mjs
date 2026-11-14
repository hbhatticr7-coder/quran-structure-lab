// Phrase-level variant test (batch 4, Amendment A1) for any corpus.
// units: [{ doc, idx, tokens }] in reading order, idx = position in the array.
import { rng } from './stats.mjs';

export function buildFrames(units) {
  const map = new Map();
  for (const u of units)
    for (let i = 2; i + 2 < u.tokens.length; i++) {
      const key = `${u.tokens[i - 2]} ${u.tokens[i - 1]} _ ${u.tokens[i + 1]} ${u.tokens[i + 2]}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ idx: u.idx, m: u.tokens[i] });
    }
  return [...map]
    .map(([key, occ]) => ({ key, occ }))
    .filter((f) => new Set(f.occ.map((o) => o.m)).size >= 2 && new Set(f.occ.map((o) => units[o.idx].doc)).size >= 2);
}

export function makeContexts(units, alpha = 0.5) {
  const V = new Set(units.flatMap((u) => u.tokens)).size;
  const docCount = new Map();
  const docN = new Map();
  for (const u of units) {
    if (!docCount.has(u.doc)) {
      docCount.set(u.doc, new Map());
      docN.set(u.doc, 0);
    }
    const c = docCount.get(u.doc);
    for (const t of u.tokens) c.set(t, (c.get(t) || 0) + 1);
    docN.set(u.doc, docN.get(u.doc) + u.tokens.length);
  }
  const inVerse = (idx, w) => units[idx].tokens.reduce((t, r) => t + (r === w ? 1 : 0), 0);
  const docMinus = (doc, excluded) => {
    const ex = [...excluded].filter((idx) => units[idx].doc === doc);
    const N = docN.get(doc) - ex.reduce((t, idx) => t + units[idx].tokens.length, 0);
    return { N, count: (w) => (docCount.get(doc).get(w) || 0) - ex.reduce((t, idx) => t + inVerse(idx, w), 0) };
  };
  const verseSet = (idxs) => ({
    N: idxs.reduce((t, idx) => t + units[idx].tokens.length, 0),
    count: (w) => idxs.reduce((t, idx) => t + inVerse(idx, w), 0),
  });
  const windowIdx = (idx, k) => {
    const out = [];
    for (let d = -k; d <= k; d++) {
      const j = idx + d;
      if (d !== 0 && j >= 0 && j < units.length && units[j].doc === units[idx].doc) out.push(j);
    }
    return out;
  };
  const lp = (w, C) => Math.log((C.count(w) + alpha) / (C.N + alpha * V));
  const contexts = {
    doc: (o) => docMinus(units[o.idx].doc, new Set([o.idx])),
    strict: (o, f) =>
      docMinus(
        units[o.idx].doc,
        new Set([o.idx, ...windowIdx(o.idx, 10), ...f.occ.filter((q) => units[q.idx].doc === units[o.idx].doc).map((q) => q.idx)])
      ),
    local: (o) => verseSet(windowIdx(o.idx, 10)),
  };
  return { contexts, lp, V };
}

export function phraseTest(units, frames, contextName, { seed, draws = 100000, alpha = 0.5 } = {}) {
  const { contexts, lp } = makeContexts(units, alpha);
  const mats = frames.map((f) => {
    const ctx = f.occ.map((o) => contexts[contextName](o, f));
    const L = f.occ.map((_, o) => f.occ.map((q) => lp(q.m, ctx[o])));
    const n = f.occ.length;
    let observed = 0;
    let expected = 0;
    for (let o = 0; o < n; o++) {
      observed += L[o][o];
      expected += L[o].reduce((t, x) => t + x, 0) / n;
    }
    return { L, n, excess: observed - expected, expected, f };
  });
  const obs = mats.reduce((t, m) => t + m.excess, 0);
  const rand = rng(seed);
  let ge = 0;
  const perm = [];
  for (let d = 0; d < draws; d++) {
    let tot = 0;
    for (const m of mats) {
      for (let i = 0; i < m.n; i++) perm[i] = i;
      for (let i = m.n - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const t = perm[i];
        perm[i] = perm[j];
        perm[j] = t;
      }
      let s = 0;
      for (let o = 0; o < m.n; o++) s += m.L[o][perm[o]];
      tot += s - m.expected;
    }
    if (tot >= obs - 1e-9) ge++;
  }
  const informative = mats.filter((m) => Math.abs(m.excess) > 1e-12);
  return {
    frames: mats.length,
    informativeFrames: informative.length,
    totalExcess: obs,
    framesPositive: informative.filter((m) => m.excess > 0).length,
    framesNegative: informative.filter((m) => m.excess < 0).length,
    p: (ge + 1) / (draws + 1),
    excesses: informative.map((m) => m.excess),
    mats,
  };
}

// Percentile bootstrap of the mean of xs; optionally of mean(xs) - mean(ys).
export function bootstrapMean(xs, ys, { seed, resamples = 10000 } = {}) {
  const rand = rng(seed);
  const draw = (arr) => {
    let t = 0;
    for (let i = 0; i < arr.length; i++) t += arr[Math.floor(rand() * arr.length)];
    return t / arr.length;
  };
  const vals = [];
  for (let b = 0; b < resamples; b++) vals.push(ys ? draw(xs) - draw(ys) : draw(xs));
  vals.sort((a, b) => a - b);
  return [vals[Math.floor(0.025 * resamples)], vals[Math.floor(0.975 * resamples)]];
}
