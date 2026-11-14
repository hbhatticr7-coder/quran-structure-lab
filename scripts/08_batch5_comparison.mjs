// Batch 5: is the Quran's local fit unusual? As specified in PREREGISTRATION_batch5.md.
// Pass --check to run only the code check (reproduce batch 4) and loader counts.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadGospels } from '../src/greek.mjs';
import { loadOshbBooks } from '../src/hebrew.mjs';
import { buildFrames, phraseTest, bootstrapMean } from '../src/phrase.mjs';

const r4 = (x) => +x.toFixed(4);
const quran = loadCorpus();
const quranRoots = quran.verses.map((v) => ({ doc: v.s, idx: v.idx, tokens: v.roots, ref: `${v.s}:${v.v}` }));
const quranLemmas = quran.verses.map((v) => ({ doc: v.s, idx: v.idx, tokens: v.lemmas, ref: `${v.s}:${v.v}` }));
const gospels = loadGospels().verses.map((v) => ({ doc: v.book, idx: v.idx, tokens: v.lemmas, ref: `${v.book} ${v.ch}:${v.v}` }));
const kings = loadOshbBooks(['1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr']).verses.map((v) => ({
  doc: v.book,
  idx: v.idx,
  tokens: v.lemmas,
  ref: `${v.book} ${v.ch}:${v.v}`,
}));

// ---------- code check: the general function must reproduce batch 4 ----------
const b4 = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'results', 'batch4.json'), 'utf8')).amendmentA1_phraseLevel;
const rootFrames = buildFrames(quranRoots);
function reproduce(draws) {
  const got = {
    wholeSura: phraseTest(quranRoots, rootFrames, 'doc', { seed: 20261117, draws }),
    strictContext: phraseTest(quranRoots, rootFrames, 'strict', { seed: 20261118, draws }),
    localContext: phraseTest(quranRoots, rootFrames, 'local', { seed: 20261119, draws }),
  };
  for (const k of Object.keys(got)) {
    assert.equal(got[k].frames, b4[k].frames, `${k}: frame count`);
    assert.equal(r4(got[k].totalExcess), b4[k].totalExcess, `${k}: total excess`);
    assert.equal(got[k].framesPositive, b4[k].framesPositive, `${k}: positives`);
  }
  return got;
}

if (process.argv.includes('--check')) {
  reproduce(200);
  const stats = (units) => ({
    verses: units.length,
    contentWords: units.reduce((t, u) => t + u.tokens.length, 0),
    distinctLemmas: new Set(units.flatMap((u) => u.tokens)).size,
    documents: new Set(units.map((u) => u.doc)).size,
    meanContentWordsPerVerse: r4(units.reduce((t, u) => t + u.tokens.length, 0) / units.length),
  });
  const mt = gospels.find((u) => u.ref === 'Mt 3:7');
  const ch = kings.find((u) => u.ref === '1Chr 10:1');
  console.log(JSON.stringify({
    batch4Reproduced: true,
    quranLemmaLevel: stats(quranLemmas),
    gospels: stats(gospels),
    samuelKingsChronicles: stats(kings),
    sample_Mt_3_7: mt.tokens,
    sample_1Chr_10_1: ch.tokens,
    usableFrames: { quranRoots: rootFrames.length, quranLemmas: buildFrames(quranLemmas).length, gospels: buildFrames(gospels).length, samuelKingsChronicles: buildFrames(kings).length },
  }, null, 2));
  process.exit(0);
}

// ---------- full run ----------
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch5.md'))).digest('hex');
const DRAWS = 100000;
const SEED = 20261118;
const rootRun = reproduce(DRAWS);

function analyse(units, label, seedBase) {
  const frames = buildFrames(units);
  const res = {};
  let k = 0;
  for (const ctx of ['local', 'doc', 'strict']) {
    const t = phraseTest(units, frames, ctx, { seed: seedBase + k++, draws: DRAWS });
    const ci = t.excesses.length ? bootstrapMean(t.excesses, null, { seed: 20261119 + k }) : [NaN, NaN];
    res[ctx] = {
      frames: t.frames,
      informativeFrames: t.informativeFrames,
      positive: t.framesPositive,
      negative: t.framesNegative,
      meanExcessPerInformativeFrame: r4(t.totalExcess / Math.max(1, t.informativeFrames)),
      bootstrap95: ci.map(r4),
      p: +t.p.toPrecision(3),
      _excesses: t.excesses,
      _mats: t.mats,
    };
  }
  console.error(`${label} done`);
  return res;
}
const Q = analyse(quranLemmas, 'quran lemmas', SEED);
const G = analyse(gospels, 'gospels', SEED + 10);
const K = analyse(kings, 'samuel-kings-chronicles', SEED + 20);

const diff = (a, b, seed) => bootstrapMean(a.local._excesses, b.local._excesses, { seed }).map(r4);
const examples = (units, res, n) =>
  res.local._mats
    .map((m) => ({ excess: r4(m.excess), frame: m.f.key, occurrences: m.f.occ.map((o) => `${units[o.idx].ref} ${o.m}`) }))
    .sort((x, y) => y.excess - x.excess)
    .slice(0, n);
const strip = (res) => Object.fromEntries(Object.entries(res).map(([k, { _excesses, _mats, ...rest }]) => [k, rest]));
const fmtRoot = (t) => ({
  frames: t.frames,
  informativeFrames: t.informativeFrames,
  positive: t.framesPositive,
  negative: t.framesNegative,
  meanExcessPerInformativeFrame: r4(t.totalExcess / Math.max(1, t.informativeFrames)),
  p: +t.p.toPrecision(3),
});

const out = {
  preregistrationSha256: preregHash,
  draws: DRAWS,
  quran_rootLevel_batch4Reproduced: { local: fmtRoot(rootRun.localContext), doc: fmtRoot(rootRun.wholeSura), strict: fmtRoot(rootRun.strictContext) },
  quran_lemmaLevel: strip(Q),
  gospels: strip(G),
  samuelKingsChronicles: strip(K),
  localExcessDifference_bootstrap95: {
    quranMinusGospels: diff(Q, G, 20261130),
    quranMinusSamuelKingsChronicles: diff(Q, K, 20261131),
  },
  topLocalExamples: { gospels: examples(gospels, G, 8), samuelKingsChronicles: examples(kings, K, 8), quranLemmaLevel: examples(quranLemmas, Q, 8) },
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch5.json'), JSON.stringify(out, null, 2));
const { topLocalExamples, ...brief } = out;
console.log(JSON.stringify(brief, null, 2));
