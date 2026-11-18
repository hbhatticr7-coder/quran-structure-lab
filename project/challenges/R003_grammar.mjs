// Formal challenge of the existing R003 test, not a new evaluator/ledger run.
// Reads build and test suras through the filtered loader; never opens the vault.
// Checks the unchanged rule against a grammar-matched baseline, exact repeated
// verses, and omission of each test sura. Writes only its JSON to stdout.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { CENSUS_VERSION, loadText, loadSplit, predictAll, scoreRows } from '../tools/lib.mjs';
import rule from '../rules/R003_come_tense.mjs';

const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'project/ledger/R003.json'), 'utf8'));
const ruleHash = hash(fs.readFileSync(path.join(ROOT_DIR, ledger.file)));
assert.equal(ruleHash, ledger.sha256, 'challenge the frozen rule, not an edited replacement');
assert.equal(CENSUS_VERSION, 4, 'review this challenge before using another method');
for (const name of ['project/split.json', 'project/synonyms.json']) {
  assert.equal(hash(fs.readFileSync(path.join(ROOT_DIR, name))), ledger.test.inputs[name], `${name} must match the original test`);
}
const { corpus } = loadText('test');
const { sets } = loadSplit();
assert.ok(corpus.verses.every((v) => sets.build.has(v.s) || sets.test.has(v.s)));
assert.ok(corpus.verses.every((v) => !sets.vault.has(v.s)));
const rows = predictAll(rule, 'test');
const plainRows = (items) => items.map((r) => ({ ...r, baseline: r.plainBaseline }));
const originalReproduction = scoreRows(plainRows(rows));
for (const key of ['occurrences', 'answered', 'correct', 'accuracy', 'baselineAccuracy', 'gainOverBaseline', 'unseen', 'accuracyAllPlaces', 'baselineAllPlaces']) {
  assert.equal(originalReproduction[key], ledger.test.all[key], `historical ${key} is reproduced`);
}
const matchedAllSynonyms = scoreRows(rows);
const come = rows.filter((r) => r.problem.id === 'synonym:come');
assert.equal(come.length, 159);
assert.ok(come.every((r) => !r.unseen && r.prediction !== null));
assert.ok(come.every((r) => r.prediction === r.baseline), 'R003 and the grammar baseline agree at every test place');

function summarize(items) {
  const plain = scoreRows(plainRows(items));
  const matched = scoreRows(items);
  return {
    places: items.length, suras: new Set(items.map((r) => r.occ.s)).size,
    correct: matched.correct, accuracy: matched.accuracy,
    plainBaselineAccuracy: plain.baselineAccuracy,
    gainOverPlain: plain.gainOverBaseline,
    pGainOverPlain: plain.pGain, pGainBySuraOverPlain: plain.pGainBySura,
    formBaselineAccuracy: matched.baselineAccuracy,
    gainOverForm: matched.gainOverBaseline,
    pGainOverForm: matched.pGain, pGainBySuraOverForm: matched.pGainBySura,
    disagreementsWithForm: items.filter((r) => r.prediction !== r.baseline).length,
  };
}

// Retain the first verse (sura/verse order) for each identical sequence of
// reconstructed written words. Keep all choice slots in that representative
// verse, rather than conflating multiple choices in one verse.
const representatives = new Map();
const deduplicated = come.slice().sort((a, b) => a.occ.s - b.occ.s || a.occ.v - b.occ.v || a.occ.slots[0] - b.occ.slots[0]).filter((r) => {
  const verse = corpus.at(r.occ.s, r.occ.v);
  const signature = JSON.stringify(verse.words.map((w) => w.form));
  const location = `${r.occ.s}:${r.occ.v}`;
  if (!representatives.has(signature)) representatives.set(signature, location);
  return representatives.get(signature) === location;
});
const byForm = new Map();
for (const r of come) {
  const word = corpus.at(r.occ.s, r.occ.v).words.find((w) => w.w === r.occ.slots[0]);
  const tense = word.feats.find((f) => ['PERF', 'IMPF', 'IMPV'].includes(f)) || 'unmarked';
  if (!byForm.has(tense)) byForm.set(tense, { tense, places: 0, jaa: 0, ata: 0, correct: 0 });
  const out = byForm.get(tense);
  out.places++; out[r.occ.chosen]++; out.correct += Number(r.prediction === r.occ.chosen);
}
const full = summarize(come);
const withoutIdenticalVerses = summarize(deduplicated);
const leaveOneSuraOut = [...sets.test].sort((a, b) => a - b).map((sura) => ({
  omittedSura: sura, ...summarize(come.filter((r) => r.occ.s !== sura)),
}));
assert.ok([full, withoutIdenticalVerses, ...leaveOneSuraOut].every((r) => r.disagreementsWithForm === 0 && r.gainOverForm === 0));
console.log(JSON.stringify({
  rule: rule.id, ruleSha256: ruleHash,
  challengedTest: { censusVersion: ledger.test.censusVersion, commit: ledger.test.commit, recordSha256: hash(JSON.stringify(ledger.test)) },
  challengeMethodVersion: CENSUS_VERSION,
  scope: 'Post hoc challenge of an existing test. Build and test only; no vault. Original ledger scores are not written.',
  originalReproduction, matchedAllSynonyms, testForms: [...byForm.values()],
  full, withoutIdenticalVerses, leaveOneSuraOut,
}, null, 2));
