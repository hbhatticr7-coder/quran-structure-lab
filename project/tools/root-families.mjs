// Build suras only. Do words of one root keep the same company, even in different suras?
// For a pair of dictionary forms (a, b): a's company is taken from one half of the
// build suras, b's from the other half, so nothing is shared by sitting in the same verse.
// Exploration only: it reads the build suras and nothing else, and scores no rule.
// Usage: node project/tools/root-families.mjs [least verses per half, default 4] [roots to list, comma-separated] [--rivals]
import * as lib from './lib.mjs';
const { corpus } = lib.loadText('build');
const { sets } = lib.loadSplit();
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const MIN = Number(args[0] || 4);

// per fold: lemma -> Map(root -> verses with it), lemma -> n verses; root -> verses
const folds = ['foldA', 'foldB'].map((name) => {
  const company = new Map(); const n = new Map(); const rootDf = new Map(); let verses = 0;
  for (const v of corpus.verses) {
    if (!sets[name].has(v.s)) continue;
    verses++;
    const roots = new Set(v.words.filter((w) => w.root).map((w) => w.root));
    for (const r of roots) rootDf.set(r, (rootDf.get(r) || 0) + 1);
    const lemmas = new Map();
    for (const w of v.words) if (w.root && w.lemma) lemmas.set(w.lemma, w);
    for (const [l] of lemmas) {
      n.set(l, (n.get(l) || 0) + 1);
      if (!company.has(l)) company.set(l, new Map());
      const c = company.get(l);
      for (const r of roots) c.set(r, (c.get(r) || 0) + 1);
    }
  }
  return { company, n, rootDf, verses };
});
const info = new Map(); // lemma -> { root, pos }
for (const v of corpus.verses) for (const w of v.words) if (w.root && w.lemma && !info.has(w.lemma)) info.set(w.lemma, { root: w.root, pos: w.pos });

// positive pointwise mutual information vector of a lemma in a fold
const vecCache = new Map();
function vec(l, f) {
  const k = l + '|' + f;
  if (vecCache.has(k)) return vecCache.get(k);
  const F = folds[f]; const c = F.company.get(l); const out = new Map();
  if (c) for (const [r, x] of c) {
    if (x < 2) continue;
    const pmi = Math.log((x / F.n.get(l)) / (F.rootDf.get(r) / F.verses));
    if (pmi > 0) out.set(r, pmi);
  }
  vecCache.set(k, out);
  return out;
}
function cos(a, b, skip) {
  let dot = 0, na = 0, nb = 0;
  for (const [r, x] of a) { if (skip.has(r)) continue; na += x * x; const y = b.get(r); if (y) dot += x * y; }
  for (const [r, y] of b) { if (skip.has(r)) continue; nb += y * y; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
// similarity of a and b across halves, their own roots left out
const sim = (a, b) => { const skip = new Set([info.get(a).root, info.get(b).root]); return (cos(vec(a, 0), vec(b, 1), skip) + cos(vec(a, 1), vec(b, 0), skip)) / 2; };

const ok = [...info.keys()].filter((l) => (folds[0].n.get(l) || 0) >= MIN && (folds[1].n.get(l) || 0) >= MIN);
const total = (l) => folds[0].n.get(l) + folds[1].n.get(l);
const byRoot = new Map();
for (const l of ok) { const r = info.get(l).root; if (!byRoot.has(r)) byRoot.set(r, []); byRoot.get(r).push(l); }
console.log(`dictionary forms with at least ${MIN} verses in each half: ${ok.length}; roots with two or more such forms: ${[...byRoot.values()].filter((x) => x.length > 1).length}`);

// controls for (a, b): forms x of another root than a's and b's, same part of speech as b, nearest in frequency
function controls(a, b, K = 40) {
  const ra = info.get(a).root, rb = info.get(b).root, pos = info.get(b).pos, t = Math.log(total(b));
  return ok.filter((x) => info.get(x).root !== ra && info.get(x).root !== rb && info.get(x).pos === pos)
    .sort((x, y) => Math.abs(Math.log(total(x)) - t) - Math.abs(Math.log(total(y)) - t)).slice(0, K);
}
function rank(a, b) {
  const s = sim(a, b); const cs = controls(a, b).map((x) => sim(a, x));
  const below = cs.filter((c) => c < s).length + cs.filter((c) => c === s).length / 2;
  return { s, pct: below / cs.length, mean: cs.reduce((p, q) => p + q, 0) / cs.length };
}
const rows = [];
for (const [r, ls] of byRoot) for (let i = 0; i < ls.length; i++) for (let j = i + 1; j < ls.length; j++) {
  const x = rank(ls[i], ls[j]), y = rank(ls[j], ls[i]);
  rows.push({ root: r, a: ls[i], b: ls[j], s: x.s, pct: (x.pct + y.pct) / 2, ctl: (x.mean + y.mean) / 2 });
}
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
// one number per root, so a root with many forms counts once
const perRoot = [...byRoot.keys()].map((r) => rows.filter((x) => x.root === r)).filter((x) => x.length).map((x) => ({ root: x[0].root, pct: mean(x.map((y) => y.pct)), s: mean(x.map((y) => y.s)), ctl: mean(x.map((y) => y.ctl)) }));
const up = perRoot.filter((x) => x.pct > 0.5).length, down = perRoot.filter((x) => x.pct < 0.5).length;
console.log(`pairs of forms sharing a root: ${rows.length} in ${perRoot.length} roots`);
console.log(`mean similarity: same root ${mean(perRoot.map((x) => x.s)).toFixed(4)}, matched other roots ${mean(perRoot.map((x) => x.ctl)).toFixed(4)}`);
console.log(`mean rank among 40 matched forms of other roots (0.5 = chance): ${mean(perRoot.map((x) => x.pct)).toFixed(3)}; roots above 0.5: ${up}, below: ${down}`);
// sign test, two-sided, exact
const binom = (n, k) => { let p = 0; const C = (n, k) => { let c = 1; for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c; }; for (let i = k; i <= n; i++) p += C(n, i) * 0.5 ** n; return p; };
console.log(`sign test over roots, one-sided: p = ${binom(up + down, up).toExponential(2)}`);
// ceiling: a form against itself across halves
const self = ok.map((l) => { const s = cos(vec(l, 0), vec(l, 1), new Set([info.get(l).root])); const cs = controls(l, l).map((x) => sim(l, x)); return { s, pct: (cs.filter((c) => c < s).length + cs.filter((c) => c === s).length / 2) / cs.length }; });
console.log(`for scale, a form against itself across the halves: similarity ${mean(self.map((x) => x.s)).toFixed(4)}, rank ${mean(self.map((x) => x.pct)).toFixed(3)}`);
// by part of speech of the pair
for (const kind of ['N-N', 'N-V', 'V-V']) {
  const sel = rows.filter((x) => [info.get(x.a).pos, info.get(x.b).pos].sort().join('-') === kind);
  if (sel.length) console.log(`  ${kind}: ${sel.length} pairs, mean rank ${mean(sel.map((x) => x.pct)).toFixed(3)}`);
}
// the named roots
const named = (args[1] || 'عظم,رحم,ظلم,جنن,بشر,قلب,دين,صدق,سلم,أمن,حكم,زكو,كفر,روح,نفس,خلف,عبد,فتن,علو,كبر').split(',');
console.log('\nroot\tform a (verses)\tform b (verses)\tsimilarity\trank');
for (const r of named) for (const x of rows.filter((y) => y.root === r)) console.log(`${r}\t${x.a} (${total(x.a)})\t${x.b} (${total(x.b)})\t${x.s.toFixed(3)}\t${x.pct.toFixed(2)}`);
// all forms of the root 'azm in the build suras, with counts, whatever the threshold
console.log('\nforms of the root عظم in the build suras:');
for (const [l, i] of info) if (i.root === 'عظم') console.log(`  ${l}\t${i.pos}\t${(folds[0].n.get(l) || 0) + (folds[1].n.get(l) || 0)} verses`);

// Rivals found by measurement: for each form, the forms of other roots (same part of
// speech) whose company is most like its own, across the halves.
if (process.argv.includes('--rivals')) {
  const pairs = [];
  for (let i = 0; i < ok.length; i++) for (let j = i + 1; j < ok.length; j++) {
    const a = ok[i], b = ok[j];
    if (info.get(a).root === info.get(b).root || info.get(a).pos !== info.get(b).pos) continue;
    pairs.push({ a, b, s: sim(a, b) });
  }
  pairs.sort((x, y) => y.s - x.s);
  console.log(`\nclosest pairs of forms from different roots (of ${pairs.length}):`);
  for (const p of pairs.slice(0, 60)) console.log(`  ${p.s.toFixed(3)}\t${p.a} (${total(p.a)})\t${p.b} (${total(p.b)})`);
}
