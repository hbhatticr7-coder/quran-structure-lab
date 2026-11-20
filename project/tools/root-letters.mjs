// Build suras only. Do ROOTS that share two of their three letters keep related company?
// (The old "two-letter" claim: q-t-', q-t-f, q-t-l all cut.) Company of root a from one
// half of the build suras, of root b from the other half.
// Exploration only: it reads the build suras and nothing else, and scores no rule.
// Usage: node project/tools/root-letters.mjs [least verses per half, default 4]
import * as lib from './lib.mjs';
const { corpus } = lib.loadText('build');
const { sets } = lib.loadSplit();
const MIN = Number(process.argv[2] || 4);

const folds = ['foldA', 'foldB'].map((name) => {
  const company = new Map(); const n = new Map(); let verses = 0;
  for (const v of corpus.verses) {
    if (!sets[name].has(v.s)) continue;
    verses++;
    const roots = new Set(v.words.filter((w) => w.root).map((w) => w.root));
    for (const r of roots) {
      n.set(r, (n.get(r) || 0) + 1);
      if (!company.has(r)) company.set(r, new Map());
      const c = company.get(r);
      for (const q of roots) if (q !== r) c.set(q, (c.get(q) || 0) + 1);
    }
  }
  return { company, n, verses };
});
const vecCache = new Map();
function vec(r, f) {
  const k = r + '|' + f;
  if (vecCache.has(k)) return vecCache.get(k);
  const F = folds[f]; const c = F.company.get(r); const out = new Map();
  if (c) for (const [q, x] of c) {
    if (x < 2) continue;
    const pmi = Math.log((x / F.n.get(r)) / (F.n.get(q) / F.verses));
    if (pmi > 0) out.set(q, pmi);
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
const sim = (a, b) => { const skip = new Set([a, b]); return (cos(vec(a, 0), vec(b, 1), skip) + cos(vec(a, 1), vec(b, 0), skip)) / 2; };

const norm = (r) => [...r.replace(/[أإآؤئ]/g, 'ء').replace(/ى/g, 'ي')];
const ok = [...folds[0].n.keys()].filter((r) => folds[0].n.get(r) >= MIN && (folds[1].n.get(r) || 0) >= MIN && norm(r).length === 3);
const L = new Map(ok.map((r) => [r, norm(r)]));
const total = (r) => folds[0].n.get(r) + folds[1].n.get(r);
const weak = (r) => L.get(r).some((c) => 'ويءا'.includes(c)) || L.get(r)[1] === L.get(r)[2];
console.log(`three-letter roots with at least ${MIN} verses in each half: ${ok.length} (${ok.filter((r) => !weak(r)).length} with three sound, distinct letters)`);

const shared = (a, b) => L.get(a).filter((c) => L.get(b).includes(c)).length;
function kind(a, b) {
  const x = L.get(a), y = L.get(b);
  if ([...x].sort().join('') === [...y].sort().join('')) return 'same three letters, other order';
  if (x[0] === y[0] && x[1] === y[1]) return 'share letters 1 and 2';
  if (x[1] === y[1] && x[2] === y[2]) return 'share letters 2 and 3';
  if (x[0] === y[0] && x[2] === y[2]) return 'share letters 1 and 3';
  return null;
}
function controls(a, b, K = 40) {
  const t = Math.log(total(b));
  return ok.filter((x) => x !== a && x !== b && shared(a, x) === 0 && shared(b, x) === 0)
    .sort((x, y) => Math.abs(Math.log(total(x)) - t) - Math.abs(Math.log(total(y)) - t)).slice(0, K);
}
function rank(a, b) {
  const s = sim(a, b); const cs = controls(a, b).map((x) => sim(a, x));
  return (cs.filter((c) => c < s).length + cs.filter((c) => c === s).length / 2) / cs.length;
}
const rows = [];
for (let i = 0; i < ok.length; i++) for (let j = i + 1; j < ok.length; j++) {
  const k = kind(ok[i], ok[j]);
  if (k) rows.push({ a: ok[i], b: ok[j], k, sound: !weak(ok[i]) && !weak(ok[j]), pct: (rank(ok[i], ok[j]) + rank(ok[j], ok[i])) / 2, s: sim(ok[i], ok[j]) });
}
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
// a t statistic is wrong here (a root sits in several pairs), so: shuffle check below
function report(label, sel) {
  if (!sel.length) return;
  const up = sel.filter((x) => x.pct > 0.5).length, down = sel.filter((x) => x.pct < 0.5).length;
  console.log(`${label}: ${sel.length} pairs, mean rank ${mean(sel.map((x) => x.pct)).toFixed(3)} (above 0.5: ${up}, below: ${down})`);
}
for (const k of ['share letters 1 and 2', 'share letters 2 and 3', 'share letters 1 and 3', 'same three letters, other order']) {
  report(k + ', all roots', rows.filter((x) => x.k === k));
  report(k + ', sound roots only', rows.filter((x) => x.k === k && x.sound));
}
report('ALL pairs sharing two letters in place', rows.filter((x) => x.k.startsWith('share')));
report('ALL, sound roots only', rows.filter((x) => x.k.startsWith('share') && x.sound));

// Null check: the same count for pairs sharing no letter, same number of pairs, drawn at random (seeded)
let seed = 12345; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const nPairs = rows.filter((x) => x.k.startsWith('share')).length;
const nullMeans = [];
for (let rep = 0; rep < 200; rep++) {
  const xs = [];
  while (xs.length < nPairs) {
    const a = ok[Math.floor(rnd() * ok.length)], b = ok[Math.floor(rnd() * ok.length)];
    if (a === b || shared(a, b) !== 0) continue;
    xs.push((rank(a, b) + rank(b, a)) / 2);
  }
  nullMeans.push(mean(xs));
}
nullMeans.sort((p, q) => p - q);
const obs = mean(rows.filter((x) => x.k.startsWith('share')).map((x) => x.pct));
console.log(`pairs sharing no letter, ${nPairs} at a time, 200 draws: mean rank ${mean(nullMeans).toFixed(3)}, range ${nullMeans[0].toFixed(3)} to ${nullMeans[199].toFixed(3)}; draws at or above the observed ${obs.toFixed(3)}: ${nullMeans.filter((m) => m >= obs).length}`);
console.log('\nthe twelve closest pairs sharing two letters:');
for (const x of rows.filter((y) => y.k.startsWith('share')).sort((p, q) => q.s - p.s).slice(0, 12)) console.log(`  ${x.a} (${total(x.a)})  ${x.b} (${total(x.b)})  ${x.s.toFixed(3)}  rank ${x.pct.toFixed(2)}  ${x.sound ? 'sound' : 'weak'}`);
