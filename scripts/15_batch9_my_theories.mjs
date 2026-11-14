// Batch 9: three predictions of my own about the letters,
// exactly as specified in PREREGISTRATION_batch9.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadLetterData } from '../src/letters.mjs';
import { rng, shuffle } from '../src/stats.mjs';

const N = 114;
const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch9.md'))).digest('hex');
const corpus = loadCorpus();
const { openers, counts } = loadLetterData();
const lettered = (s) => openers.has(s);
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;

// ---------- lexicon ----------
const R = { ktb: 'كتب', qr: 'قرأ', tlw: 'تلو', qlm: 'قلم', shf: 'صحف', lsn: 'لسن', why: 'وحي', nzl: 'نزل', str: 'سطر', arb: 'عرب' };
const isArabi = (w) => w.root === R.arb && (w.lemma || '').startsWith('عَرَبِ');
const isMusaytir = (w) => w.root === R.str && (w.lemma || '').startsWith('مُصَيْطِر');
const FULL = new Set([R.ktb, R.qr, R.tlw, R.qlm, R.shf, R.lsn, R.why, R.nzl, R.str]);
const NARROW = new Set([R.ktb, R.qr, R.tlw, R.qlm, R.shf, R.lsn, R.str]);
const inLexicon = (w, set) => isArabi(w) || (set.has(w.root) && !isMusaytir(w));
// sanity: 11 occurrences of 'arabi
assert.equal(corpus.verses.reduce((t, v) => t + v.words.filter(isArabi).length, 0), 11);

// ---------- small weighted least squares ----------
function solve(A, b) {
  // Gauss-Jordan; returns { x, inv } for symmetric positive-definite A.
  const n = A.length;
  const M = A.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)), b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c];
    for (let j = 0; j < 2 * n + 1; j++) M[c][j] /= d;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (f) for (let j = 0; j < 2 * n + 1; j++) M[r][j] -= f * M[c][j];
    }
  }
  return { x: M.map((row) => row[2 * n]), inv: M.map((row) => row.slice(n, 2 * n)) };
}
// X: rows of predictors (already weighted), y: weighted response. Returns coefficients, fitted values and t of the last column.
function ols(X, y) {
  const p = X[0].length;
  const XtX = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => X.reduce((t, row) => t + row[a] * row[b], 0)));
  const Xty = Array.from({ length: p }, (_, a) => X.reduce((t, row, i) => t + row[a] * y[i], 0));
  const { x: beta, inv } = solve(XtX, Xty);
  const fitted = X.map((row) => row.reduce((t, v, a) => t + v * beta[a], 0));
  const rss = y.reduce((t, v, i) => t + (v - fitted[i]) ** 2, 0);
  const se = Math.sqrt((rss / (X.length - p)) * inv[p - 1][p - 1]);
  return { beta, fitted, t: beta[p - 1] / se };
}

function m1({ lexicon = FULL, skipOpening = true, meccanOnly = false, order = 'egyptian', seed }) {
  const rows = [];
  for (let s = 1; s <= N; s++) {
    if (meccanOnly && meta[s].type !== 'Meccan') continue;
    const all = corpus.suras.get(s);
    const vs = skipOpening ? all.filter((v) => v.v > 3) : all;
    const content = vs.reduce((t, v) => t + v.roots.length, 0);
    if (content === 0) continue;
    const hits = vs.reduce((t, v) => t + v.words.filter((w) => w.root && inLexicon(w, lexicon)).length, 0);
    const words = all.reduce((t, v) => t + v.words.length, 0);
    rows.push({ s, rate: (1000 * hits) / content, w: content, hits, lettered: lettered(s) ? 1 : 0, med: meta[s].type === 'Medinan' ? 1 : 0, rank: meta[s][order] / 114, lw: Math.log(words), lm: Math.log(words / all.length) });
  }
  const sw = rows.map((r) => Math.sqrt(r.w));
  const cols = meccanOnly ? (r) => [1, r.rank, r.lw, r.lm, r.lettered] : (r) => [1, r.med, r.rank, r.lw, r.lm, r.lettered];
  const X = rows.map((r, i) => cols(r).map((v) => v * sw[i]));
  const y = rows.map((r, i) => r.rate * sw[i]);
  const full = ols(X, y);
  const Xred = X.map((row) => row.slice(0, -1));
  // reduced fit: add a dummy last column trick is not needed; refit directly
  const pr = Xred[0].length;
  const XtX = Array.from({ length: pr }, (_, a) => Array.from({ length: pr }, (_, b) => Xred.reduce((t, row) => t + row[a] * row[b], 0)));
  const Xty = Array.from({ length: pr }, (_, a) => Xred.reduce((t, row, i) => t + row[a] * y[i], 0));
  const bred = solve(XtX, Xty).x;
  const fitRed = Xred.map((row) => row.reduce((t, v, a) => t + v * bred[a], 0));
  const resid = y.map((v, i) => v - fitRed[i]);
  const rand = rng(seed);
  const DRAWS = 100000;
  let ge = 0;
  const e = resid.slice();
  for (let d = 0; d < DRAWS; d++) {
    shuffle(e, rand);
    if (ols(X, fitRed.map((f, i) => f + e[i])).t >= full.t - 1e-12) ge++;
  }
  const pooled = (flag) => {
    const sel = rows.filter((r) => r.lettered === flag);
    return r4((1000 * sel.reduce((t, r) => t + r.hits, 0)) / sel.reduce((t, r) => t + r.w, 0));
  };
  return {
    suras: rows.length,
    letteredSuras: rows.filter((r) => r.lettered).length,
    pooledRatePer1000_lettered: pooled(1),
    pooledRatePer1000_unlettered: pooled(0),
    adjustedDifferencePer1000: r4(full.beta[full.beta.length - 1]),
    t: r4(full.t),
    p: +((ge + 1) / (DRAWS + 1)).toPrecision(3),
  };
}
const M1 = {
  primary: m1({ seed: 20261140 }),
  secondary: {
    meccanOnly: m1({ meccanOnly: true, seed: 20261150 }),
    narrowLexicon: m1({ lexicon: NARROW, seed: 20261151 }),
    openingVersesKept: m1({ skipOpening: false, seed: 20261152 }),
    noldekeOrder: m1({ order: 'noldeke', seed: 20261153 }),
  },
};

// ---------- M2 ----------
const C = (n, k) => {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
};
const arabiBySura = [];
let contentLettered = 0;
let contentAll = 0;
for (let s = 1; s <= N; s++) {
  const vs = corpus.suras.get(s);
  const n = vs.reduce((t, v) => t + v.words.filter(isArabi).length, 0);
  for (let k = 0; k < n; k++) arabiBySura.push(s);
  const c = vs.reduce((t, v) => t + v.roots.length, 0);
  contentAll += c;
  if (lettered(s)) contentLettered += c;
}
const share = contentLettered / contentAll;
const inLettered = arabiBySura.filter(lettered).length;
let tail = 0;
for (let k = inLettered; k <= 11; k++) tail += C(11, k) * share ** k * (1 - share) ** (11 - k);
const M2 = {
  blind: false,
  occurrencesBySura: arabiBySura,
  inLetteredSuras: `${inLettered} of 11`,
  shareOfTextInLetteredSuras: r4(share),
  expectedInLettered: r4(11 * share),
  p: +tail.toPrecision(3),
};

// ---------- M3 ----------
const A = 'ا', H = 'ه', AYN = 'ع', HH = 'ح', Q = 'ق', K = 'ك', Y = 'ي', LM = 'ل', RA = 'ر', NN = 'ن', TT = 'ط', SD = 'ص', SN = 'س', MM = 'م';
const THE14 = [A, H, AYN, HH, Q, K, Y, LM, RA, NN, TT, SD, SN, MM];
const openingStrings = [...new Set([...openers.values()].flatMap((o) => o.strings))].filter((s) => [...s].length > 1);
assert.equal(openingStrings.length, 11);
const pairSet = new Set();
for (const str of openingStrings) {
  const q = [...str];
  for (let i = 0; i < q.length; i++) for (let j = i + 1; j < q.length; j++) pairSet.add(q[i] + q[j]);
}
const pairs = [...pairSet].map((p) => [...p]);
const freqOrder = THE14.slice().sort((x, y) => {
  const tot = (ch) => counts.skeleton.slice(1).reduce((t, m) => t + (m.get(ch) || 0), 0);
  return tot(y) - tot(x);
});
const candidates = {
  'articulation, throat to lips (Sibawayh)': [A, H, AYN, HH, Q, K, Y, LM, RA, NN, TT, SD, SN, MM],
  'modern alphabetical': [A, HH, RA, SN, SD, TT, AYN, Q, K, LM, MM, NN, H, Y],
  'abjad': [A, H, HH, TT, Y, K, LM, MM, NN, SN, AYN, SD, Q, RA],
  'frequency in the Quran, most frequent first': freqOrder,
};
for (const o of Object.values(candidates)) assert.equal(new Set(o).size, 14);
const concord = (order) => {
  const rank = new Map(order.map((ch, i) => [ch, i]));
  return pairs.filter(([x, y]) => rank.get(x) < rank.get(y)).length / pairs.length;
};
const randM3 = rng(20261141);
const DRAWS3 = 200000;
const nullC = new Float64Array(DRAWS3);
const perm = THE14.slice();
for (let d = 0; d < DRAWS3; d++) nullC[d] = concord(shuffle(perm, randM3));
const M3 = {
  letterPairsWithAnObservedOrder: pairs.length,
  candidates: Object.fromEntries(
    Object.entries(candidates).map(([name, order]) => {
      const c = concord(order);
      let ext = 0;
      for (const x of nullC) if (Math.abs(x - 0.5) >= Math.abs(c - 0.5) - 1e-12) ext++;
      const rank = new Map(order.map((ch, i) => [ch, i]));
      return [name, { pairsAgreeing: `${Math.round(c * pairs.length)} of ${pairs.length}`, share: r4(c), pTwoSided: +((ext + 1) / (DRAWS3 + 1)).toPrecision(3), pairsDisagreeing: pairs.filter(([x, y]) => rank.get(x) > rank.get(y)).map((p) => p.join('<')) }];
    })
  ),
};

const out = { preregistrationSha256: preregHash, M1_scriptureVocabulary: M1, M2_arabic: M2, M3_order: M3 };
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch9.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
