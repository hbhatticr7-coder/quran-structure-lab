// Batch 12: a census of shapes, exactly as specified in PREREGISTRATION_batch12.md.
// Pass --count to list eligible units and block sizes only (no detector is run).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadOshbBooks } from '../src/hebrew.mjs';
import { loadGospels } from '../src/greek.mjs';
import { idfTable } from '../src/similarity.mjs';
import { makeBlocks, similarityMatrix, detectRing, detectParallel } from '../src/concentric.mjs';

const B = 12;
const MIN_CONTENT = 300;
const r4 = (x) => +x.toFixed(4);

// ---------- units ----------
function unitsFrom(verses, keyOf, labelOf, verseNo) {
  const groups = new Map();
  for (const v of verses) {
    const k = keyOf(v);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(v);
  }
  return [...groups].map(([k, vs]) => ({ label: labelOf(vs[0]), verses: vs.map((v) => v.lemmas), verseNos: vs.map(verseNo) }));
}
const quran = loadCorpus();
const hebrew = loadOshbBooks(['Gen', '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr']);
const greek = loadGospels();
const corpora = {
  quran: { idf: idfTable(quran.verses.map((v) => v.lemmas)), units: unitsFrom(quran.verses, (v) => v.s, (v) => `sura ${v.s}`, (v) => v.v) },
  hebrewChapters: { idf: idfTable(hebrew.verses.map((v) => v.lemmas)), units: unitsFrom(hebrew.verses, (v) => `${v.book}.${v.ch}`, (v) => `${v.book} ${v.ch}`, (v) => v.v) },
  gospelChapters: { idf: idfTable(greek.verses.map((v) => v.lemmas)), units: unitsFrom(greek.verses, (v) => `${v.book}.${v.ch}`, (v) => `${v.book} ${v.ch}`, (v) => v.v) },
};
for (const c of Object.values(corpora)) {
  c.eligible = [];
  for (const u of c.units) {
    const content = u.verses.reduce((t, v) => t + v.length, 0);
    if (content < MIN_CONTENT) continue;
    const blocks = makeBlocks(u.verses, B);
    if (!blocks) continue;
    c.eligible.push({ ...u, content, blocks });
  }
}
if (process.argv.includes('--count')) {
  for (const [name, c] of Object.entries(corpora)) {
    const sizes = c.eligible.flatMap((u) => u.blocks.map((b) => b.tokens.length));
    console.log(name, 'units', c.units.length, 'eligible', c.eligible.length, 'block size min/median/max', Math.min(...sizes), sizes.sort((a, b) => a - b)[Math.floor(sizes.length / 2)], Math.max(...sizes));
  }
  console.log('eligible suras:', corpora.quran.eligible.map((u) => u.label.replace('sura ', '')).join(' '));
  process.exit(0);
}

const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch12.md'))).digest('hex');
const range = (u, b) => `${u.verseNos[u.blocks[b].from]}-${u.verseNos[u.blocks[b].to]}`;
let unitIndex = 0;
for (const c of Object.values(corpora)) {
  c.results = c.eligible.map((u) => {
    const seed = 20261180 + unitIndex++;
    const S = similarityMatrix(u.blocks, c.idf);
    const ra = detectRing(S, { mode: 'align', perms: 5000, seed });
    const rs = detectRing(S, { mode: 'strict', perms: 5000, seed: seed + 100000 });
    const par = detectParallel(S, { perms: 5000, seed: seed + 200000 });
    const ring = ra.p < 0.05 && rs.p < 0.05 && ra.centre === rs.centre;
    const out = {
      unit: u.label,
      contentWords: u.content,
      ringAlignP: +ra.p.toPrecision(3),
      ringStrictP: +rs.p.toPrecision(3),
      centresAgree: ra.centre === rs.centre,
      ring,
      parallelP: +par.p.toPrecision(3),
      parallelOffsetBlocks: par.offset,
      parallel: par.p < 0.05,
    };
    if (ring || u.label === 'sura 12') {
      const c0 = ra.centre;
      out.centreVerses = Number.isInteger(c0) ? range(u, c0) : `${range(u, Math.floor(c0))} | ${range(u, Math.ceil(c0))}`;
      out.mirrorPairs = ra.pairs.map((p) => ({ verses: `${range(u, p.i)} <-> ${range(u, p.j)}`, similarity: r4(p.similarity) })).sort((x, y) => y.similarity - x.similarity);
    }
    return out;
  });
  console.error('done', c.results.length);
}

// ---------- tests ----------
const C = (n, k) => {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
};
const binomTail = (k, n, p) => {
  let t = 0;
  for (let i = k; i <= n; i++) t += C(n, i) * p ** i * (1 - p) ** (n - i);
  return t;
};
// One-sided Fisher exact: P(X >= a) where a of n1 in group 1 and b of n2 in group 2 are positive.
const fisher = (a, n1, b, n2) => {
  const K = a + b;
  let t = 0;
  for (let x = a; x <= Math.min(n1, K); x++) t += (C(n1, x) * C(n2, K - x)) / C(n1 + n2, K);
  return t;
};
const tally = (rs, key) => rs.filter((r) => r[key]).length;
const q = corpora.quran.results;
const base = [...corpora.hebrewChapters.results, ...corpora.gospelChapters.results];
const summary = (key, rate) => ({
  quran: `${tally(q, key)} of ${q.length}`,
  hebrewChapters: `${tally(corpora.hebrewChapters.results, key)} of ${corpora.hebrewChapters.results.length}`,
  gospelChapters: `${tally(corpora.gospelChapters.results, key)} of ${corpora.gospelChapters.results.length}`,
  quranShare: r4(tally(q, key) / q.length),
  baselineShare: r4(tally(base, key) / base.length),
  falseAlarmRateAssumed: rate,
  pAboveFalseAlarmRate: +binomTail(tally(q, key), q.length, rate).toPrecision(3),
  pQuranAboveBaseline: +fisher(tally(q, key), q.length, tally(base, key), base.length).toPrecision(3),
});
const out = {
  preregistrationSha256: preregHash,
  rings: summary('ring', 0.073),
  parallel: summary('parallel', 0.06),
  sura12: q.find((r) => r.unit === 'sura 12') || 'not eligible',
  quranRingsDetected: q.filter((r) => r.ring),
  quranParallelDetected: q.filter((r) => r.parallel).map((r) => ({ unit: r.unit, p: r.parallelP, offsetBlocks: r.parallelOffsetBlocks })),
  allUnits: { quran: q, hebrewChapters: corpora.hebrewChapters.results, gospelChapters: corpora.gospelChapters.results },
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch12.json'), JSON.stringify(out, null, 2));
const { allUnits, ...brief } = out;
console.log(JSON.stringify(brief, null, 1));
