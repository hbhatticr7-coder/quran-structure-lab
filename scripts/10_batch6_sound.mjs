// Batch 6: the sound layer, exactly as specified in PREREGISTRATION_batch6.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadRhymes } from '../src/rhyme.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { rng, mean } from '../src/stats.mjs';
import { makePairs, nodeFixedEffects, basis, residualize, dsp } from '../src/mrqap.mjs';

const N = 114;
const PERMS = 10000;
const SEED1 = 20261120;
const SEED2 = 20261121;
const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch6.md'))).digest('hex');

const corpus = loadCorpus();
const rhymes = loadRhymes();
assert.equal(rhymes.length, corpus.verses.length);
corpus.verses.forEach((v, i) => assert.ok(v.s === rhymes[i].s && v.v === rhymes[i].v, `verse order mismatch at ${i}`));
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;

// =====================================================================
// R1. Do mushaf neighbours share rhyme?
// =====================================================================
const P = makePairs(N);
const FE = nodeFixedEffects(P, N);
const col = (f) => Float64Array.from(P.pairs, ([i, j]) => f(i, j));

function percentileResponse(M) {
  const pct = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
  for (let i = 1; i <= N; i++) {
    const others = [];
    for (let j = 1; j <= N; j++) if (j !== i) others.push(j);
    others.sort((a, b) => M[i][a] - M[i][b]);
    let k = 0;
    while (k < others.length) {
      let e = k;
      while (e + 1 < others.length && M[i][others[e + 1]] === M[i][others[k]]) e++;
      for (let t = k; t <= e; t++) pct[i][others[t]] = (k + e) / 2 / (others.length - 1);
      k = e + 1;
    }
  }
  return col((i, j) => (pct[i][j] + pct[j][i]) / 2);
}
const matrix = (vecs) => {
  const M = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
  for (let i = 1; i <= N; i++) for (let j = i + 1; j <= N; j++) M[i][j] = M[j][i] = cosine(vecs[i], vecs[j]);
  return M;
};

// Rhyme profiles.
const profile = [];
for (let s = 1; s <= N; s++) {
  const rs = rhymes.filter((x) => x.s === s);
  const m = new Map();
  for (const x of rs) m.set(x.key, (m.get(x.key) || 0) + 1 / rs.length);
  profile[s] = m;
}
const Srhyme = percentileResponse(matrix(profile));

// Vocabulary similarity as in batch 2 (for the cross-check).
const lem = [];
const W = [];
const MVLv = [];
for (let s = 1; s <= N; s++) {
  const vs = corpus.suras.get(s);
  lem[s] = lemmasOf(vs);
  W[s] = vs.reduce((t, v) => t + v.words.length, 0);
  MVLv[s] = W[s] / vs.length;
}
const suraIdf = idfTable(lem.slice(1));
const Slex = percentileResponse(matrix(lem.map((l) => (l ? vector(l, suraIdf) : null))));

const ADJ = col((i, j) => (j - i === 1 ? 1 : 0));
const CHRON_E = col((i, j) => Math.log(1 + Math.abs(meta[i].egyptian - meta[j].egyptian)));
const CHRON_N = col((i, j) => Math.log(1 + Math.abs(meta[i].noldeke - meta[j].noldeke)));
const TYPE = col((i, j) => (meta[i].type === meta[j].type ? 1 : 0));
const LEN = col((i, j) => Math.abs(Math.log(W[i]) - Math.log(W[j])));
const MVL = col((i, j) => Math.abs(Math.log(MVLv[i]) - Math.log(MVLv[j])));
const registry = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'claims', 'registry.json'), 'utf8'));
const farrin = new Set(registry.claims.find((c) => c.id === 'farrin-pairs').pairs.map(([a, b]) => `${a}-${b}`));
const FPAIR = col((i, j) => (j - i === 1 && farrin.has(`${i}-${j}`) ? 1 : 0));
const OTHERADJ = col((i, j) => (j - i === 1 && !farrin.has(`${i}-${j}`) ? 1 : 0));
const base = [...FE, CHRON_E, TYPE, LEN, MVL];

let seedN = 0;
const run = (label, y, x, Z) => {
  const t0 = Date.now();
  const r = dsp({ y, x, Z, P, N, perms: PERMS, seed: SEED1 + seedN++ });
  console.error(`${label}: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return { test: label, beta: r4(r.beta), t: r4(r.t), p: +r.p.toPrecision(3) };
};

const R1primary = run('R1 PRIMARY: rhyme, mushaf neighbours', Srhyme, ADJ, base);
const R1secondary = {
  farrinPairs: run("rhyme, Farrin's 53 pairs", Srhyme, FPAIR, [...base, OTHERADJ]),
  otherAdjacent: run('rhyme, the 60 other adjacent pairs', Srhyme, OTHERADJ, [...base, FPAIR]),
  farrinMinusOther: run("rhyme, Farrin's pairs minus other adjacent", Srhyme, FPAIR, [...base, ADJ]),
  noldeke: run('rhyme, mushaf neighbours, Noldeke chronology', Srhyme, ADJ, [...FE, CHRON_N, TYPE, LEN, MVL]),
};
// Remove the five adjacent pairs with the largest residual rhyme similarity.
const yr = residualize(Srhyme, basis(base));
const adjRanked = P.pairs
  .map(([i, j], k) => ({ pair: `${i}-${j}`, k, residual: yr[k] }))
  .filter((x) => ADJ[x.k])
  .sort((a, b) => b.residual - a.residual);
const top5 = adjRanked.slice(0, 5).map((x) => x.pair);
const dummies = top5.map((p) => col((i, j) => (`${i}-${j}` === p ? 1 : 0)));
const ADJrest = col((i, j) => (j - i === 1 && !top5.includes(`${i}-${j}`) ? 1 : 0));
R1secondary.withoutTop5 = { removed: top5, ...run('rhyme, mushaf neighbours without top five pairs', Srhyme, ADJrest, [...base, ...dummies]) };
R1secondary.batch2CrossCheck = run('vocabulary, mushaf neighbours, rhyme similarity controlled', Slex, ADJ, [...base, Srhyme]);

const adjIdx = [];
P.pairs.forEach((_, k) => ADJ[k] && adjIdx.push(k));
const R1descriptive = {
  chanceLevel: 0.5,
  meanRhymePercentile_mushafNeighbours: r4(mean(adjIdx.map((k) => Srhyme[k]))),
  meanRhymePercentile_farrinPairs: r4(mean(adjIdx.filter((k) => FPAIR[k]).map((k) => Srhyme[k]))),
  meanRhymePercentile_otherAdjacent: r4(mean(adjIdx.filter((k) => !FPAIR[k]).map((k) => Srhyme[k]))),
  adjacentPairsAboveExpectation: `${adjRanked.filter((x) => x.residual > 0).length} of ${adjRanked.length}`,
};

// =====================================================================
// R2. Do rhyme shifts mark a change of subject?
// =====================================================================
const verseIdf = idfTable(corpus.verses.map((v) => v.lemmas));
function boundaries(w) {
  const perSura = [];
  for (let s = 1; s <= N; s++) {
    const vs = corpus.suras.get(s);
    const fam = vs.map((v) => rhymes[v.idx].family);
    const shifts = [];
    const conts = [];
    for (let i = 1; i + 2 < vs.length; i++) {
      const a = fam[i - 1];
      const b = fam[i];
      const c = fam[i + 1];
      const d = fam[i + 2];
      let kind = null;
      if (a === b && c === d && b !== c) kind = 'shift';
      else if (a === b && b === c && c === d) kind = 'cont';
      if (!kind) continue;
      const before = vs.slice(Math.max(0, i - w + 1), i + 1);
      const after = vs.slice(i + 1, Math.min(vs.length, i + 1 + w));
      const disc = 1 - cosine(vector(lemmasOf(before), verseIdf), vector(lemmasOf(after), verseIdf));
      (kind === 'shift' ? shifts : conts).push(disc);
    }
    if (shifts.length && conts.length) perSura.push({ s, shifts, conts });
  }
  return perSura;
}
function r2test(perSura, seed) {
  const stat = (list) => mean(list.map((x) => mean(x.shifts) - mean(x.conts)));
  const observed = stat(perSura);
  const rand = rng(seed);
  const DRAWS = 100000;
  const pools = perSura.map((x) => ({ all: Float64Array.from([...x.shifts, ...x.conts]), a: x.shifts.length, total: [...x.shifts, ...x.conts].reduce((t, v) => t + v, 0) }));
  let ge = 0;
  for (let d = 0; d < DRAWS; d++) {
    let tot = 0;
    for (const p of pools) {
      const n = p.all.length;
      let sel = 0;
      for (let i = 0; i < p.a; i++) {
        const j = i + Math.floor(rand() * (n - i));
        const t = p.all[i];
        p.all[i] = p.all[j];
        p.all[j] = t;
        sel += p.all[i];
      }
      tot += sel / p.a - (p.total - sel) / (n - p.a);
    }
    if (tot / pools.length >= observed - 1e-12) ge++;
  }
  const allShifts = perSura.flatMap((x) => x.shifts);
  const allConts = perSura.flatMap((x) => x.conts);
  return {
    suras: perSura.length,
    shiftBoundaries: allShifts.length,
    continuationBoundaries: allConts.length,
    meanDiscontinuityAtShifts: r4(mean(allShifts)),
    meanDiscontinuityAtContinuations: r4(mean(allConts)),
    meanWithinSuraDifference: r4(observed),
    surasWhereShiftsAreHigher: `${perSura.filter((x) => mean(x.shifts) > mean(x.conts)).length} of ${perSura.length}`,
    p: +((ge + 1) / (DRAWS + 1)).toPrecision(3),
  };
}
const b3 = boundaries(3);
const R2primary = r2test(b3, SEED2);
const medMvl = b3.map((x) => MVLv[x.s]).sort((a, b) => a - b)[Math.floor(b3.length / 2)];
const R2secondary = {
  window2: r2test(boundaries(2), SEED2 + 1),
  window5: r2test(boundaries(5), SEED2 + 2),
  shortVerseSuras: r2test(b3.filter((x) => MVLv[x.s] < medMvl), SEED2 + 3),
  longVerseSuras: r2test(b3.filter((x) => MVLv[x.s] >= medMvl), SEED2 + 4),
};

const out = {
  preregistrationSha256: preregHash,
  R1_rhymeAdjacency: { primary: R1primary, secondary: R1secondary, descriptive: R1descriptive },
  R2_rhymeShifts: { primary: R2primary, secondary: R2secondary, surasUsed: b3.map((x) => x.s) },
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch6.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
