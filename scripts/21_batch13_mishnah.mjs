// Batch 13: the Mishnah as a second length-ordered collection.
// Exactly as specified in PREREGISTRATION_batch13.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT_DIR } from '../src/corpus.mjs';
import { idfTable, vector, cosine } from '../src/similarity.mjs';
import { rng, shuffle, mean, sd } from '../src/stats.mjs';

const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch13.md'))).digest('hex');
const raw = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'external', 'sefaria', 'mishnah.json'), 'utf8'));

// ---------- text to word forms ----------
const flatten = (x) => (Array.isArray(x) ? x.flatMap(flatten) : [String(x)]);
function tokens(text) {
  return flatten(text)
    .join(' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/־/g, ' ') // maqaf joins words
    .replace(/[֑-ׇ]/g, '') // vowel points and cantillation
    .split(/[^א-ת]+/)
    .filter(Boolean);
}
const tractates = raw.map((t, i) => {
  const all = tokens(t.text);
  return { i, order: t.order, title: t.title.replace('Mishnah ', ''), chapters: t.chapters, words: all.length, forms: all.filter((w) => w.length >= 2) };
});

// ---------- similarity ----------
function similarity(units) {
  const n = units.length;
  const idf = idfTable(units.map((u) => u.forms));
  const vec = units.map((u) => vector(u.forms, idf));
  const M = Array.from({ length: n }, () => new Float64Array(n));
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) M[a][b] = M[b][a] = cosine(vec[a], vec[b]);
  const pct = Array.from({ length: n }, () => new Float64Array(n));
  for (let a = 0; a < n; a++) {
    const others = [];
    for (let b = 0; b < n; b++) if (b !== a) others.push(b);
    others.sort((x, y) => M[a][x] - M[a][y]);
    let k = 0;
    while (k < others.length) {
      let e = k;
      while (e + 1 < others.length && M[a][others[e + 1]] === M[a][others[k]]) e++;
      for (let t = k; t <= e; t++) pct[a][others[t]] = (k + e) / 2 / (others.length - 1);
      k = e + 1;
    }
  }
  const S = Array.from({ length: n }, () => new Float64Array(n));
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (a !== b) S[a][b] = (pct[a][b] + pct[b][a]) / 2;
  return S;
}

// units: [{ order, len, ... }] in canonical sequence; indices into S follow that sequence.
function analyse(units, S, lenOf, { keepTies = false, seed }) {
  const orders = [...new Set(units.map((u) => u.order))].map((o) => units.map((u, k) => ({ u, k })).filter((x) => x.u.order === o).map((x) => x.k));
  const len = units.map(lenOf);
  const disorderOf = (seqs) => {
    let d = 0;
    for (const q of seqs) for (let a = 0; a < q.length; a++) for (let b = a + 1; b < q.length; b++) if (len[q[a]] < len[q[b]]) d++;
    return d;
  };
  const adjMean = (seqs) => {
    let t = 0;
    let n = 0;
    for (const q of seqs) for (let k = 0; k + 1 < q.length; k++) {
      t += S[q[k]][q[k + 1]];
      n++;
    }
    return t / n;
  };
  const target = disorderOf(orders);
  const rand = rng(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  const draw = (sigma) =>
    orders.map((q) => {
      const keyed = q.map((k) => ({ k, key: -Math.log(len[k]) + sigma * gauss() }));
      if (keepTies) {
        // Tied units keep their actual relative order: within each tie group,
        // hand out the group's noisy keys in ascending order.
        const groups = new Map();
        keyed.forEach((x) => {
          if (!groups.has(len[x.k])) groups.set(len[x.k], []);
          groups.get(len[x.k]).push(x);
        });
        for (const g of groups.values()) {
          const keys = g.map((x) => x.key).sort((a, b) => a - b);
          g.forEach((x, j) => (x.key = keys[j]));
        }
      }
      return keyed.sort((a, b) => a.key - b.key).map((x) => x.k);
    });
  let lo = 0;
  let hi = 4;
  for (let it = 0; it < 30; it++) {
    const mid = (lo + hi) / 2;
    let m = 0;
    for (let k = 0; k < 400; k++) m += disorderOf(draw(mid));
    if (m / 400 < target) lo = mid;
    else hi = mid;
  }
  const sigma = (lo + hi) / 2;
  const tol = Math.max(0.1 * target, 1);
  const vals = [];
  for (let g = 0; g < 20000; g++) {
    const o = draw(sigma);
    if (Math.abs(disorderOf(o) - target) <= tol) vals.push(adjMean(o));
  }
  const obs = adjMean(orders);
  // Strict sort, ties in their actual relative order.
  const sorted = orders.map((q) => q.slice().sort((a, b) => len[b] - len[a] || a - b));
  const pairsTotal = orders.reduce((t, q) => t + (q.length * (q.length - 1)) / 2, 0);
  return {
    units: units.length,
    adjacentPairs: orders.reduce((t, q) => t + q.length - 1, 0),
    disorderPairs: target,
    disorderShare: r4(target / pairsTotal),
    noiseSigma: r4(sigma),
    nullOrdersKept: vals.length,
    actual: r4(obs),
    strictSort: r4(adjMean(sorted)),
    nullMean: r4(mean(vals)),
    nullSd: r4(sd(vals)),
    p: +((vals.filter((v) => v >= obs - 1e-12).length + 1) / (vals.length + 1)).toPrecision(3),
  };
}

// ---------- V: does the measure see the six orders? ----------
const S = similarity(tractates);
function validation() {
  const stat = (labels) => {
    const same = [];
    const cross = [];
    for (let a = 0; a < tractates.length; a++) for (let b = a + 1; b < tractates.length; b++) (labels[a] === labels[b] ? same : cross).push(S[a][b]);
    return mean(same) - mean(cross);
  };
  const labels = tractates.map((t) => t.order);
  const obs = stat(labels);
  const rand = rng(20261190);
  const perm = labels.slice();
  let ge = 0;
  for (let d = 0; d < 10000; d++) if (stat(shuffle(perm, rand)) >= obs - 1e-12) ge++;
  const bavot = ['Bava Kamma', 'Bava Metzia', 'Bava Batra'].map((n) => tractates.findIndex((t) => t.title === n));
  return {
    sameOrderMinusCrossOrder: r4(obs),
    p: +((ge + 1) / 10001).toPrecision(3),
    threeBavotSimilarity: [r4(S[bavot[0]][bavot[1]]), r4(S[bavot[0]][bavot[2]]), r4(S[bavot[1]][bavot[2]])],
  };
}
const V = validation();

const M1 = analyse(tractates, S, (u) => u.chapters, { seed: 20261191 });
const M2 = analyse(tractates, S, (u) => u.words, { seed: 20261192 });
const M3 = analyse(tractates, S, (u) => u.chapters, { keepTies: true, seed: 20261193 });

// M4: without Avot; the three Bavot as one unit.
const merged = [];
for (const t of tractates) {
  if (t.title === 'Pirkei Avot') continue;
  if (t.title === 'Bava Metzia' || t.title === 'Bava Batra') {
    const b = merged.find((x) => x.title === 'Bavot');
    b.chapters += t.chapters;
    b.words += t.words;
    b.forms = b.forms.concat(t.forms);
    continue;
  }
  merged.push(t.title === 'Bava Kamma' ? { ...t, title: 'Bavot', forms: t.forms.slice() } : t);
}
const M4 = analyse(merged, similarity(merged), (u) => u.chapters, { seed: 20261194 });

const out = {
  preregistrationSha256: preregHash,
  tractates: tractates.length,
  words: tractates.reduce((t, x) => t + x.words, 0),
  V_validation: V,
  M1_chapters: M1,
  M2_words: M2,
  M3_trueExceptionsOnly: M3,
  M4_withoutAvot_bavotMerged: M4,
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch13.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
