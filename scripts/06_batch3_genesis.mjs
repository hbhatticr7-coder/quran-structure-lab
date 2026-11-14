// Batch 3: Yusuf against Genesis, exactly as specified in PREREGISTRATION_batch3.md.
// Pass --check to print loader counts only (format check, no analysis).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, range, ROOT_DIR } from '../src/corpus.mjs';
import { loadGenesis, genesisRange } from '../src/hebrew.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { ringTest } from '../src/ring.mjs';

const gen = loadGenesis();
if (process.argv.includes('--check')) {
  const v = gen.verses.find((x) => x.ch === 37 && x.v === 5);
  console.log(JSON.stringify({
    verses: gen.verses.length,
    words: gen.verses.reduce((t, x) => t + x.words, 0),
    contentLemmas: gen.verses.reduce((t, x) => t + x.lemmas.length, 0),
    distinctLemmas: new Set(gen.verses.flatMap((x) => x.lemmas)).size,
    chapters: new Set(gen.verses.map((x) => x.ch)).size,
    sample_37_5: v.lemmas,
    versesIn37to50: gen.verses.filter((x) => x.ch >= 37).length,
  }, null, 2));
  process.exit(0);
}

const registry = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'claims', 'registry.json'), 'utf8'));
const claim = (id) => registry.claims.find((c) => c.id === id);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch3.md'))).digest('hex');
assert.equal(gen.verses.length, 1533);
const r4 = (x) => +x.toFixed(4);
const lem = (vs) => vs.flatMap((x) => x.lemmas);

const idfGen = idfTable(gen.verses.map((x) => x.lemmas));

// ---------- G0: validation on the wife-sister doublet ----------
function g0() {
  const A = genesisRange(gen, '12:10-12:20');
  const B = genesisRange(gen, '20:1-20:18');
  const C = genesisRange(gen, '26:1-26:11');
  const blocked = new Set([...A, ...B, ...C].map((x) => x.idx));
  const vA = vector(lem(A), idfGen);
  const target = cosine(vA, vector(lem(B), idfGen));
  const sims = [];
  for (let start = 0; start + 18 <= gen.verses.length; start++) {
    const win = gen.verses.slice(start, start + 18);
    if (win.some((x) => blocked.has(x.idx))) continue;
    sims.push(cosine(vA, vector(lem(win), idfGen)));
  }
  const below = sims.filter((x) => x < target).length;
  return {
    similarity_12_10_20__20_1_18: r4(target),
    comparisonWindows: sims.length,
    medianWindowSimilarity: r4(sims.slice().sort((a, b) => a - b)[Math.floor(sims.length / 2)]),
    maxWindowSimilarity: r4(Math.max(...sims)),
    percentile: r4(below / sims.length),
    passed: below / sims.length >= 0.95,
  };
}

// ---------- ring tests ----------
function genesisRing(id, idf, overrides = {}) {
  const c = claim(id);
  const sections = c.sections.map(([name, spec]) => [name, lem(genesisRange(gen, overrides[name] || spec))]);
  return { id, ...ringTest({ sections, mirrorPairs: c.mirrorPairs, idf }) };
}

const G0 = g0();
const G1 = genesisRing('rendsburg-ring-genesis-joseph', idfGen);
const idfJoseph = idfTable(gen.verses.filter((x) => x.ch >= 37).map((x) => x.lemmas));
const G1_localIdf = genesisRing('rendsburg-ring-genesis-joseph', idfJoseph);
const G2 = genesisRing('genesis-plot-aligned', idfGen);
const G2_withGenealogy = genesisRing('genesis-plot-aligned', idfGen, { "a'": '46:1-47:12' });

const quran = loadCorpus();
const idfQuran = idfTable(quran.verses.map((x) => x.lemmas));
const yc = claim('yusuf-reduced');
const G3 = {
  id: 'yusuf-reduced',
  ...ringTest({
    sections: yc.sections.map(([name, from, to]) => [name, lemmasOf(range(quran, 12, from, to))]),
    mirrorPairs: yc.mirrorPairs,
    idf: idfQuran,
  }),
};
const batch1 = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'results', 'batch1.json'), 'utf8'));
const yusufFull = batch1.T4_rings.perSura.find((x) => x.sura === 12);

const out = {
  preregistrationSha256: preregHash,
  G0_validation: G0,
  G1_rendsburg_primary: G1,
  G1_secondary_idfOverJosephStoryOnly: G1_localIdf,
  G2_quranicPlanAppliedToGenesis: G2,
  G2_secondary_withGenealogy: G2_withGenealogy,
  G3_yusufSameSixSectionDesign: G3,
  reference_yusufFull_fromBatch1: { rankAmongPairings: yusufFull.rankAmongPairings, exactP: yusufFull.exactP, z: yusufFull.z },
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch3.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
