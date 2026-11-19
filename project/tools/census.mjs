// The census: writes the choice problems (defined on the build suras; see
// problems.mjs) to project/sites/, and a summary to project/CENSUS.md.
//
// The vault suras are never loaded here. The files in project/sites/ hold the
// build suras' occurrences only, so anyone may open them. The test suras
// contribute counts to the summary and nothing else.
//
// Usage: node project/tools/census.mjs
import fs from 'node:fs';
import path from 'node:path';
import { lcsAlign } from '../../src/twins.mjs';
import { loadSynonymSets, OTHER, CENSUS_VERSION } from './problems.mjs';
import { PROJECT_DIR, SITES_DIR, TYPES, loadText, loadSplit, problemsDefinedOn } from './lib.mjs';

fs.mkdirSync(SITES_DIR, { recursive: true });

// ---------- the split ----------
// Made once, on 2026-11-17 (suras sorted by length and dealt in fours: two to
// build, one to test, one to vault, seed 20261117). This tool never makes it
// again: doing so would mean reading the whole text.
if (!fs.existsSync(path.join(PROJECT_DIR, 'split.json'))) throw new Error('project/split.json is missing. It is never regenerated: restore it from the repository history.');
const split = loadSplit();

// ---------- the problems ----------
const sets = loadSynonymSets();
const problems = problemsDefinedOn('build', 'test'); // build and test suras in memory; defined on the build suras
const num = (x) => x.toLocaleString('en');
const rows = [];
for (const type of TYPES) {
  const list = problems.filter((p) => p.type === type);
  // The site files are ordered by the number of places in the build suras, so that nothing about the test suras shows in the order.
  const buildOnly = list.map((p) => ({ ...p, occurrences: p.occurrences.filter((o) => split.partOf(o.s) === 'build') })).sort((a, b) => b.occurrences.length - a.occurrences.length || (a.id < b.id ? -1 : 1));
  fs.writeFileSync(path.join(SITES_DIR, `${type}.json`), JSON.stringify({ censusVersion: CENSUS_VERSION, type, note: 'Occurrences in the build suras only.', problems: buildOnly }));
  const occ = list.flatMap((p) => p.occurrences);
  const n = (part, other) => occ.filter((o) => split.partOf(o.s) === part && (o.chosen === OTHER) === other).length;
  rows.push({ type, problems: list.length, build: n('build', false), test: n('test', false), otherTest: n('test', true) });
}
const tot = rows.reduce((t, r) => Object.fromEntries(Object.keys(t).map((k) => [k, t[k] + r[k]])), { problems: 0, build: 0, test: 0, otherTest: 0 });

// ---------- near-identical verses in the build suras (counted, not yet turned into problems) ----------
const { verses } = loadText('build').corpus;
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
  frame: 'A word slot with two written words on either side, plus build-defined masked alignments; each phrase slot counted once',
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
  '**Problems and their options are defined from the build suras only.** The test suras play no part in deciding what counts as a problem. Where a test sura uses a word that the build suras never show in that slot, the place is counted in the last column and is not scored. **The vault suras are not loaded at all**, so this page has no numbers for them.',
  '',
  '| Type | What it is | Problems | Choices in build suras | In test suras | Test: word not among the options |',
  '|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.type} | ${WHAT[r.type]} | ${num(r.problems)} | ${num(r.build)} | ${num(r.test)} | ${num(r.otherTest)} |`),
  `| **all** | | ${num(tot.problems)} | ${num(tot.build)} | ${num(tot.test)} | ${num(tot.otherTest)} |`,
  '',
  `The split: ${split.build.length} build suras (${num(split.words.build)} words), ${split.test.length} test suras (${num(split.words.test)}), ${split.vault.length} vault suras (${num(split.words.vault)}).`,
  '',
  'The files in `project/sites/` list every problem with its occurrences in the build suras only. They are safe to open and read.',
  '',
  '## Not yet turned into problems',
  '',
  `- **Near-identical verses.** Within the build suras, ${num(twins.pairs)} pairs of verses share at least 70% of their words in order. ${num(twins.identical)} are word-for-word identical; ${num(twins.oneWordSwapped)} differ by a swapped word; ${num(twins.wordsAddedOrLeftOut)} by words added or left out; ${num(twins.other)} in a longer stretch. (A pair can fall in more than one group.) Added and omitted words are not yet covered.`,
  '- **Choices of form.** Singular or plural, verb form, definite or indefinite, which particle is attached. Words are compared by dictionary form here, so these are not counted.',
  '- **What each telling of a story includes.** See batch 16.',
  '',
  '## Versions',
  '',
  '- **Version 1** defined problems from the whole text. A phrase frame counted only if its word varied somewhere, so a frame seen once in the build suras and once in the test suras was certain to differ there, and the baseline was certain to be wrong on it. That made any rule look better against the baseline than it was.',
  '- **Version 2** defined phrase, ending and order problems from the build suras alone. Codex then found (`project/CENSUS_V2_AUDIT.md`) that the near-synonym options were still picked out by scanning the whole text, that the root of an option word was looked up in the whole text, and that nothing stopped a rule from reading a test or vault sura.',
  '- **Version 3** closes those. Near-synonym options are explicit lists of dictionary forms compiled from the build suras (`project/synonyms.json`). Roots are looked up in the defining suras. A run loads only the suras it may see, and a rule may read only its own sura and the suras it learns from. Measured effect of the change on the test suras: 4 places (3 in "fear", 1 in "rain") that version 2 counted are no longer occurrences, because their dictionary form never occurs in the build suras.',
  '- **Version 4** changed no problem. It changed the scoring: for near-synonym places the baseline is now the commonest option among build places of the same grammatical form (a verb\'s tense, a noun\'s definiteness), and a rule is told that form and nothing more about the hidden word. Codex\'s review (`project/CENSUS_V3_REVIEW.md`) showed why: rule R003 had passed by reading the tense, which a baseline that reads the tense does equally well. Version 4 also skips the lines of excluded suras unparsed and orders the site files by build counts. Codex then reviewed version 4 (`project/METHOD_V4_REVIEW.md`) and it was repaired on 2026-11-19, before any rule had been tested under it: the code a run loads is now recorded by Node\'s own module loader instead of by reading import lines; a rule is told the form only where the baseline uses it; and a challenge counts only for the test it names.',
  '- **Version 5** widens phrase frames to two written context words on each side and adds build-defined masked alignments. Local frames own a slot first, so the aligned extension cannot duplicate it. Options and prototypes still come only from defining suras. See `project/PHRASE_COMPARISON_V2_PROTOCOL.md` for build diagnostics and the separate comparison experiment.',
  '- Versions 1 and 2 loaded the vault suras, counted their choices and wrote them into `project/sites/`. No rule was ever scored on them, but both models could have opened those files. The vault is therefore sealed from version 3 on, not untouched from the start.',
  '',
];
fs.writeFileSync(path.join(PROJECT_DIR, 'CENSUS.md'), md.join('\n'));
console.log(JSON.stringify({ rows, total: tot, twins }, null, 1));
