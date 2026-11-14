// POST HOC check added after seeing batch 5. Not pre-registered.
// The Samuel-Kings-Chronicles result is dominated by formulas whose varying
// word is a king's name. Re-run its local test without proper-name variants.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../src/corpus.mjs';
import { loadOshbBooks } from '../src/hebrew.mjs';
import { buildFrames, phraseTest, bootstrapMean } from '../src/phrase.mjs';

const BOOKS = ['1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr'];
const proper = new Set();
for (const book of BOOKS) {
  const xml = fs.readFileSync(path.join(ROOT_DIR, 'data', 'external', 'oshb', `${book}.xml`), 'utf8');
  for (const w of xml.matchAll(/<w\b([^>]*)>/g)) {
    const lemmaAttr = (w[1].match(/lemma="([^"]*)"/) || [])[1];
    const morphAttr = (w[1].match(/morph="([^"]*)"/) || [])[1];
    if (!lemmaAttr || !morphAttr) continue;
    const lem = lemmaAttr.split('/');
    const mor = morphAttr.slice(1).split('/');
    lem.forEach((part, k) => {
      const id = part.replace(/\+/g, '').trim();
      if (/^\d/.test(id) && (mor[k] || '').startsWith('Np')) proper.add(id);
    });
  }
}
const units = loadOshbBooks(BOOKS).verses.map((v) => ({ doc: v.book, idx: v.idx, tokens: v.lemmas }));
const all = buildFrames(units);
const noNames = all.filter((f) => f.occ.every((o) => !proper.has(o.m)));
const r4 = (x) => +x.toFixed(4);
const t = phraseTest(units, noNames, 'local', { seed: 41, draws: 20000 });
const out = {
  note: 'Post hoc. Added after seeing batch 5 results; no confirmatory weight.',
  allFrames: all.length,
  framesWithoutProperNameVariants: noNames.length,
  local: {
    informativeFrames: t.informativeFrames,
    positive: t.framesPositive,
    negative: t.framesNegative,
    meanExcessPerInformativeFrame: r4(t.totalExcess / Math.max(1, t.informativeFrames)),
    bootstrap95: bootstrapMean(t.excesses, null, { seed: 42 }).map(r4),
    p: +t.p.toPrecision(3),
  },
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch5_posthoc.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
