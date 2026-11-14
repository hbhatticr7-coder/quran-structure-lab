// Batch 7: the disconnected letters, exactly as specified in PREREGISTRATION_batch7.md.
// Pass --check to print the extracted letters and total letter counts only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadLetterData } from '../src/letters.mjs';
import { loadRhymes } from '../src/rhyme.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { rng, shuffle, mean } from '../src/stats.mjs';
import { makePairs, nodeFixedEffects, dsp } from '../src/mrqap.mjs';

const N = 114;
const r4 = (x) => +x.toFixed(4);
const { openers, counts, totals } = loadLetterData();
assert.equal(openers.size, 29);
const lettered = [...openers.keys()].sort((a, b) => a - b);

if (process.argv.includes('--check')) {
  console.log(JSON.stringify({
    families: Object.fromEntries(lettered.map((s) => [s, openers.get(s).family + ' -> ' + openers.get(s).letters.join(' ')])),
    totalLettersSkeleton: totals.skeleton.slice(1).reduce((t, x) => t + x, 0),
    totalLettersStrict: totals.strict.slice(1).reduce((t, x) => t + x, 0),
    sura50letters: totals.skeleton[50],
  }, null, 1));
  process.exit(0);
}

const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch7.md'))).digest('hex');

// =====================================================================
// L2. Are a sura's letters unusually frequent in it?
// =====================================================================
function l2(rule, reference, seed) {
  const rate = (s, ch) => (counts[rule][s].get(ch) || 0) / totals[rule][s];
  const refSuras = reference === 'all' ? Array.from({ length: N }, (_, k) => k + 1) : lettered;
  const allLetters = [...new Set(lettered.flatMap((s) => openers.get(s).letters))];
  const stats = new Map();
  for (const ch of allLetters) {
    const xs = refSuras.map((s) => rate(s, ch));
    const m = mean(xs);
    const sd = Math.sqrt(mean(xs.map((x) => (x - m) ** 2))) || 1;
    stats.set(ch, { m, sd });
  }
  const z = (s, ch) => (rate(s, ch) - stats.get(ch).m) / stats.get(ch).sd;
  // Q[a][b] = score of sura a under the letter-set of sura b.
  const Q = lettered.map((a) => lettered.map((b) => mean(openers.get(b).letters.map((ch) => z(a, ch)))));
  const observed = lettered.reduce((t, _, k) => t + Q[k][k], 0);
  const rand = rng(seed);
  const perm = lettered.map((_, k) => k);
  const DRAWS = 100000;
  let ge = 0;
  let sum = 0;
  for (let d = 0; d < DRAWS; d++) {
    shuffle(perm, rand);
    let t = 0;
    for (let k = 0; k < perm.length; k++) t += Q[k][perm[k]];
    sum += t;
    if (t >= observed - 1e-12) ge++;
  }
  return {
    countingRule: rule,
    standardisedAcross: reference === 'all' ? 'all 114 suras' : 'the 29 lettered suras',
    observed: r4(observed),
    meanUnderShuffle: r4(sum / DRAWS),
    surasWithPositiveOwnScore: `${lettered.filter((_, k) => Q[k][k] > 0).length} of 29`,
    p: +((ge + 1) / (DRAWS + 1)).toPrecision(3),
  };
}
const L2primary = l2('skeleton', 'lettered', 20261123);
const L2secondary = {
  strictCount: l2('strict', 'lettered', 20261124),
  standardisedAcrossAllSuras: l2('skeleton', 'all', 20261125),
};
const rankOf = (s, ch, pool) => {
  const rate = (x) => (counts.skeleton[x].get(ch) || 0) / totals.skeleton[x];
  return 1 + pool.filter((x) => rate(x) > rate(s)).length;
};
const all114 = Array.from({ length: N }, (_, k) => k + 1);
const L2table = lettered.flatMap((s) =>
  openers.get(s).letters.map((ch) => ({
    sura: s,
    letter: ch,
    count: counts.skeleton[s].get(ch) || 0,
    perThousandLetters: r4((1000 * (counts.skeleton[s].get(ch) || 0)) / totals.skeleton[s]),
    rankAmong29: rankOf(s, ch, lettered),
    rankAmong114: rankOf(s, ch, all114),
  }))
);
const L2singles = L2table.filter((x) => [38, 50, 68].includes(x.sura));

// =====================================================================
// L1. Do same-letter suras form families?
// =====================================================================
const corpus = loadCorpus();
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;
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
const W = [];
const MVLv = [];
const lemAll = [];
const lemAfter5 = [];
for (let s = 1; s <= N; s++) {
  const vs = corpus.suras.get(s);
  lemAll[s] = lemmasOf(vs);
  lemAfter5[s] = lemmasOf(vs.filter((v) => v.v > 5));
  W[s] = vs.reduce((t, v) => t + v.words.length, 0);
  MVLv[s] = W[s] / vs.length;
}
const lexResponse = (lem) => {
  const idf = idfTable(lem.slice(1));
  return percentileResponse(matrix(lem.map((l) => (l ? vector(l, idf) : null))));
};
const Slex = lexResponse(lemAll);
const SlexAfter5 = lexResponse(lemAfter5);
const rhymes = loadRhymes();
const profile = [];
for (let s = 1; s <= N; s++) {
  const rs = rhymes.filter((x) => x.s === s);
  const m = new Map();
  for (const x of rs) m.set(x.key, (m.get(x.key) || 0) + 1 / rs.length);
  profile[s] = m;
}
const Srhyme = percentileResponse(matrix(profile));

const fam = (s) => (openers.has(s) ? openers.get(s).family : null);
const HM = 'حم';
const SAME = col((i, j) => (fam(i) && fam(i) === fam(j) ? 1 : 0));
const BOTH = col((i, j) => (fam(i) && fam(j) ? 1 : 0));
const ADJ = col((i, j) => (j - i === 1 ? 1 : 0));
const GRAD = col((i, j) => Math.log(j - i));
const CHRON_E = col((i, j) => Math.log(1 + Math.abs(meta[i].egyptian - meta[j].egyptian)));
const CHRON_N = col((i, j) => Math.log(1 + Math.abs(meta[i].noldeke - meta[j].noldeke)));
const TYPE = col((i, j) => (meta[i].type === meta[j].type ? 1 : 0));
const LEN = col((i, j) => Math.abs(Math.log(W[i]) - Math.log(W[j])));
const MVL = col((i, j) => Math.abs(Math.log(MVLv[i]) - Math.log(MVLv[j])));
const HMSAME = col((i, j) => (fam(i) === HM && fam(j) === HM ? 1 : 0));
const OTHERSAME = col((i, j) => (fam(i) && fam(i) === fam(j) && fam(i) !== HM ? 1 : 0));
const isCross = (i, j) => (i === 2 || i === 3) && j >= 29 && j <= 32;
const ALMCROSS = col((i, j) => (isCross(i, j) ? 1 : 0));
const SAMEREST = col((i, j) => (fam(i) && fam(i) === fam(j) && !isCross(i, j) ? 1 : 0));
const firstLetters = (s) => new Set([...openers.get(s).family]);
const PARTIAL = col((i, j) => {
  if (!fam(i) || !fam(j) || fam(i) === fam(j)) return 0;
  const a = firstLetters(i);
  const b = firstLetters(j);
  const inter = [...a].filter((x) => b.has(x)).length;
  return inter / new Set([...a, ...b]).size;
});
assert.equal(SAME.reduce((t, x) => t + x, 0), 47);
assert.equal(ALMCROSS.reduce((t, x) => t + x, 0), 8);

const base = [...FE, BOTH, ADJ, GRAD, CHRON_E, TYPE, LEN, MVL];
let seedN = 0;
const run = (label, y, x, Z) => {
  const t0 = Date.now();
  const r = dsp({ y, x, Z, P, N, perms: 10000, seed: 20261122 + seedN++ });
  console.error(`${label}: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return { test: label, beta: r4(r.beta), t: r4(r.t), p: +r.p.toPrecision(3) };
};
const L1primary = run('L1 PRIMARY: vocabulary, same letters', Slex, SAME, base);
const L1secondary = {
  rhyme: run('rhyme, same letters', Srhyme, SAME, base),
  noldeke: run('vocabulary, same letters, Noldeke chronology', Slex, SAME, [...FE, BOTH, ADJ, GRAD, CHRON_N, TYPE, LEN, MVL]),
  withoutFirstFiveVerses: run('vocabulary without first five verses, same letters', SlexAfter5, SAME, base),
  hmFamily: run('vocabulary, HM family', Slex, HMSAME, [...base, OTHERSAME]),
  separatedALM: run('vocabulary, separated ALM pairs (2-3 against 29-32)', Slex, ALMCROSS, [...base, SAMEREST]),
  partialOverlap: run('vocabulary, share of letters in common (different-letter pairs)', Slex, PARTIAL, [...base, SAME]),
};
const pick = (f) => P.pairs.map(([i, j], k) => (f(i, j) ? Slex[k] : null)).filter((x) => x !== null);
const famMean = (name) => r4(mean(pick((i, j) => fam(i) === name && fam(j) === name)));
const L1descriptive = {
  chanceLevel: 0.5,
  meanVocabularyPercentile: {
    allSameLetterPairs: r4(mean(pick((i, j) => fam(i) && fam(i) === fam(j)))),
    HM: famMean(HM),
    ALR: famMean('الر'),
    ALM_all: famMean('الم'),
    ALM_withinBlocks: r4(mean(pick((i, j) => fam(i) === 'الم' && fam(j) === 'الم' && !isCross(i, j)))),
    ALM_separatedPairs: r4(mean(pick((i, j) => isCross(i, j)))),
    TSM: famMean('طسم'),
    letteredPairsWithDifferentLetters: r4(mean(pick((i, j) => fam(i) && fam(j) && fam(i) !== fam(j)))),
    letteredWithUnlettered: r4(mean(pick((i, j) => !!fam(i) !== !!fam(j)))),
  },
  separatedALMPairs: P.pairs.map(([i, j], k) => (isCross(i, j) ? { pair: `${i}-${j}`, vocabularyPercentile: r4(Slex[k]) } : null)).filter(Boolean),
};

const out = {
  preregistrationSha256: preregHash,
  L1_families: { primary: L1primary, secondary: L1secondary, descriptive: L1descriptive },
  L2_letterFrequency: { primary: L2primary, secondary: L2secondary, singleLetterSuras: L2singles, table: L2table },
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch7.json'), JSON.stringify(out, null, 2));
const { table, ...l2brief } = out.L2_letterFrequency;
console.log(JSON.stringify({ ...out, L2_letterFrequency: l2brief }, null, 2));
