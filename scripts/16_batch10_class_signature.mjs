// Batch 10: what sets the lettered suras apart? As specified in PREREGISTRATION_batch10.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR, MORPH_PATH } from '../src/corpus.mjs';
import { loadLetterData } from '../src/letters.mjs';
import { loadRhymes } from '../src/rhyme.mjs';
import { rng, shuffle } from '../src/stats.mjs';
import { fitter, freedmanLane } from '../src/regress.mjs';

const N = 114;
const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch10.md'))).digest('hex');
const corpus = loadCorpus();
const { openers } = loadLetterData();
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;

// ---------- sura table (first three verses removed) ----------
const suras = [];
for (let s = 1; s <= N; s++) {
  const all = corpus.suras.get(s);
  const vs = all.filter((v) => v.v > 3);
  const content = vs.reduce((t, v) => t + v.roots.length, 0);
  if (content === 0) continue;
  const rootCount = new Map();
  for (const v of vs) for (const r of v.roots) rootCount.set(r, (rootCount.get(r) || 0) + 1);
  const words = all.reduce((t, v) => t + v.words.length, 0);
  suras.push({ s, content, rootCount, lettered: openers.has(s) ? 1 : 0, med: meta[s].type === 'Medinan' ? 1 : 0, egyptian: meta[s].egyptian / 114, noldeke: meta[s].noldeke / 114, lw: Math.log(words), lm: Math.log(words / all.length) });
}
const design = (rows, { order = 'egyptian', dropMed = false } = {}) =>
  rows.map((r) => {
    const sw = Math.sqrt(r.content);
    const cols = dropMed ? [1, r[order], r.lw, r.lm, r.lettered] : [1, r.med, r[order], r.lw, r.lm, r.lettered];
    return cols.map((v) => v * sw);
  });
const weighted = (rows, f) => Float64Array.from(rows, (r) => f(r) * Math.sqrt(r.content));
const rate = (root) => (r) => (1000 * (r.rootCount.get(root) || 0)) / r.content;

// ---------- Part 1: vocabulary ----------
const totals = new Map();
const inSuras = new Map();
for (const v of corpus.verses) for (const r of v.roots) totals.set(r, (totals.get(r) || 0) + 1);
for (let s = 1; s <= N; s++) for (const r of new Set(corpus.suras.get(s).flatMap((v) => v.roots))) inSuras.set(r, (inSuras.get(r) || 0) + 1);
const roots = [...totals.keys()].filter((r) => totals.get(r) >= 30 && inSuras.get(r) >= 10);

function tAll(rows, opts) {
  const fit = fitter(design(rows, opts));
  return new Map(roots.map((root) => [root, fit(weighted(rows, rate(root))).t]));
}
const K = 15;
function select(tmap) {
  const sorted = [...tmap].filter(([, t]) => Number.isFinite(t)).sort((a, b) => b[1] - a[1]);
  return { high: sorted.slice(0, K).map((x) => x[0]), low: sorted.slice(-K).map((x) => x[0]) };
}
const selectedCount = new Map(roots.map((r) => [r, { high: 0, low: 0 }]));
const confirmations = [];
for (let split = 0; split < 20; split++) {
  const rand = rng(20261160 + split);
  const halves = [[], []];
  for (const key of ['1-0', '1-1', '0-0', '0-1']) {
    const group = shuffle(suras.filter((r) => `${r.lettered}-${r.med}` === key), rand);
    group.forEach((r, i) => halves[i % 2].push(r));
  }
  for (const [train, test] of [[halves[0], halves[1]], [halves[1], halves[0]]]) {
    // With few Medinan suras in a half, drop that column if it would be degenerate.
    const dropMed = train.filter((r) => r.med).length < 3 || test.filter((r) => r.med).length < 3;
    const sel = select(tAll(train, { dropMed }));
    sel.high.forEach((r) => selectedCount.get(r).high++);
    sel.low.forEach((r) => selectedCount.get(r).low++);
    const score = (r) => sel.high.reduce((t, root) => t + rate(root)(r), 0) - sel.low.reduce((t, root) => t + rate(root)(r), 0);
    const res = freedmanLane(design(test, { dropMed }), weighted(test, score), { draws: 20000, seed: 30000 + confirmations.length });
    confirmations.push({ split, t: r4(res.t), p: +res.p.toPrecision(3) });
  }
}
const ps = confirmations.map((c) => c.p).sort((a, b) => a - b);
const validation = {
  confirmationTests: confirmations.length,
  medianP: r4((ps[19] + ps[20]) / 2),
  testsBelow05: confirmations.filter((c) => c.p < 0.05).length,
  medianT: r4(confirmations.map((c) => c.t).sort((a, b) => a - b)[20]),
  passes: (ps[19] + ps[20]) / 2 < 0.05,
};

const tFull = tAll(suras);
const tMeccan = tAll(suras.filter((r) => !r.med), { dropMed: true });
const tNoldeke = tAll(suras, { order: 'noldeke' });
const pooled = (root, flag) => {
  const sel = suras.filter((r) => r.lettered === flag);
  return r4((1000 * sel.reduce((t, r) => t + (r.rootCount.get(root) || 0), 0)) / sel.reduce((t, r) => t + r.content, 0));
};
const lemmasOfRoot = (root) => {
  const m = new Map();
  for (const v of corpus.verses) for (const w of v.words) if (w.root === root) m.set(w.lemma, (m.get(w.lemma) || 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([l, n]) => `${l} (${n})`);
};
const describe = (root) => ({
  root,
  commonestWords: lemmasOfRoot(root),
  selectedInShareOfHalfSamples: r4(Math.max(selectedCount.get(root).high, selectedCount.get(root).low) / 40),
  direction: selectedCount.get(root).high >= selectedCount.get(root).low ? 'more in lettered suras' : 'less in lettered suras',
  per1000_lettered: pooled(root, 1),
  per1000_unlettered: pooled(root, 0),
  t: r4(tFull.get(root)),
  tMeccanOnly: r4(tMeccan.get(root)),
  tNoldeke: r4(tNoldeke.get(root)),
});
const stable = roots.filter((r) => Math.max(selectedCount.get(r).high, selectedCount.get(r).low) >= 24).map(describe).sort((a, b) => b.t - a.t);

// ---------- Part 2: formal features ----------
const feat = new Map(); // sura -> counters
const bump = (s, k, n = 1) => {
  if (!feat.has(s)) feat.set(s, {});
  feat.get(s)[k] = (feat.get(s)[k] || 0) + n;
};
{
  let lastWord = '';
  for (const line of fs.readFileSync(MORPH_PATH, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const [loc, , tag, featStr] = line.split('\t');
    const [s, v, w] = loc.split(':').map(Number);
    if (v <= 3) continue;
    const f = (featStr || '').split('|');
    const wk = `${s}:${v}:${w}`;
    if (wk !== lastWord) {
      bump(s, 'words');
      lastWord = wk;
    }
    if (f.includes('VOC')) bump(s, 'vocative');
    if (f.includes('PREF') || f.includes('SUFF')) continue;
    if (f.includes('PN')) bump(s, 'properNoun');
    if (f.some((x) => x.startsWith('ROOT:'))) bump(s, 'contentStems');
    if (tag === 'V') {
      bump(s, 'verbs');
      if (f.includes('IMPV')) bump(s, 'imperative');
      if (f.includes('PERF')) bump(s, 'perfect');
      if (f.includes('PASS')) bump(s, 'passive');
      if (f.includes('1P')) bump(s, 'firstPlural');
      if (f.some((x) => /^2[MF]?[SDP]?$/.test(x))) bump(s, 'secondPerson');
    }
  }
}
const rhymes = loadRhymes();
for (const x of rhymes) {
  if (x.v <= 3) continue;
  bump(x.s, 'verses');
  if (x.family === 'L+C') bump(x.s, 'rhymeLC');
}
const g = (s, k) => (feat.get(s) && feat.get(s)[k]) || 0;
const per1000 = (k) => (r) => (1000 * g(r.s, k)) / g(r.s, 'words');
const formal = {
  'proper nouns per 1,000 words': per1000('properNoun'),
  'imperatives per 1,000 words': per1000('imperative'),
  'share of verbs in the perfect tense': (r) => (g(r.s, 'verbs') ? g(r.s, 'perfect') / g(r.s, 'verbs') : 0),
  'first-person plural verbs per 1,000 words': per1000('firstPlural'),
  'second-person verbs per 1,000 words': per1000('secondPerson'),
  'passive verbs per 1,000 words': per1000('passive'),
  'vocative ya per 1,000 words': per1000('vocative'),
  'verbs as a share of content words': (r) => (g(r.s, 'contentStems') ? g(r.s, 'verbs') / g(r.s, 'contentStems') : 0),
  'share of verses rhyming in long i/u + consonant': (r) => (g(r.s, 'verses') ? g(r.s, 'rhymeLC') / g(r.s, 'verses') : 0),
};
assert.equal(Object.keys(formal).length, 9);
const X = design(suras);
const pooledMean = (f, flag) => {
  const sel = suras.filter((r) => r.lettered === flag);
  return r4(sel.reduce((t, r) => t + f(r) * r.content, 0) / sel.reduce((t, r) => t + r.content, 0));
};
const formalRes = Object.entries(formal).map(([name, f], k) => {
  const res = freedmanLane(X, weighted(suras, f), { draws: 100000, seed: 40000 + k, twoSided: true });
  return { feature: name, lettered: pooledMean(f, 1), unlettered: pooledMean(f, 0), adjustedDifference: r4(res.beta), t: r4(res.t), p: +res.p.toPrecision(3) };
});
// Benjamini-Hochberg
const order = formalRes.map((r, i) => [r.p, i]).sort((a, b) => a[0] - b[0]);
let prev = 1;
for (let k = order.length - 1; k >= 0; k--) {
  prev = Math.min(prev, (order[k][0] * order.length) / (k + 1));
  formalRes[order[k][1]].pAdjusted = +prev.toPrecision(3);
}

const out = {
  preregistrationSha256: preregHash,
  surasUsed: suras.length,
  rootsExamined: roots.length,
  part1_vocabulary: { validation, stableRoots: stable, confirmations },
  part2_formalFeatures: formalRes,
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch10.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify({ ...out, part1_vocabulary: { validation, stableRoots: stable } }, null, 1));
