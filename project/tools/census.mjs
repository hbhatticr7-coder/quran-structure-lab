// The census: writes the choice problems (defined on the build suras; see
// problems.mjs) to project/sites/, and a summary to project/CENSUS.md.
// Makes the split of the suras if it does not exist yet (it never changes after).
//
// Usage: node project/tools/census.mjs
import fs from 'node:fs';
import path from 'node:path';
import { loadWords } from '../../src/words.mjs';
import { rng } from '../../src/stats.mjs';
import { lcsAlign } from '../../src/twins.mjs';
import { makeProblems, loadSynonymSets, OTHER, CENSUS_VERSION } from './problems.mjs';
import { PROJECT_DIR, SITES_DIR, TYPES } from './lib.mjs';

const corpus = loadWords();
const { verses } = corpus;
fs.mkdirSync(SITES_DIR, { recursive: true });

// ---------- the split (made once, then never changed) ----------
const splitFile = path.join(PROJECT_DIR, 'split.json');
if (!fs.existsSync(splitFile)) {
  const words = [];
  for (const [s, vs] of corpus.bySura) words[s] = vs.reduce((t, v) => t + v.words.length, 0);
  const order = [...corpus.bySura.keys()].sort((a, b) => words[b] - words[a]);
  const rand = rng(20261117);
  const split = { note: 'Suras sorted by length and dealt out in fours: two to build, one to test, one to vault, at random (seed 20261117). The last two go to build. Never regenerate.', build: [], test: [], vault: [] };
  for (let i = 0; i < order.length; i += 4) {
    const group = order.slice(i, i + 4);
    if (group.length < 4) {
      split.build.push(...group);
      continue;
    }
    for (let k = 3; k > 0; k--) {
      const j = Math.floor(rand() * (k + 1));
      [group[k], group[j]] = [group[j], group[k]];
    }
    split.build.push(group[0], group[1]);
    split.test.push(group[2]);
    split.vault.push(group[3]);
  }
  for (const k of ['build', 'test', 'vault']) split[k].sort((a, b) => a - b);
  split.words = Object.fromEntries(['build', 'test', 'vault'].map((k) => [k, split[k].reduce((t, s) => t + words[s], 0)]));
  fs.writeFileSync(splitFile, JSON.stringify(split, null, 1));
}
const split = JSON.parse(fs.readFileSync(splitFile, 'utf8'));
const partOf = [];
for (const k of ['build', 'test', 'vault']) for (const s of split[k]) partOf[s] = k;

// ---------- the problems ----------
const sets = loadSynonymSets();
const problems = makeProblems(corpus, new Set(split.build), sets);
const num = (x) => x.toLocaleString('en');
const rows = [];
for (const type of TYPES) {
  const list = problems.filter((p) => p.type === type).sort((a, b) => b.occurrences.length - a.occurrences.length || (a.id < b.id ? -1 : 1));
  fs.writeFileSync(path.join(SITES_DIR, `${type}.json`), JSON.stringify({ censusVersion: CENSUS_VERSION, type, problems: list }));
  const occ = list.flatMap((p) => p.occurrences);
  const n = (part, other) => occ.filter((o) => partOf[o.s] === part && (o.chosen === OTHER) === other).length;
  rows.push({ type, problems: list.length, build: n('build', false), test: n('test', false), vault: n('vault', false), otherTest: n('test', true), otherVault: n('vault', true) });
}
const tot = rows.reduce((t, r) => Object.fromEntries(Object.keys(t).map((k) => [k, t[k] + r[k]])), { problems: 0, build: 0, test: 0, vault: 0, otherTest: 0, otherVault: 0 });

// ---------- near-identical verses (counted, not yet turned into problems) ----------
const byBigram = new Map();
verses.forEach((v) => {
  const t = v.words.map((w) => w.token);
  const seen = new Set();
  for (let i = 0; i + 1 < t.length; i++) {
    const g = `${t[i]} ${t[i + 1]}`;
    if (seen.has(g)) continue;
    seen.add(g);
    if (!byBigram.has(g)) byBigram.set(g, []);
    byBigram.get(g).push(v.idx);
  }
});
const done = new Set();
const twins = { pairs: 0, identical: 0, oneWordSwapped: 0, wordsAddedOrLeftOut: 0, other: 0 };
for (const list of byBigram.values()) {
  if (list.length > 400) continue; // a pair of very common words; such verses meet through rarer pairs
  for (let x = 0; x < list.length; x++)
    for (let y = x + 1; y < list.length; y++) {
      const key = list[x] * 10000 + list[y];
      if (done.has(key)) continue;
      done.add(key);
      const A = verses[list[x]].words.map((w) => w.token);
      const B = verses[list[y]].words.map((w) => w.token);
      const longer = Math.max(A.length, B.length);
      if (Math.min(A.length, B.length) < 4 || Math.min(A.length, B.length) / longer < 0.7) continue;
      const m = lcsAlign(A, B);
      if (m.length < 4 || m.length / longer < 0.7) continue;
      twins.pairs++;
      if (m.length === A.length && m.length === B.length) {
        twins.identical++;
        continue;
      }
      let swaps = 0;
      let adds = 0;
      let other = 0;
      const pts = [[-1, -1], ...m, [A.length, B.length]];
      for (let k = 0; k + 1 < pts.length; k++) {
        const da = pts[k + 1][0] - pts[k][0] - 1;
        const db = pts[k + 1][1] - pts[k][1] - 1;
        if (da === 0 && db === 0) continue;
        if (da === 1 && db === 1) swaps++;
        else if (da === 0 || db === 0) adds++;
        else other++;
      }
      if (swaps) twins.oneWordSwapped++;
      if (adds) twins.wordsAddedOrLeftOut++;
      if (other) twins.other++;
    }
}

// ---------- write ----------
const WHAT = {
  frame: 'A word slot with the same three words before and after it, filled by different words in different places',
  synonym: `An occurrence of a word from ${sets.length} listed sets of near-synonyms`,
  ending: 'A verse closed by a pair of words: given the first, which word closes it',
  order: 'Two nouns joined by "and" that occur in both orders',
};
const md = [
  '# Census of choice sites',
  '',
  `Written by \`project/tools/census.mjs\` (census version ${CENSUS_VERSION}). Do not edit by hand.`,
  '',
  'A *problem* is one kind of choice (one phrase frame, one set of synonyms). A *choice* is one place in the text where it is made.',
  '',
  '**Problems and their options are defined from the build suras only.** The test and vault suras play no part in deciding what counts as a problem. Where a test or vault sura uses a word that the build suras never show in that slot, the place is counted in the last two columns and is not scored.',
  '',
  '| Type | What it is | Problems | Choices in build suras | In test suras | In vault suras | Test: word not among the options | Vault: same |',
  '|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.type} | ${WHAT[r.type]} | ${num(r.problems)} | ${num(r.build)} | ${num(r.test)} | ${num(r.vault)} | ${num(r.otherTest)} | ${num(r.otherVault)} |`),
  `| **all** | | ${num(tot.problems)} | ${num(tot.build)} | ${num(tot.test)} | ${num(tot.vault)} | ${num(tot.otherTest)} | ${num(tot.otherVault)} |`,
  '',
  `The split: ${split.build.length} build suras (${num(split.words.build)} words), ${split.test.length} test suras (${num(split.words.test)}), ${split.vault.length} vault suras (${num(split.words.vault)}).`,
  '',
  '## Not yet turned into problems',
  '',
  `- **Near-identical verses.** ${num(twins.pairs)} pairs of verses share at least 70% of their words in order. ${num(twins.identical)} are word-for-word identical; ${num(twins.oneWordSwapped)} differ by a swapped word; ${num(twins.wordsAddedOrLeftOut)} by words added or left out; ${num(twins.other)} in a longer stretch. (A pair can fall in more than one group.) Added and omitted words are not yet covered.`,
  '- **Choices of form.** Singular or plural, verb form, definite or indefinite, which particle is attached. Words are compared by dictionary form here, so these are not counted.',
  '- **What each telling of a story includes.** See batch 16.',
  '',
  '## Why version 2',
  '',
  'Version 1 defined problems from the whole text. A phrase frame counted only if its word varied somewhere, so a frame seen once in the build suras and once in the test suras was certain to differ there, and the baseline was certain to be wrong on it. That made any rule look better against the baseline than it was. Version 2 removes this by defining problems from the build suras alone.',
  '',
];
fs.writeFileSync(path.join(PROJECT_DIR, 'CENSUS.md'), md.join('\n'));
console.log(JSON.stringify({ rows, total: tot }, null, 1));
