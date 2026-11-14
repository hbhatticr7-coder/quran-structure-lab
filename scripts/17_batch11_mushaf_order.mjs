// Batch 11: why the mushaf departs from longest-first order.
// Exactly as specified in PREREGISTRATION_batch11.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadLetterData } from '../src/letters.mjs';
import { loadRhymes } from '../src/rhyme.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { rng, mean, sd } from '../src/stats.mjs';
import { makePairs, nodeFixedEffects, basis, residualize } from '../src/mrqap.mjs';

const N = 114;
const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch11.md'))).digest('hex');
const corpus = loadCorpus();
const { openers } = loadLetterData();
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;

// ---------- similarity matrices ----------
function percentileMatrix(vecs) {
  const M = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
  for (let i = 1; i <= N; i++) for (let j = i + 1; j <= N; j++) M[i][j] = M[j][i] = cosine(vecs[i], vecs[j]);
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
  const S = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
  for (let i = 1; i <= N; i++) for (let j = 1; j <= N; j++) if (i !== j) S[i][j] = (pct[i][j] + pct[j][i]) / 2;
  return S;
}
const words = [];
const mvl = [];
const lem = [];
for (let s = 1; s <= N; s++) {
  const vs = corpus.suras.get(s);
  lem[s] = lemmasOf(vs);
  words[s] = vs.reduce((t, v) => t + v.words.length, 0);
  mvl[s] = words[s] / vs.length;
}
const idf = idfTable(lem.slice(1));
const Slex = percentileMatrix(lem.map((l) => (l ? vector(l, idf) : null)));
const rhymes = loadRhymes();
const profile = [];
for (let s = 1; s <= N; s++) {
  const rs = rhymes.filter((x) => x.s === s);
  const m = new Map();
  for (const x of rs) m.set(x.key, (m.get(x.key) || 0) + 1 / rs.length);
  profile[s] = m;
}
const Srhyme = percentileMatrix(profile);
// Vocabulary similarity with the batch 2 controls removed.
const P = makePairs(N);
const col = (f) => Float64Array.from(P.pairs, ([i, j]) => f(i, j));
const controls = [
  ...nodeFixedEffects(P, N),
  col((i, j) => Math.log(1 + Math.abs(meta[i].egyptian - meta[j].egyptian))),
  col((i, j) => (meta[i].type === meta[j].type ? 1 : 0)),
  col((i, j) => Math.abs(Math.log(words[i]) - Math.log(words[j]))),
  col((i, j) => Math.abs(Math.log(mvl[i]) - Math.log(mvl[j]))),
];
const resid = residualize(col((i, j) => Slex[i][j]), basis(controls));
const Rlex = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
P.pairs.forEach(([i, j], k) => {
  Rlex[i][j] = Rlex[j][i] = resid[k];
});

// ---------- orders ----------
const fam = (s) => (openers.has(s) ? openers.get(s).family : null);
const disorder = (order) => {
  let d = 0;
  for (let a = 0; a < order.length; a++) for (let b = a + 1; b < order.length; b++) if (words[order[a]] < words[order[b]]) d++;
  return d;
};
const meanAdj = (order, M) => {
  let t = 0;
  for (let k = 0; k + 1 < order.length; k++) t += M[order[k]][order[k + 1]];
  return t / (order.length - 1);
};
const sameLetterAdj = (order) => {
  let n = 0;
  for (let k = 0; k + 1 < order.length; k++) if (fam(order[k]) && fam(order[k]) === fam(order[k + 1])) n++;
  return n;
};
const chronGap = (order) => {
  let t = 0;
  for (let k = 0; k + 1 < order.length; k++) t += Math.abs(meta[order[k]].egyptian - meta[order[k + 1]].egyptian);
  return t / (order.length - 1);
};

function nullOrders(items, kind, seed) {
  const rand = rng(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const target = disorder(items);
  const byLen = items.slice().sort((a, b) => words[b] - words[a]);
  const rank = new Map(byLen.map((s, i) => [s, i]));
  const key = kind === 'rank' ? (s) => rank.get(s) : (s) => -Math.log(words[s]);
  const draw = (sigma) => items.map((s) => [s, key(s) + sigma * gauss()]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
  // Calibrate the noise so that mean disorder matches the mushaf's.
  let lo = 0;
  let hi = kind === 'rank' ? 60 : 4;
  for (let it = 0; it < 30; it++) {
    const mid = (lo + hi) / 2;
    let m = 0;
    for (let k = 0; k < 300; k++) m += disorder(draw(mid));
    if (m / 300 < target) lo = mid;
    else hi = mid;
  }
  const sigma = (lo + hi) / 2;
  const kept = [];
  let generated = 0;
  while (generated < 20000) {
    const o = draw(sigma);
    generated++;
    const d = disorder(o);
    if (Math.abs(d - target) <= 0.1 * target) kept.push(o);
  }
  return { sigma, kept, generated, target };
}

function analyse(items, kind, seed) {
  const { sigma, kept, generated, target } = nullOrders(items, kind, seed);
  const sorted = items.slice().sort((a, b) => words[b] - words[a]);
  const test = (f, lower = false) => {
    const obs = f(items);
    const vals = kept.map(f);
    const ext = vals.filter((v) => (lower ? v <= obs + 1e-12 : v >= obs - 1e-12)).length;
    return { mushaf: r4(obs), strictLongestFirst: r4(f(sorted)), nullMean: r4(mean(vals)), nullSd: r4(sd(vals)), p: +((ext + 1) / (vals.length + 1)).toPrecision(3) };
  };
  return {
    suras: items.length,
    disorderPairs: target,
    shareOfAllPairs: r4(target / ((items.length * (items.length - 1)) / 2)),
    adjacentPairsWhereShorterComesFirst: items.filter((s, k) => k + 1 < items.length && words[s] < words[items[k + 1]]).length,
    noise: { kind, sigma: r4(sigma), generated, keptWithin10Percent: kept.length },
    vocabulary: test((o) => meanAdj(o, Slex)),
    rhyme: test((o) => meanAdj(o, Srhyme)),
    vocabularyBeyondPeriodAndLength: test((o) => meanAdj(o, Rlex)),
    adjacentSameLetterPairs: test(sameLetterAdj),
    meanRevelationRankGap_lowerIsCloser: test(chronGap, true),
    _kept: kept,
  };
}

const mushaf = Array.from({ length: N - 1 }, (_, k) => k + 2);
const main = analyse(mushaf, 'ln', 20261170);
const rankCheck = analyse(mushaf, 'rank', 20261171);
const unletteredOnly = analyse(mushaf.filter((s) => !fam(s)), 'ln', 20261172);
const letteredOnly = analyse(mushaf.filter((s) => fam(s)), 'ln', 20261173);

// ---------- how close is the mushaf to the best order with the same disorder? ----------
function anneal(start, M, budget, seed) {
  const rand = rng(seed);
  const order = start.slice();
  let d = disorder(order);
  let score = 0;
  for (let k = 0; k + 1 < order.length; k++) score += M[order[k]][order[k + 1]];
  let best = score;
  const ITER = 4000000;
  for (let it = 0; it < ITER; it++) {
    const T = 0.05 * Math.pow(0.0005 / 0.05, it / ITER);
    const k = Math.floor(rand() * (order.length - 1));
    const a = order[k];
    const b = order[k + 1];
    const dd = words[a] > words[b] ? 1 : words[a] < words[b] ? -1 : 0;
    if (d + dd > budget) continue;
    let delta = 0;
    if (k > 0) delta += M[order[k - 1]][b] - M[order[k - 1]][a];
    if (k + 2 < order.length) delta += M[a][order[k + 2]] - M[b][order[k + 2]];
    if (delta >= 0 || rand() < Math.exp(delta / T)) {
      order[k] = b;
      order[k + 1] = a;
      d += dd;
      score += delta;
      if (score > best) best = score;
    }
  }
  return best / (order.length - 1);
}
const budget = disorder(mushaf);
const bestFound = Math.max(anneal(mushaf, Slex, budget, 501), anneal(mushaf.slice().sort((a, b) => words[b] - words[a]), Slex, budget, 502));
const strip = ({ _kept, ...rest }) => rest;
const out = {
  preregistrationSha256: preregHash,
  main: strip(main),
  check_rankNoise: strip(rankCheck),
  unletteredSurasOnly: strip(unletteredOnly),
  letteredSurasOnly: strip(letteredOnly),
  optimisation: {
    note: 'Best adjacent vocabulary similarity found by search without exceeding the mushaf\'s disorder. A lower bound on the true optimum.',
    nullMean: main.vocabulary.nullMean,
    mushaf: main.vocabulary.mushaf,
    bestFound: r4(bestFound),
    mushafShareOfTheWayFromNullToBest: r4((main.vocabulary.mushaf - main.vocabulary.nullMean) / (bestFound - main.vocabulary.nullMean)),
  },
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch11.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
