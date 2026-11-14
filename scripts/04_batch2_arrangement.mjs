// Batch 2: the arrangement test, exactly as specified in PREREGISTRATION_batch2.md.
// Pass --selftest to run only the synthetic check of the method (no real similarities used).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { rng, mean } from '../src/stats.mjs';
import { makePairs, nodeFixedEffects, dsp } from '../src/mrqap.mjs';

const N = 114;
const SEED = 20261115;
const PERMS = 10000;
const P = makePairs(N);
const FE = nodeFixedEffects(P, N);
const col = (f) => Float64Array.from(P.pairs, ([i, j]) => f(i, j));
const r4 = (x) => +x.toFixed(4);

const chron = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras;
const meta = [];
for (const s of chron) meta[s.sura] = s;

const ADJ = col((i, j) => (j - i === 1 ? 1 : 0));

// ---------- synthetic self-test of the method ----------
if (process.argv.includes('--selftest')) {
  const rand = rng(7);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const node = Array.from({ length: N + 1 }, () => gauss());
  const make = (effect) => col((i, j) => node[i] + node[j] + effect * (j - i === 1 ? 1 : 0) + gauss());
  const t0 = Date.now();
  const withEffect = dsp({ y: make(0.5), x: ADJ, Z: FE, P, N, perms: 300, seed: 1 });
  const ms = Date.now() - t0;
  const noEffect = dsp({ y: make(0), x: ADJ, Z: FE, P, N, perms: 300, seed: 2 });
  console.log(JSON.stringify({
    plantedEffect0_5: { beta: r4(withEffect.beta), t: r4(withEffect.t), p: r4(withEffect.p) },
    noEffect: { beta: r4(noEffect.beta), t: r4(noEffect.t), p: r4(noEffect.p) },
    feRank: withEffect.rank,
    msPer300Perms: ms,
  }, null, 2));
  process.exit(0);
}

// ---------- real data ----------
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch2.md'))).digest('hex');
const corpus = loadCorpus();
const lem = [];
const W = [];
const MVLv = [];
for (let s = 1; s <= N; s++) {
  const vs = corpus.suras.get(s);
  lem[s] = lemmasOf(vs);
  W[s] = vs.reduce((t, v) => t + v.words.length, 0);
  MVLv[s] = W[s] / vs.length;
  assert.equal(vs.length, meta[s].ayas, `verse count mismatch in sura ${s}`);
}
const idf = idfTable(lem.slice(1));
const vec = lem.map((l) => (l ? vector(l, idf) : null));
const M = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
for (let i = 1; i <= N; i++) for (let j = i + 1; j <= N; j++) M[i][j] = M[j][i] = cosine(vec[i], vec[j]);

// Row percentiles with average ranks for ties.
const pct = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
for (let i = 1; i <= N; i++) {
  const others = [];
  for (let j = 1; j <= N; j++) if (j !== i) others.push(j);
  others.sort((a, b) => M[i][a] - M[i][b]);
  let k = 0;
  while (k < others.length) {
    let e = k;
    while (e + 1 < others.length && M[i][others[e + 1]] === M[i][others[k]]) e++;
    const avgRank = (k + e) / 2; // 0-based
    for (let t = k; t <= e; t++) pct[i][others[t]] = avgRank / (others.length - 1);
    k = e + 1;
  }
}
const S = col((i, j) => (pct[i][j] + pct[j][i]) / 2);
const RAW = col((i, j) => M[i][j]);

const CHRON_E = col((i, j) => Math.log(1 + Math.abs(meta[i].egyptian - meta[j].egyptian)));
const CHRON_N = col((i, j) => Math.log(1 + Math.abs(meta[i].noldeke - meta[j].noldeke)));
const TYPE = col((i, j) => (meta[i].type === meta[j].type ? 1 : 0));
const LEN = col((i, j) => Math.abs(Math.log(W[i]) - Math.log(W[j])));
const MVL = col((i, j) => Math.abs(Math.log(MVLv[i]) - Math.log(MVLv[j])));
const GRAD = col((i, j) => Math.log(j - i));
const CHRONADJ = col((i, j) => (Math.abs(meta[i].egyptian - meta[j].egyptian) === 1 ? 1 : 0));

const registry = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'claims', 'registry.json'), 'utf8'));
const farrinPairs = new Set(registry.claims.find((c) => c.id === 'farrin-pairs').pairs.map(([a, b]) => `${a}-${b}`));
const FPAIR = col((i, j) => (j - i === 1 && farrinPairs.has(`${i}-${j}`) ? 1 : 0));
const OTHERADJ = col((i, j) => (j - i === 1 && !farrinPairs.has(`${i}-${j}`) ? 1 : 0));

const base = [...FE, CHRON_E, TYPE, LEN, MVL];
let seedN = 0;
const run = (label, y, x, Z) => {
  const t0 = Date.now();
  const r = dsp({ y, x, Z, P, N, perms: PERMS, seed: SEED + seedN++ });
  console.error(`${label}: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return { test: label, beta: r4(r.beta), t: r4(r.t), p: +r.p.toPrecision(3) };
};

const primary = run('PRIMARY: ADJ | chron(Egyptian), type, len, mvl, sura effects', S, ADJ, base);
const S1 = run('S1: ADJ, adding mushaf-distance gradient', S, ADJ, [...base, GRAD]);
const S2 = run('S2: ADJ with Noldeke chronology', S, ADJ, [...FE, CHRON_N, TYPE, LEN, MVL]);
const S3 = run('S3: ADJ, raw cosine response', RAW, ADJ, base);
const bins = [
  ['distance 1', (d) => d === 1],
  ['distance 2', (d) => d === 2],
  ['distance 3', (d) => d === 3],
  ['distance 4-5', (d) => d === 4 || d === 5],
  ['distance 6-10', (d) => d >= 6 && d <= 10],
].map(([name, f]) => [name, col((i, j) => (f(j - i) ? 1 : 0))]);
const S4 = bins.map(([name, x], k) => run(`S4: ${name}`, S, x, [...base, ...bins.filter((_, m) => m !== k).map((b) => b[1])]));
const S5 = [
  run("S5: Farrin's 53 pairs", S, FPAIR, [...base, OTHERADJ]),
  run('S5: the 60 other adjacent pairs', S, OTHERADJ, [...base, FPAIR]),
];
const S6 = run('S6: revelation-order neighbours (Egyptian) | mushaf gradient, type, len, mvl, sura effects', S, CHRONADJ, [...FE, GRAD, TYPE, LEN, MVL]);

// ---------- descriptives ----------
const adjIdx = [];
const chronAdjIdx = [];
P.pairs.forEach(([i, j], k) => {
  if (ADJ[k]) adjIdx.push(k);
  if (CHRONADJ[k]) chronAdjIdx.push(k);
});
const adjChron = adjIdx.map((k) => Math.abs(meta[P.pairs[k][0]].egyptian - meta[P.pairs[k][1]].egyptian));
const med = adjChron.slice().sort((a, b) => a - b)[Math.floor(adjChron.length / 2)];
const descriptive = {
  chanceLevel: 0.5,
  meanS_mushafNeighbours: r4(mean(adjIdx.map((k) => S[k]))),
  meanS_revelationOrderNeighbours: r4(mean(chronAdjIdx.map((k) => S[k]))),
  mushafNeighbours_medianRevelationRankGap: med,
  meanS_mushafNeighbours_revealedCloseTogether: r4(mean(adjIdx.filter((_, t) => adjChron[t] < med).map((k) => S[k]))),
  meanS_mushafNeighbours_revealedFarApart: r4(mean(adjIdx.filter((_, t) => adjChron[t] >= med).map((k) => S[k]))),
  meanS_allPairs: r4(mean([...S])),
};

const out = { preregistrationSha256: preregHash, seed: SEED, perms: PERMS, primary, secondary: { S1, S2, S3, S4, S5, S6 }, descriptive };
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch2.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
