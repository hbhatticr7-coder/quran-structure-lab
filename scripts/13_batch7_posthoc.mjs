// POST HOC checks added after seeing batch 7. Not pre-registered.
//  1. L2 with subsets of suras: which suras carry the letter-frequency result?
//  2. L1: do lettered suras resemble each other as a class (the BOTH term)?
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadLetterData } from '../src/letters.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { rng, shuffle, mean } from '../src/stats.mjs';
import { makePairs, nodeFixedEffects, dsp } from '../src/mrqap.mjs';

const N = 114;
const r4 = (x) => +x.toFixed(4);
const { openers, counts, totals } = loadLetterData();
const lettered = [...openers.keys()].sort((a, b) => a - b);

// ---------- 1. L2 on subsets (standardised across all 29 lettered suras, as in the primary) ----------
const rate = (s, ch) => (counts.skeleton[s].get(ch) || 0) / totals.skeleton[s];
const allLetters = [...new Set(lettered.flatMap((s) => openers.get(s).letters))];
const stat = new Map(allLetters.map((ch) => {
  const xs = lettered.map((s) => rate(s, ch));
  const m = mean(xs);
  return [ch, { m, sd: Math.sqrt(mean(xs.map((x) => (x - m) ** 2))) || 1 }];
}));
const z = (s, ch) => (rate(s, ch) - stat.get(ch).m) / stat.get(ch).sd;
function l2subset(suras, seed) {
  const Q = suras.map((a) => suras.map((b) => mean(openers.get(b).letters.map((ch) => z(a, ch)))));
  const observed = suras.reduce((t, _, k) => t + Q[k][k], 0);
  const rand = rng(seed);
  const perm = suras.map((_, k) => k);
  let ge = 0;
  const DRAWS = 100000;
  for (let d = 0; d < DRAWS; d++) {
    shuffle(perm, rand);
    let t = 0;
    for (let k = 0; k < perm.length; k++) t += Q[k][perm[k]];
    if (t >= observed - 1e-12) ge++;
  }
  return { suras: suras.length, observed: r4(observed), positiveOwnScore: suras.filter((_, k) => Q[k][k] > 0).length, p: +((ge + 1) / (DRAWS + 1)).toPrecision(3) };
}
const bigFamilies = lettered.filter((s) => ['الم', 'الر', 'حم'].includes(openers.get(s).family));
const L2 = {
  all29: l2subset(lettered, 1),
  withoutSura50: l2subset(lettered.filter((s) => s !== 50), 2),
  withoutSingleLetterSuras_38_50_68: l2subset(lettered.filter((s) => ![38, 50, 68].includes(s)), 3),
  onlyALM_ALR_HM: l2subset(bigFamilies, 4),
  onlyTheOtherEleven: l2subset(lettered.filter((s) => !bigFamilies.includes(s)), 5),
};

// ---------- 2. L1: lettered suras as a class ----------
const corpus = loadCorpus();
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;
const P = makePairs(N);
const FE = nodeFixedEffects(P, N);
const col = (f) => Float64Array.from(P.pairs, ([i, j]) => f(i, j));
const W = [];
const MVLv = [];
const lem = [];
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
const Slex = col((i, j) => (pct[i][j] + pct[j][i]) / 2);
const fam = (s) => (openers.has(s) ? openers.get(s).family : null);
const BOTH = col((i, j) => (fam(i) && fam(j) ? 1 : 0));
const Z = [
  ...FE,
  col((i, j) => (j - i === 1 ? 1 : 0)),
  col((i, j) => Math.log(j - i)),
  col((i, j) => Math.log(1 + Math.abs(meta[i].egyptian - meta[j].egyptian))),
  col((i, j) => (meta[i].type === meta[j].type ? 1 : 0)),
  col((i, j) => Math.abs(Math.log(W[i]) - Math.log(W[j]))),
  col((i, j) => Math.abs(Math.log(MVLv[i]) - Math.log(MVLv[j]))),
];
const r = dsp({ y: Slex, x: BOTH, Z, P, N, perms: 10000, seed: 77 });
const L1 = { test: 'vocabulary, both suras lettered (any letters)', beta: r4(r.beta), t: r4(r.t), p: +r.p.toPrecision(3) };

const out = { note: 'Post hoc. Added after seeing batch 7 results; no confirmatory weight.', L2_subsets: L2, L1_letteredAsAClass: L1 };
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch7_posthoc.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
