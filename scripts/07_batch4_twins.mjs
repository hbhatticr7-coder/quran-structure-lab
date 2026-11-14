// Batch 4: near-twin verses, exactly as specified in PREREGISTRATION_batch4.md.
// Pass --count to print only how many pairs and sites the rules yield (no fit computed).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { findNearTwins, selectPairs, lcsAlign, substitutionSites } from '../src/twins.mjs';
import { rng, mean } from '../src/stats.mjs';

const SEED = 20261116;
const DRAWS = 100000;
const ALPHA = 0.5;
const corpus = loadCorpus();
const { verses, suras } = corpus;
const r4 = (x) => +x.toFixed(4);
const ref = (idx) => `${verses[idx].s}:${verses[idx].v}`;

// Self-checks of the alignment code on toy input.
{
  const m = lcsAlign(['a', 'b', 'x', 'c', 'd', 'e'], ['a', 'b', 'y', 'c', 'd', 'e']);
  assert.equal(m.length, 5);
  const s = substitutionSites(['a', 'b', 'x', 'c', 'd', 'e'], ['a', 'b', 'y', 'c', 'd', 'e'], m);
  assert.deepEqual(s.map((t) => [t.a, t.b]), [['x', 'y']]);
}

const twins = findNearTwins(verses, { minLcs: 5, minRatio: 0.5 });
const picked = { 0.5: selectPairs(twins, 0.5), 0.6: selectPairs(twins, 0.6), 0.7: selectPairs(twins, 0.7) };
const yieldSummary = {
  nearTwinPairs_ratio0_6_anySura: twins.filter((t) => t.ratio >= 0.6).length,
  nearTwinPairs_ratio0_6_differentSuras: twins.filter((t) => t.ratio >= 0.6 && !t.sameSura).length,
  ofWhichWithSubstitutionSite: twins.filter((t) => t.ratio >= 0.6 && !t.sameSura && t.sites.length > 0).length,
  selectedPairs: Object.fromEntries(Object.entries(picked).map(([k, v]) => [k, v.length])),
  selectedSites: Object.fromEntries(Object.entries(picked).map(([k, v]) => [k, v.reduce((t, p) => t + p.sites.length, 0)])),
};
// Amendment A1: phrase-level frames (two roots before, two after, differing middle).
const frameMap = new Map();
for (const v of verses)
  for (let i = 2; i + 2 < v.roots.length; i++) {
    const key = `${v.roots[i - 2]} ${v.roots[i - 1]} _ ${v.roots[i + 1]} ${v.roots[i + 2]}`;
    if (!frameMap.has(key)) frameMap.set(key, []);
    frameMap.get(key).push({ idx: v.idx, m: v.roots[i] });
  }
const frames = [...frameMap]
  .map(([key, occ]) => ({ key, occ }))
  .filter((f) => new Set(f.occ.map((o) => o.m)).size >= 2 && new Set(f.occ.map((o) => verses[o.idx].s)).size >= 2);
yieldSummary.phraseLevel = {
  usableFrames: frames.length,
  occurrences: frames.reduce((t, f) => t + f.occ.length, 0),
  framesWithTwoOccurrences: frames.filter((f) => f.occ.length === 2).length,
  largestFrame: Math.max(...frames.map((f) => f.occ.length)),
};
if (process.argv.includes('--count')) {
  console.log(JSON.stringify(yieldSummary, null, 2));
  process.exit(0);
}

const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch4.md'))).digest('hex');
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;
const byEgyptian = [];
for (let s = 1; s <= 114; s++) byEgyptian[meta[s].egyptian] = s;

// ---------- counts ----------
const V = new Set(verses.flatMap((v) => v.roots)).size;
const suraCount = [];
const suraN = [];
for (let s = 1; s <= 114; s++) {
  const c = new Map();
  let n = 0;
  for (const v of suras.get(s)) for (const r of v.roots) {
    c.set(r, (c.get(r) || 0) + 1);
    n++;
  }
  suraCount[s] = c;
  suraN[s] = n;
}
const inVerse = (idx, w) => verses[idx].roots.reduce((t, r) => t + (r === w ? 1 : 0), 0);

// A context is { count(w), N }.
function suraMinus(s, excluded) {
  const ex = [...excluded].filter((idx) => verses[idx].s === s);
  const N = suraN[s] - ex.reduce((t, idx) => t + verses[idx].roots.length, 0);
  return { N, count: (w) => (suraCount[s].get(w) || 0) - ex.reduce((t, idx) => t + inVerse(idx, w), 0) };
}
function verseSet(idxs) {
  const N = idxs.reduce((t, idx) => t + verses[idx].roots.length, 0);
  return { N, count: (w) => idxs.reduce((t, idx) => t + inVerse(idx, w), 0) };
}
function multiSura(list) {
  return { N: list.reduce((t, s) => t + suraN[s], 0), count: (w) => list.reduce((t, s) => t + (suraCount[s].get(w) || 0), 0) };
}
const windowIdx = (idx, k) => {
  const out = [];
  for (let d = -k; d <= k; d++) {
    const j = idx + d;
    if (d !== 0 && j >= 0 && j < verses.length && verses[j].s === verses[idx].s) out.push(j);
  }
  return out;
};
// Twin family lookup at ratio 0.6 (any sura).
const twinOf = new Map();
for (const t of twins) {
  if (t.ratio < 0.6) continue;
  for (const [x, y] of [[t.a, t.b], [t.b, t.a]]) {
    if (!twinOf.has(x)) twinOf.set(x, new Set());
    twinOf.get(x).add(y);
  }
}
function periodSuras(s, exclude) {
  const out = [];
  for (const dir of [-1, 1]) {
    let got = 0;
    for (let e = meta[s].egyptian + dir; e >= 1 && e <= 114 && got < 3; e += dir) {
      const cand = byEgyptian[e];
      if (exclude.has(cand)) continue;
      out.push(cand);
      got++;
    }
  }
  return out;
}

const contexts = {
  sura: (A, B) => [suraMinus(verses[A].s, new Set([A])), suraMinus(verses[B].s, new Set([B]))],
  strict: (A, B) => {
    const fam = new Set([A, B, ...(twinOf.get(A) || []), ...(twinOf.get(B) || [])]);
    const exA = new Set([...fam, ...windowIdx(A, 10)]);
    const exB = new Set([...fam, ...windowIdx(B, 10)]);
    return [suraMinus(verses[A].s, exA), suraMinus(verses[B].s, exB)];
  },
  local: (A, B) => [verseSet(windowIdx(A, 10)), verseSet(windowIdx(B, 10))],
  period: (A, B) => {
    const ex = new Set([verses[A].s, verses[B].s]);
    return [multiSura(periodSuras(verses[A].s, ex)), multiSura(periodSuras(verses[B].s, ex))];
  },
};

const lp = (w, C) => Math.log((C.count(w) + ALPHA) / (C.N + ALPHA * V));
const siteD = (a, b, X, Y) => lp(a, X) - lp(b, X) + lp(b, Y) - lp(a, Y);

// ---------- association measure (PPMI over verse-level co-occurrence) ----------
const versesWith = new Map();
for (const v of verses) for (const r of new Set(v.roots)) {
  if (!versesWith.has(r)) versesWith.set(r, []);
  versesWith.get(r).push(v.idx);
}
const ppmiCache = new Map();
function ppmiRow(w) {
  if (ppmiCache.has(w)) return ppmiCache.get(w);
  const co = new Map();
  for (const idx of versesWith.get(w) || []) for (const r of new Set(verses[idx].roots)) if (r !== w) co.set(r, (co.get(r) || 0) + 1);
  const row = new Map();
  const nv = verses.length;
  const dfw = (versesWith.get(w) || []).length;
  for (const [c, n] of co) {
    if (n < 2) continue;
    const pmi = Math.log((n * nv) / (dfw * versesWith.get(c).length));
    if (pmi > 0) row.set(c, pmi);
  }
  ppmiCache.set(w, row);
  return row;
}
function assocFit(w, s, exIdx) {
  const row = ppmiRow(w);
  let total = 0;
  for (const [c, n] of suraCount[s]) {
    if (c === w) continue;
    const p = row.get(c);
    if (p) total += p * (n - inVerse(exIdx, c));
  }
  return total / (suraN[s] - verses[exIdx].roots.length);
}
const assocD = (a, b, A, B) => {
  const X = verses[A].s;
  const Y = verses[B].s;
  return assocFit(a, X, A) - assocFit(b, X, A) + assocFit(b, Y, B) - assocFit(a, Y, B);
};

// ---------- tests ----------
function binomTail(k, n) {
  // P(X >= k) for X ~ Binomial(n, 1/2)
  let logC = 0;
  let p = 0;
  for (let i = 0; i <= n; i++) {
    if (i > 0) logC += Math.log(n - i + 1) - Math.log(i);
    if (i >= k) p += Math.exp(logC - n * Math.LN2);
  }
  return p;
}
function signFlip(scores, seed) {
  const nz = scores.filter((x) => Math.abs(x) > 1e-12);
  const obs = mean(nz);
  const rand = rng(seed);
  let ge = 0;
  for (let d = 0; d < DRAWS; d++) {
    let t = 0;
    for (const x of nz) t += rand() < 0.5 ? x : -x;
    if (t / nz.length >= obs - 1e-12) ge++;
  }
  const pos = nz.filter((x) => x > 0).length;
  return {
    pairs: scores.length,
    informativePairs: nz.length,
    meanScore: r4(obs),
    positive: pos,
    negative: nz.length - pos,
    pSignFlip: +((ge + 1) / (DRAWS + 1)).toPrecision(3),
    pSignTest: +binomTail(pos, nz.length).toPrecision(3),
  };
}
function runContext(pairs, name, seed) {
  const scores = pairs.map((p) => {
    const [X, Y] = contexts[name](p.a, p.b);
    return p.sites.reduce((t, s) => t + siteD(s.a, s.b, X, Y), 0);
  });
  return signFlip(scores, seed);
}

const P6 = picked[0.6];
const primary = runContext(P6, 'sura', SEED);
const secondary = {
  strictContext: runContext(P6, 'strict', SEED + 1),
  localContext: runContext(P6, 'local', SEED + 2),
  periodContext: runContext(P6, 'period', SEED + 3),
  associationMeasure: signFlip(P6.map((p) => p.sites.reduce((t, s) => t + assocD(s.a, s.b, p.a, p.b), 0)), SEED + 4),
  ratio0_5: runContext(picked[0.5], 'sura', SEED + 5),
  ratio0_7: runContext(picked[0.7], 'sura', SEED + 6),
};

// Sites listed for inspection (primary context).
const siteRows = [];
for (const p of P6) {
  const [X, Y] = contexts.sura(p.a, p.b);
  for (const s of p.sites)
    siteRows.push({
      verses: `${ref(p.a)} / ${ref(p.b)}`,
      rootInFirst: s.a,
      rootInSecond: s.b,
      countsFirstRoot_ownSura_otherSura: [X.count(s.a), Y.count(s.a)],
      countsSecondRoot_ownSura_otherSura: [Y.count(s.b), X.count(s.b)],
      D: r4(siteD(s.a, s.b, X, Y)),
    });
}
siteRows.sort((x, y) => y.D - x.D);

// ---------- Amendment A1: phrase-level test ----------
const frameContexts = {
  sura: (o) => suraMinus(verses[o.idx].s, new Set([o.idx])),
  strict: (o, f) =>
    suraMinus(
      verses[o.idx].s,
      new Set([o.idx, ...windowIdx(o.idx, 10), ...f.occ.filter((q) => verses[q.idx].s === verses[o.idx].s).map((q) => q.idx)])
    ),
  local: (o) => verseSet(windowIdx(o.idx, 10)),
  period: (o) => multiSura(periodSuras(verses[o.idx].s, new Set([verses[o.idx].s]))),
};
function phraseTest(name, seed) {
  // L[o][k] = ln p(middle of occurrence k | context of occurrence o)
  const mats = frames.map((f) => {
    const ctx = f.occ.map((o) => frameContexts[name](o, f));
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
  for (let d = 0; d < DRAWS; d++) {
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
    result: {
      frames: mats.length,
      informativeFrames: informative.length,
      totalExcess: r4(obs),
      meanExcessPerInformativeFrame: r4(obs / Math.max(1, informative.length)),
      framesPositive: informative.filter((m) => m.excess > 0).length,
      framesNegative: informative.filter((m) => m.excess < 0).length,
      p: +((ge + 1) / (DRAWS + 1)).toPrecision(3),
    },
    mats,
  };
}
const PSEED = 20261117;
const phraseSura = phraseTest('sura', PSEED);
const phrase = {
  wholeSura: phraseSura.result,
  strictContext: phraseTest('strict', PSEED + 1).result,
  localContext: phraseTest('local', PSEED + 2).result,
  periodContext: phraseTest('period', PSEED + 3).result,
};
const frameRows = phraseSura.mats
  .map((m) => ({
    frame: m.f.key,
    excess: r4(m.excess),
    occurrences: m.f.occ.map((o) => `${ref(o.idx)} ${o.m}`),
  }))
  .sort((x, y) => y.excess - x.excess);
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch4_all_frames.json'), JSON.stringify(frameRows, null, 1));

const out = {
  preregistrationSha256: preregHash,
  seed: SEED,
  draws: DRAWS,
  yield: yieldSummary,
  primary_wholeSura: primary,
  secondary,
  amendmentA1_phraseLevel: phrase,
  phraseTop15Frames: frameRows.slice(0, 15),
  phraseBottom15Frames: frameRows.slice(-15),
  top20Sites: siteRows.slice(0, 20),
  bottom20Sites: siteRows.slice(-20),
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch4.json'), JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch4_all_sites.json'), JSON.stringify(siteRows, null, 1));
const { top20Sites, bottom20Sites, phraseTop15Frames, phraseBottom15Frames, ...brief } = out;
console.log(JSON.stringify(brief, null, 2));
