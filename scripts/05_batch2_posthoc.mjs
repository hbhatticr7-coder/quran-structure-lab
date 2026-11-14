// POST HOC checks added after seeing the batch 2 results. Not pre-registered.
//  1. Which adjacent pairs carry the adjacency effect?
//  2. Does the primary result survive removing the five strongest pairs?
//  3. Are Farrin's pairs more similar than the other adjacent pairs (difference test)?
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { makePairs, nodeFixedEffects, basis, residualize, dsp } from '../src/mrqap.mjs';

const N = 114;
const P = makePairs(N);
const FE = nodeFixedEffects(P, N);
const col = (f) => Float64Array.from(P.pairs, ([i, j]) => f(i, j));
const r4 = (x) => +x.toFixed(4);
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;

const corpus = loadCorpus();
const lem = [];
const W = [];
const MVLv = [];
for (let s = 1; s <= N; s++) {
  const vs = corpus.suras.get(s);
  lem[s] = lemmasOf(vs);
  W[s] = vs.reduce((t, v) => t + v.words.length, 0);
  MVLv[s] = W[s] / vs.length;
}
const idf = idfTable(lem.slice(1));
const vec = lem.map((l) => (l ? vector(l, idf) : null));
const M = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
for (let i = 1; i <= N; i++) for (let j = i + 1; j <= N; j++) M[i][j] = M[j][i] = cosine(vec[i], vec[j]);
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
const S = col((i, j) => (pct[i][j] + pct[j][i]) / 2);
const ADJ = col((i, j) => (j - i === 1 ? 1 : 0));
const base = [
  ...FE,
  col((i, j) => Math.log(1 + Math.abs(meta[i].egyptian - meta[j].egyptian))),
  col((i, j) => (meta[i].type === meta[j].type ? 1 : 0)),
  col((i, j) => Math.abs(Math.log(W[i]) - Math.log(W[j]))),
  col((i, j) => Math.abs(Math.log(MVLv[i]) - Math.log(MVLv[j]))),
];
const registry = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'claims', 'registry.json'), 'utf8'));
const farrin = new Set(registry.claims.find((c) => c.id === 'farrin-pairs').pairs.map(([a, b]) => `${a}-${b}`));
const FPAIR = col((i, j) => (j - i === 1 && farrin.has(`${i}-${j}`) ? 1 : 0));

// 1. Residual similarity of each adjacent pair after the controls.
const yr = residualize(S, basis(base));
const adj = P.pairs
  .map(([i, j], k) => ({ pair: `${i}-${j}`, residual: r4(yr[k]), percentile: r4(S[k]), farrinPair: farrin.has(`${i}-${j}`), k }))
  .filter((x) => ADJ[x.k]);
adj.sort((a, b) => b.residual - a.residual);
const top10 = adj.slice(0, 10).map(({ k, ...rest }) => rest);
const bottom5 = adj.slice(-5).map(({ k, ...rest }) => rest);

// 2. Primary test with the five strongest adjacent pairs dummied out.
const dummies = adj.slice(0, 5).map((x) => col((i, j) => (`${i}-${j}` === x.pair ? 1 : 0)));
const ADJrest = col((i, j) => (j - i === 1 && !adj.slice(0, 5).some((x) => x.pair === `${i}-${j}`) ? 1 : 0));
const fmt = (r) => ({ beta: r4(r.beta), t: r4(r.t), p: +r.p.toPrecision(3) });
const withoutTop5 = fmt(dsp({ y: S, x: ADJrest, Z: [...base, ...dummies], P, N, perms: 2000, seed: 31 }));

// 3. Difference between Farrin's pairs and the other adjacent pairs.
const difference = fmt(dsp({ y: S, x: FPAIR, Z: [...base, ADJ], P, N, perms: 2000, seed: 32 }));

const out = {
  note: 'Post hoc. Added after seeing batch 2 results; no confirmatory weight.',
  top10AdjacentPairsByResidual: top10,
  farrinPairsInTop10: top10.filter((x) => x.farrinPair).length,
  bottom5AdjacentPairs: bottom5,
  adjacentPairsAboveZero: `${adj.filter((x) => x.residual > 0).length} of ${adj.length}`,
  primaryWithoutTop5Pairs: withoutTop5,
  farrinPairsMinusOtherAdjacent: difference,
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch2_posthoc.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
