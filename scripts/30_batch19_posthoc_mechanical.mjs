// POST HOC, added after the blindness check failed. Not pre-registered.
// A judge-free version of the batch 19 question. For each seam, the same five
// candidate openings as the judges saw are ranked mechanically, two ways:
//   (a) by overlap of wording between the English gists (written independently
//       for closes and for openings by readers who saw only one side);
//   (b) by overlap of Arabic roots between the passages themselves.
// No reader's memory of the Quran's order can enter either ranking.
// Usage: node scripts/30_batch19_posthoc_mechanical.mjs <path-to-key.json>
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { idfTable, vector, cosine } from '../src/similarity.mjs';
import { rng, mean } from '../src/stats.mjs';

const store = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const dir = path.join(ROOT_DIR, 'reading');
const r4 = (x) => +x.toFixed(4);
const gists = {};
for (const f of ['gists_closes_1.json', 'gists_closes_2.json', 'gists_openings_1.json', 'gists_openings_2.json']) Object.assign(gists, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

const STOP = new Set('a an the and or but of to in on at by for with from as is are was were be been being it its this that these those who whom whose which what when where why how not no nor so than then there their them they he she his her him you your we our us i me my will would shall should can could may might must do does did done has have had if while into over under up down out off about after before again all any each every some such only own same too very also just more most other another one two three'.split(' '));
const stem = (w) => w.replace(/(ings?|ed|es|s)$/u, '');
const tokens = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^['-]+|['-]+$/g, ''))
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map(stem);

const closeTok = [];
const openTok = [];
for (const [code, k] of Object.entries(store.key)) (k.kind === 'close' ? closeTok : openTok)[k.sura] = tokens(gists[code]);
const gistIdf = idfTable([...closeTok.slice(1), ...openTok.slice(1)]);
const gClose = closeTok.map((t) => (t ? vector(t, gistIdf) : null));
const gOpen = openTok.map((t) => (t ? vector(t, gistIdf) : null));

const corpus = loadCorpus();
const rootIdf = idfTable(corpus.verses.map((v) => v.roots));
const win = (vs, fromEnd) => {
  const seq = fromEnd ? vs.slice().reverse() : vs;
  const out = [];
  let n = 0;
  for (const v of seq) {
    out.push(v);
    n += v.roots.length;
    if (n >= 40) break;
  }
  return out;
};
const aClose = [];
const aOpen = [];
for (let s = 1; s <= 114; s++) {
  const vs = corpus.suras.get(s);
  aClose[s] = vector(win(vs, true).flatMap((v) => v.roots), rootIdf);
  aOpen[s] = vector(win(vs, false).flatMap((v) => v.roots), rootIdf);
}

const items = Object.entries(store.items).filter(([id]) => id.startsWith('S')).map(([, it]) => it);
function evaluate(closeVec, openVec, seed) {
  // rank of the true opening among the five options, ties sharing the average rank
  const ranks = items.map((it) => {
    const sims = it.options.map((s) => cosine(closeVec[it.sura], openVec[s]));
    const t = sims[it.options.indexOf(it.sura + 1)];
    const higher = sims.filter((x) => x > t + 1e-12).length;
    const ties = sims.filter((x) => Math.abs(x - t) <= 1e-12).length;
    return higher + (ties + 1) / 2;
  });
  const obs = mean(ranks);
  const rand = rng(seed);
  let le = 0;
  const DRAWS = 100000;
  for (let d = 0; d < DRAWS; d++) {
    let t = 0;
    for (let i = 0; i < ranks.length; i++) t += 1 + Math.floor(rand() * 5);
    if (t / ranks.length <= obs + 1e-12) le++;
  }
  return { seams: ranks.length, meanRankOfTrueOpening: r4(obs), chance: 3, rankedFirst: ranks.filter((r) => r === 1).length, p: +((le + 1) / (DRAWS + 1)).toPrecision(3), _ranks: ranks };
}
const g = evaluate(gClose, gOpen, 501);
const a = evaluate(aClose, aOpen, 502);
const firstByGist = items.filter((_, i) => g._ranks[i] === 1).map((it) => `${it.sura}-${it.sura + 1}`).sort((x, y) => parseInt(x) - parseInt(y));
const strip = ({ _ranks, ...rest }) => rest;
const out = {
  note: 'Post hoc. Added after the blindness check failed; no confirmatory weight.',
  byGistWording: strip(g),
  byArabicRoots: strip(a),
  seamsRankedFirstByGistWording: firstByGist,
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch19_posthoc.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
