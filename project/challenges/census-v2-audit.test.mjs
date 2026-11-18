// Checks on how problems are built and what a rule can see, on invented,
// non-scriptural data only. No real Quran corpus, site export, chronology or
// split is loaded.
//
// Written by codex for its audit of census version 2 (project/CENSUS_V2_AUDIT.md),
// where four of these checks demonstrated defects. Changed by claude on
// 2026-11-18 for census version 3: those four now check that the defect is
// gone, as the audit asked. The other four are as codex wrote them.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, MORPH_PATH } from '../../src/corpus.mjs';
import { makeProblems, OTHER } from '../tools/problems.mjs';
import { makeContext, loadSplit, loadText, openVault, majority, scoreRows } from '../tools/lib.mjs';
import { buildFrames } from '../../src/phrase.mjs';

function verse(s, v, tokens, roots = {}) {
  return { s, v, words: tokens.map((token, i) => ({ s, v, w: i + 1, token, lemma: token, form: token, root: roots[token] || null, pos: null, prefixes: [], feats: [] })) };
}
const corpus = (...verses) => ({ verses });
const frame = (s, choice, roots) => verse(s, 1, ['one', 'two', 'three', choice, 'four', 'five', 'six'], roots);
const frames = (text) => makeProblems(text, new Set([1, 2]), []).filter((p) => p.type === 'frame');

test('a test-only change cannot define a phrase problem', () => {
  assert.equal(frames(corpus(frame(1, 'red'), frame(2, 'red'), frame(3, 'blue'))).length, 0);
  const [p] = frames(corpus(frame(1, 'red'), frame(2, 'blue'), frame(3, 'green')));
  assert.deepEqual(p.options, ['red', 'blue']);
  assert.equal(p.occurrences.find((o) => o.s === 3).chosen, OTHER);
  assert.equal(majority(p.occurrences.filter((o) => o.s <= 2)), null);
});

test('fixed in version 3: a held-out word cannot enter a synonym option', () => {
  const sets = [{ id: 'toy', options: [{ label: 'red', root: 'R_RED', lemmas: ['red'] }, { label: 'blue', root: 'R_BLUE', lemmas: ['blue'] }] }];
  const build = verse(1, 1, ['red', 'blue'], { red: 'R_RED', blue: 'R_BLUE' });
  const base = makeProblems(corpus(build), new Set([1]), sets).find((p) => p.type === 'synonym');
  const changed = makeProblems(corpus(build, verse(3, 1, ['red_variant'], { red_variant: 'R_RED' })), new Set([1]), sets).find((p) => p.type === 'synonym');
  assert.deepEqual(base.optionInfo.red.tokens, ['red']);
  assert.deepEqual(changed.optionInfo.red.tokens, ['red'], 'the option is the listed forms and nothing else');
  assert.equal(changed.occurrences.some((o) => o.s === 3), false, 'the unlisted word is not an occurrence');
});

test('fixed in version 3: options are listed outright, so no count of the text can change them', () => {
  const sets = [{ id: 'toy', options: [{ label: 'red', root: 'R_RED', lemmas: ['red'] }, { label: 'blue', root: 'R_BLUE', lemmas: ['blue'] }] }];
  const build = verse(1, 1, ['red', 'blue'], { red: 'R_RED', blue: 'R_BLUE' });
  const one = makeProblems(corpus(build, verse(3, 1, ['red'], { red: 'R_RED' })), new Set([1]), sets).find((p) => p.type === 'synonym');
  const two = makeProblems(corpus(build, verse(3, 1, ['red'], { red: 'R_RED' }), verse(4, 1, ['red'], { red: 'R_RED' })), new Set([1]), sets).find((p) => p.type === 'synonym');
  assert.deepEqual(one.optionInfo, two.optionInfo);
  assert.deepEqual(one.options, two.options);
  // The old selectors (root with a spelling or a whole-text count) are refused.
  assert.throws(() => makeProblems(corpus(build), new Set([1]), [{ id: 'old', options: [{ label: 'red', root: 'R_RED', count: 2 }] }]), /explicit list of lemmas/);
});

test('fixed in version 3: the root of an option word comes from the defining suras only', () => {
  const build = [frame(1, 'red', { red: 'R_BUILD' }), frame(2, 'blue', { blue: 'R_BLUE' })];
  const [base] = frames(corpus(...build));
  const [changed] = frames(corpus(frame(3, 'red', { red: 'R_HELD_OUT' }), ...build));
  assert.deepEqual(base.options, changed.options);
  assert.deepEqual(base.optionInfo.red.roots, ['R_BUILD']);
  assert.deepEqual(changed.optionInfo.red.roots, ['R_BUILD']);
});

test('fixed in version 3: a run loads only the suras it may see, and a rule cannot read past them', () => {
  const fakeMorph = [
    '1:1:1\tred\tN\tLEM:red|ROOT:R_RED',
    '2:1:1\tblue\tN\tLEM:blue|ROOT:R_BLUE',
    '3:1:1\tanswer\tN\tLEM:answer|ROOT:R_ANSWER',
    '4:1:1\treserve_marker\tN\tLEM:reserve_marker|ROOT:R_RESERVE',
    '5:1:1\tother_test\tN\tLEM:other_test|ROOT:R_OTHER',
  ].join('\n');
  const replacements = new Map([
    [MORPH_PATH, fakeMorph],
    [path.join(ROOT_DIR, 'data/chronology.json'), JSON.stringify({ suras: [1, 2, 3, 4, 5].map((sura) => ({ sura, ayas: 1 })) })],
    [path.join(ROOT_DIR, 'project/split.json'), JSON.stringify({ build: [1, 2], test: [3, 5], vault: [4] })],
  ]);
  const originalRead = fs.readFileSync;
  const intercepted = new Set();
  fs.readFileSync = function (file, options) {
    const name = path.resolve(String(file));
    if (replacements.has(name)) {
      intercepted.add(name);
      return options === 'utf8' ? replacements.get(name) : Buffer.from(replacements.get(name));
    }
    if (name.startsWith(path.join(ROOT_DIR, 'data') + path.sep) || name.startsWith(path.join(ROOT_DIR, 'project/sites') + path.sep)) throw new Error('real corpus access forbidden in audit');
    return originalRead.call(this, file, options);
  };
  try {
    const split = loadSplit();
    assert.equal(split.partOf(4), 'vault');
    // A build run holds the build suras only.
    const build = loadText('build');
    assert.ok(build.corpus.at(1, 1));
    assert.equal(build.corpus.at(3, 1), undefined, 'no test sura in a build run');
    assert.equal(build.corpus.at(4, 1), undefined, 'no vault sura in a build run');
    // A test run holds the build and test suras, never the vault.
    const testRun = loadText('test');
    assert.ok(testRun.corpus.at(3, 1));
    assert.equal(testRun.corpus.at(4, 1), undefined, 'no vault sura in a test run');
    assert.equal(testRun.meta[4], undefined);
    // The vault is refused until it is opened on purpose.
    assert.throws(() => loadText('vault'), /only when the owner asks/);
    // What a rule sees while predicting a place in test sura 3.
    const ctx = makeContext({ s: 3, v: 1, slots: [1] }, [], { part: 'test', defining: 'build' });
    assert.equal(ctx.verse()[0].hidden, true, 'current target is masked');
    assert.equal(ctx.window(10)[0].words[0].hidden, true);
    assert.equal(ctx.sura()[0].words[0].hidden, true);
    assert.equal(ctx.verse(1, 1)[0].token, 'red', 'a sura the rule learns from can be read');
    assert.throws(() => ctx.verse(4, 1), /neither/, 'the vault cannot be read');
    assert.throws(() => ctx.verse(5, 1), /neither/, 'another test sura cannot be read');
    assert.throws(() => ctx.meta(4), /neither/);
    assert.equal(ctx.rootOf('reserve_marker'), null, 'no dictionary entry from the vault');
    assert.equal(ctx.rootOf('other_test'), null, 'nor from another test sura');
    assert.equal(ctx.rootOf('red'), 'R_RED');
    assert.equal(intercepted.size, 3);
    // Opened on purpose (the evaluator does this only with --vault --owner-approved): build and vault, no test sura.
    openVault();
    const vaultRun = loadText('vault');
    assert.ok(vaultRun.corpus.at(4, 1));
    assert.equal(vaultRun.corpus.at(3, 1), undefined);
  } finally { fs.readFileSync = originalRead; }
});

test('version 3: unseen words are counted, never scored; suras are counted once in the second test', () => {
  const problem = { id: 'toy', options: ['red', 'blue'] };
  const row = (s, chosen, prediction, unseen = false) => ({ problem, occ: { s, chosen }, prediction, baseline: 'red', unseen });
  // Ten wins over the baseline, all in one sura: strong place by place, nothing sura by sura.
  const rows = [...Array(10).fill(0).map(() => row(1, 'blue', 'blue')), row(2, 'green', null, true), row(2, 'green', null, true)];
  const r = scoreRows(rows, { draws: 2000 });
  assert.equal(r.occurrences, 10);
  assert.equal(r.unseen, 2);
  assert.equal(r.accuracy, 1);
  assert.ok(r.pGain < 0.01, 'ten places');
  assert.ok(r.pGainBySura > 0.4, 'but one sura');
  assert.equal(r.accuracyAllPlaces, +(10 / 12).toFixed(4));
  assert.equal(r.baselineAllPlaces, 0);
});

test('frame matching ignores the morphology of context words', () => {
  const a = frame(1, 'red'), b = frame(2, 'blue');
  a.words[0].feats = ['SINGULAR'];
  b.words[0].feats = ['PLURAL'];
  a.words[0].form = 'one_form';
  b.words[0].form = 'another_form';
  const [p] = frames(corpus(a, b));
  assert.deepEqual(p.options, ['red', 'blue']);
  assert.equal(p.occurrences.length, 2);
});

test('within-problem shuffling gives no association evidence for a constant majority guess', () => {
  const problem = { id: 'toy', options: ['red', 'blue'] };
  const rows = ['red', 'red', 'blue'].map((chosen) => ({ problem, occ: { chosen }, prediction: 'red', baseline: 'red' }));
  const result = scoreRows(rows, { draws: 100 });
  assert.equal(result.pAgainstShuffledChoices, 1);
  assert.equal(result.gainOverBaseline, 0);
});

test('batch-4 frames use both sides, but within-frame swaps preserve their selection', () => {
  const units = ['red', 'blue'].map((choice, idx) => ({ idx, doc: idx, tokens: ['one', 'two', choice, 'three', 'four'] }));
  assert.equal(buildFrames(units.slice(0, 1)).length, 0);
  const [both] = buildFrames(units);
  const swapped = units.map((u, i) => ({ ...u, tokens: ['one', 'two', i ? 'red' : 'blue', 'three', 'four'] }));
  const [permuted] = buildFrames(swapped);
  assert.equal(both.key, permuted.key);
  assert.deepEqual(both.occ.map((o) => o.m).sort(), permuted.occ.map((o) => o.m).sort());
});
