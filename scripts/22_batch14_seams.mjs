// Batch 14: the seams between suras, exactly as specified in PREREGISTRATION_batch14.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { idfTable, vector, cosine } from '../src/similarity.mjs';
import { rng, mean } from '../src/stats.mjs';

const N = 114;
const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch14.md'))).digest('hex');
const corpus = loadCorpus();
const idfRoot = idfTable(corpus.verses.map((v) => v.roots));
const idfLemma = idfTable(corpus.verses.map((v) => v.lemmas));

// Windows: the fewest verses from one end that hold at least `size` content words.
function byWords(vs, size, fromEnd) {
  const seq = fromEnd ? vs.slice().reverse() : vs;
  const out = [];
  let n = 0;
  for (const v of seq) {
    out.push(v);
    n += v.roots.length;
    if (n >= size) break;
  }
  return fromEnd ? out.reverse() : out;
}
const byVerses = (vs, k, fromEnd) => (fromEnd ? vs.slice(-k) : vs.slice(0, k));
const span = (w) => (w[0].v === w[w.length - 1].v ? `${w[0].v}` : `${w[0].v}-${w[w.length - 1].v}`);

function build({ size = 40, verses = 0, unit = 'roots' } = {}) {
  const idf = unit === 'roots' ? idfRoot : idfLemma;
  const win = [];
  for (let s = 1; s <= N; s++) {
    const vs = corpus.suras.get(s);
    const open = verses ? byVerses(vs, verses, false) : byWords(vs, size, false);
    const close = verses ? byVerses(vs, verses, true) : byWords(vs, size, true);
    const vec = (w) => vector(w.flatMap((v) => v[unit]), idf);
    win[s] = { open, close, vOpen: vec(open), vClose: vec(close) };
  }
  return win;
}

function s1(win, seed) {
  const diffs = [];
  for (let s = 1; s < N; s++) diffs.push(cosine(win[s].vClose, win[s + 1].vOpen) - cosine(win[s].vOpen, win[s + 1].vClose));
  const obs = mean(diffs);
  const rand = rng(seed);
  let ge = 0;
  const DRAWS = 100000;
  for (let d = 0; d < DRAWS; d++) {
    let t = 0;
    for (const x of diffs) t += rand() < 0.5 ? x : -x;
    if (t / diffs.length >= obs - 1e-12) ge++;
  }
  const seam = [];
  const rev = [];
  for (let s = 1; s < N; s++) {
    seam.push(cosine(win[s].vClose, win[s + 1].vOpen));
    rev.push(cosine(win[s].vOpen, win[s + 1].vClose));
  }
  return {
    meanSeamSimilarity: r4(mean(seam)),
    meanReverseSimilarity: r4(mean(rev)),
    meanDifference: r4(obs),
    seamHigher: diffs.filter((x) => x > 1e-12).length,
    reverseHigher: diffs.filter((x) => x < -1e-12).length,
    equal: diffs.filter((x) => Math.abs(x) <= 1e-12).length,
    p: +((ge + 1) / (DRAWS + 1)).toPrecision(3),
  };
}

const main = build();
const S1 = s1(main, 20261200);
const secondary = {
  window20: s1(build({ size: 20 }), 20261201),
  window80: s1(build({ size: 80 }), 20261202),
  threeVerses: s1(build({ verses: 3 }), 20261203),
  lemmas: s1(build({ unit: 'lemmas' }), 20261204),
};

// How specific is the link to the next sura?
function percentileOfNext(win, gap) {
  const out = [];
  for (let s = 1; s + gap <= N; s++) {
    const target = cosine(win[s].vClose, win[s + gap].vOpen);
    let below = 0;
    let tie = 0;
    let n = 0;
    for (let m = 1; m <= N; m++) {
      if (m === s || m === s + gap) continue;
      const x = cosine(win[s].vClose, win[m].vOpen);
      n++;
      if (x < target - 1e-12) below++;
      else if (Math.abs(x - target) <= 1e-12) tie++;
    }
    out.push((below + tie / 2) / n);
  }
  return out;
}
const pctNext = percentileOfNext(main, 1);
const pctSkip = percentileOfNext(main, 2);

// ---------- the map ----------
const firstLemma = (w, root) => {
  for (const v of w) for (const x of v.words) if (x.root === root) return x.lemma || root;
  return root;
};
const seams = [];
for (let s = 1; s < N; s++) {
  const a = main[s].close;
  const b = main[s + 1].open;
  const ra = new Set(a.flatMap((v) => v.roots));
  const rb = new Set(b.flatMap((v) => v.roots));
  const shared = [...ra].filter((r) => rb.has(r)).map((r) => ({ root: r, weight: r4(idfRoot.get(r) || 0), inClose: firstLemma(a, r), inOpening: firstLemma(b, r) })).sort((x, y) => y.weight - x.weight);
  seams.push({
    seam: `${s}-${s + 1}`,
    closeVerses: `${s}:${span(a)}`,
    openingVerses: `${s + 1}:${span(b)}`,
    similarity: r4(cosine(main[s].vClose, main[s + 1].vOpen)),
    reverse: r4(cosine(main[s].vOpen, main[s + 1].vClose)),
    percentileAmongAllOpenings: r4(pctNext[s - 1]),
    sharedRoots: shared.length,
    strongestSharedRoots: shared.slice(0, 6),
  });
}
const ranked = seams.slice().sort((x, y) => y.similarity - x.similarity);
ranked.forEach((x, i) => (x.rank = i + 1));
const farrinEight = ['2-3', '4-5', '12-13', '22-23', '27-28', '38-39', '54-55', '101-102'].map((k) => {
  const x = seams.find((q) => q.seam === k);
  return { seam: k, rank: `${x.rank} of 113`, similarity: x.similarity, percentile: x.percentileAmongAllOpenings };
});

const out = {
  preregistrationSha256: preregHash,
  S1_primary_40words_roots: S1,
  secondary,
  specificity: {
    chance: 0.5,
    meanPercentileOfNextSurasOpening: r4(mean(pctNext)),
    meanPercentileOfSuraAfterNext: r4(mean(pctSkip)),
    seamsAbove90thPercentile: pctNext.filter((x) => x >= 0.9).length,
    seamsBelow50thPercentile: pctNext.filter((x) => x < 0.5).length,
  },
  seamsWithNoSharedRoot: seams.filter((x) => x.sharedRoots === 0).map((x) => x.seam),
  farrinsEightBoundaryClaims: farrinEight,
  strongest12: ranked.slice(0, 12).map((x) => ({ seam: x.seam, close: x.closeVerses, opening: x.openingVerses, similarity: x.similarity, reverse: x.reverse, percentile: x.percentileAmongAllOpenings, shared: x.strongestSharedRoots.slice(0, 4).map((r) => `${r.inClose} / ${r.inOpening}`) })),
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch14.json'), JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'seam_map.json'), JSON.stringify(seams, null, 1));

// Readable map.
const md = [
  '# The seams between suras',
  '',
  'Every boundary between two neighbouring suras: the close of the first and the opening of the second, and the word-families they share.',
  'Built by `scripts/22_batch14_seams.mjs` under the rules in `PREREGISTRATION_batch14.md`. See `RESULTS.md`, batch 14, for the test and its limits.',
  '',
  '- **Similarity**: weighted overlap of roots between the two windows (0 to 1).',
  '- **Reverse**: the same two suras the other way round (opening of the first, close of the second).',
  '- **Percentile**: where the next sura\'s opening ranks among all other suras\' openings as a match for this close (0.50 is chance).',
  '- **Shared word-families**: the rarest shared roots, shown as the word in the close / the word in the opening. A shared root is a candidate link; whether it is a meaningful one is for a reader to judge.',
  '',
  '| Seam | Close | Opening | Similarity | Reverse | Percentile | Shared word-families (rarest first) |',
  '|---|---|---|---|---|---|---|',
  ...seams.map((x) => `| ${x.seam} | ${x.closeVerses} | ${x.openingVerses} | ${x.similarity.toFixed(3)} | ${x.reverse.toFixed(3)} | ${x.percentileAmongAllOpenings.toFixed(2)} | ${x.strongestSharedRoots.slice(0, 5).map((r) => (r.inClose === r.inOpening ? r.inClose : `${r.inClose} / ${r.inOpening}`)).join('، ') || 'none'} |`),
  '',
];
fs.writeFileSync(path.join(ROOT_DIR, 'SEAMS.md'), md.join('\n'));
console.log(JSON.stringify(out, null, 1));
