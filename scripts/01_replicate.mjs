// T0. Rebuild check: reproduce the headline numbers recorded in the
// May 2026 session notes (synthesis.md) with the rebuilt pipeline.
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { findBridges, suraPairWeights } from '../src/ngrams.mjs';

const corpus = loadCorpus();
const { verses, suras } = corpus;
const nWords = verses.reduce((t, v) => t + v.words.length, 0);
const nContent = verses.reduce((t, v) => t + v.roots.length, 0);

const bridges = findBridges(verses, 5);
const { grams, versePairs } = suraPairWeights(bridges);
const bridgedVerses = new Set();
for (const { a, b } of bridges) {
  bridgedVerses.add(a.idx);
  bridgedVerses.add(b.idx);
}

// Twin verses: verse pairs ranked by number of shared exclusive 5-grams.
const twin = new Map();
for (const { a, b } of bridges) {
  const [x, y] = a.idx < b.idx ? [a, b] : [b, a];
  const k = `${x.s}:${x.v} <-> ${y.s}:${y.v}`;
  twin.set(k, (twin.get(k) || 0) + 1);
}
const topTwins = [...twin].sort((p, q) => q[1] - p[1]).slice(0, 12);

const w = (a, b) => grams.get(`${a}-${b}`) || 0;
const out = {
  suras: suras.size,
  verses: verses.length,
  words: nWords,
  contentWords: nContent,
  bridging5grams: bridges.length,
  suraPairsWithBridge: grams.size,
  shareOfAllSuraPairs: +(grams.size / ((114 * 113) / 2)).toFixed(4),
  versesWithBridge: bridgedVerses.size,
  topTwinVerses: topTwins,
  kahfPartners: { '10-18': w(10, 18), '17-18': w(17, 18), '18-19': w(18, 19), '16-21': w(16, 21) },
  bridge_18_46__19_76: twin.get('18:46 <-> 19:76') || 0,
  bridge_10_24__18_45: twin.get('10:24 <-> 18:45') || 0,
  distinctBridgedVersePairs: [...versePairs.values()].reduce((t, x) => t + x, 0),
};
console.log(JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'T0_replication.json'), JSON.stringify(out, null, 2));
