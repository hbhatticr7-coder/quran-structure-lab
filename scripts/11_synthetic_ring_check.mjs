// Validation of the outline-free ring detector on synthetic texts.
// No real text is used. For each kind of planted structure, how often does the
// detector report p < 0.05?  Rings should be found; everything else should
// stay near 5%.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../src/corpus.mjs';
import { idfTable } from '../src/similarity.mjs';
import { similarityMatrix, detectRing, detectParallel } from '../src/concentric.mjs';
import { rng } from '../src/stats.mjs';

const rand = rng(99);
const V = 1500;
const cum = [];
{
  let t = 0;
  for (let r = 0; r < V; r++) cum.push((t += 1 / (r + 5)));
}
const background = () => {
  const x = rand() * cum[V - 1];
  let lo = 0;
  let hi = V - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};
const NTOPICS = 200;
const topicWords = Array.from({ length: NTOPICS }, () => Array.from({ length: 40 }, () => 100 + Math.floor(rand() * (V - 100))));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
// A block of 40 tokens: half background, half from its topic mix.
const block = (topics) => ({
  tokens: Array.from({ length: 40 }, () => (rand() < 0.5 ? background() : pick(topicWords[pick(topics)]))),
});
const idf = idfTable(Array.from({ length: 4000 }, () => block([Math.floor(rand() * NTOPICS)]).tokens.slice(0, 8)));

const fresh = (() => {
  let n = 0;
  return () => n++ % NTOPICS;
})();
// Each structure returns, per block, the list of topics it mixes.
const structures = {
  'no structure (12 unrelated blocks)': () => Array.from({ length: 12 }, () => [fresh()]),
  'ring, centre in the middle': () => {
    const t = Array.from({ length: 6 }, fresh);
    return [0, 1, 2, 3, 4, 5, 5, 4, 3, 2, 1, 0].map((k) => [t[k]]);
  },
  'ring, weak (mirror blocks share half their topic)': () => {
    const t = Array.from({ length: 6 }, fresh);
    return [0, 1, 2, 3, 4, 5, 5, 4, 3, 2, 1, 0].map((k) => [t[k], fresh()]);
  },
  'ring, centre off the middle': () => {
    const t = Array.from({ length: 5 }, fresh);
    return [...[0, 1, 2, 3, 4, 4, 3, 2, 1, 0].map((k) => [t[k]]), [fresh()], [fresh()]];
  },
  'two halves on different subjects': () => {
    const [a, b] = [fresh(), fresh()];
    return [...Array(6).fill([a]), ...Array(6).fill([b])];
  },
  'one long section then a short one (9 + 3)': () => {
    const [a, b] = [fresh(), fresh()];
    return [...Array(9).fill([a]), ...Array(3).fill([b])];
  },
  'three sections of four blocks': () => {
    const [a, b, c] = [fresh(), fresh(), fresh()];
    return [...Array(4).fill([a]), ...Array(4).fill([b]), ...Array(4).fill([c])];
  },
  'gradual drift of subject': () => {
    const t = Array.from({ length: 7 }, fresh);
    return Array.from({ length: 12 }, (_, k) => [t[Math.floor(k / 2)], t[Math.floor(k / 2) + 1]]);
  },
  'frame only (first and last block match)': () => {
    const a = fresh();
    return [[a], ...Array.from({ length: 10 }, () => [fresh()]), [a]];
  },
  'parallel (A B C D E F A B C D E F)': () => {
    const t = Array.from({ length: 6 }, fresh);
    return [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5].map((k) => [t[k]]);
  },
};

const SIMS = 300;
const out = {};
for (const [name, make] of Object.entries(structures)) {
  const hits = { align: 0, strict: 0, alignWithGuard: 0, both: 0, parallel: 0 };
  for (let s = 0; s < SIMS; s++) {
    const S = similarityMatrix(make().map(block), idf);
    const ra = detectRing(S, { mode: 'align', perms: 1000, seed: 1000 + s });
    const rs = detectRing(S, { mode: 'strict', perms: 1000, seed: 5000 + s });
    if (ra.p < 0.05) hits.align++;
    if (ra.p < 0.05 && ra.guard.passes) hits.alignWithGuard++;
    if (rs.p < 0.05) hits.strict++;
    if (ra.p < 0.05 && rs.p < 0.05 && ra.centre === rs.centre) hits.both++;
    if (detectParallel(S, { perms: 1000, seed: 9000 + s }).p < 0.05) hits.parallel++;
  }
  out[name] = { align: +(hits.align / SIMS).toFixed(3), alignWithGuard: +(hits.alignWithGuard / SIMS).toFixed(3), strict: +(hits.strict / SIMS).toFixed(3), bothSameCentre: +(hits.both / SIMS).toFixed(3), parallel: +(hits.parallel / SIMS).toFixed(3) };
  console.error(name, JSON.stringify(out[name]));
}
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'synthetic_ring_check.json'), JSON.stringify({ sims: SIMS, shareDetectedAtP05: out }, null, 2));
console.log(JSON.stringify(out, null, 2));
