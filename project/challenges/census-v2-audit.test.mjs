// Documents census-v2 behavior with invented, non-scriptural data only.
// Some assertions demonstrate defects, not behavior to preserve after a fix.
// No real Quran corpus, site export, chronology or split is loaded.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR, MORPH_PATH } from '../../src/corpus.mjs';
import { makeProblems, OTHER } from '../tools/problems.mjs';
import { makeContext, loadSplit, loadText, majority, scoreRows } from '../tools/lib.mjs';
import { buildFrames } from '../../src/phrase.mjs';

function verse(s, v, tokens, roots = {}) {
  return { s, v, words: tokens.map((token, i) => ({ s, v, w: i + 1, token, lemma: token, form: token, root: roots[token] || null, pos: null, prefixes: [], feats: [] })) };
}
const corpus = (...verses) => ({ verses });
const frame = (s, choice, roots) => verse(s, 1, ['one', 'two', 'three', choice, 'four', 'five', 'six'], roots);
const frames = (text) => makeProblems(text, new Set([1, 2]), []).filter((p) => p.type === 'frame');

test('v2 correctly prevents a test-only change from defining a phrase problem', () => {
  assert.equal(frames(corpus(frame(1, 'red'), frame(2, 'red'), frame(3, 'blue'))).length, 0);
  const [p] = frames(corpus(frame(1, 'red'), frame(2, 'blue'), frame(3, 'green')));
  assert.deepEqual(p.options, ['red', 'blue']);
  assert.equal(p.occurrences.find((o) => o.s === 3).chosen, OTHER);
  assert.equal(majority(p.occurrences.filter((o) => o.s <= 2)), null);
});

test('defect: held-out tokens enter synonym option definitions', () => {
  const sets = [{ id: 'toy', options: [{ label: 'red', root: 'R_RED' }, { label: 'blue', root: 'R_BLUE' }] }];
  const build = verse(1, 1, ['red', 'blue'], { red: 'R_RED', blue: 'R_BLUE' });
  const base = makeProblems(corpus(build), new Set([1]), sets).find((p) => p.type === 'synonym');
  const changed = makeProblems(corpus(build, verse(3, 1, ['red_variant'], { red_variant: 'R_RED' })), new Set([1]), sets).find((p) => p.type === 'synonym');
  assert.deepEqual(base.optionInfo.red.tokens, ['red']);
  assert.deepEqual(changed.optionInfo.red.tokens, ['red', 'red_variant']);
});

test('defect: a reserved occurrence can change an exact-count synonym selector', () => {
  const sets = [{ id: 'toy', options: [{ label: 'red', root: 'R_RED', count: 2 }, { label: 'blue', root: 'R_BLUE' }] }];
  const build = verse(1, 1, ['red', 'blue'], { red: 'R_RED', blue: 'R_BLUE' });
  const heldOut = verse(3, 1, ['red'], { red: 'R_RED' });
  assert.doesNotThrow(() => makeProblems(corpus(build, heldOut), new Set([1]), sets));
  const reserve = verse(4, 1, ['red'], { red: 'R_RED' });
  assert.throws(() => makeProblems(corpus(build, heldOut, reserve), new Set([1]), sets), /synonym option not found/);
});

test('defect: the first whole-input root overrides a defining-set root', () => {
  const build = [frame(1, 'red', { red: 'R_BUILD' }), frame(2, 'blue', { blue: 'R_BLUE' })];
  const [base] = frames(corpus(...build));
  const [changed] = frames(corpus(frame(3, 'red', { red: 'R_HELD_OUT' }), ...build));
  assert.deepEqual(base.options, changed.options);
  assert.deepEqual(base.optionInfo.red.roots, ['R_BUILD']);
  assert.deepEqual(changed.optionInfo.red.roots, ['R_HELD_OUT']);
});

test('defect: loader and context admit a synthetic vault despite the scoring split', () => {
  const fakeMorph = [
    '1:1:1\tred\tN\tLEM:red|ROOT:R_RED',
    '2:1:1\tblue\tN\tLEM:blue|ROOT:R_BLUE',
    '3:1:1\tanswer\tN\tLEM:answer|ROOT:R_ANSWER',
    '4:1:1\treserve_marker\tN\tLEM:reserve_marker|ROOT:R_RESERVE',
  ].join('\n');
  const replacements = new Map([
    [MORPH_PATH, fakeMorph],
    [path.join(ROOT_DIR, 'data/chronology.json'), JSON.stringify({ suras: [1, 2, 3, 4].map((sura) => ({ sura, ayas: 1 })) })],
    [path.join(ROOT_DIR, 'project/split.json'), JSON.stringify({ build: [1, 2], test: [3], vault: [4] })],
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
    assert.ok(loadText().corpus.at(4, 1), 'the synthetic reserved unit was loaded');
    const ctx = makeContext({ s: 3, v: 1, slots: [1] }, []);
    assert.equal(ctx.verse()[0].hidden, true, 'current target is masked correctly');
    assert.equal(ctx.window(10)[0].words[0].hidden, true);
    assert.equal(ctx.sura()[0].words[0].hidden, true);
    assert.equal(ctx.verse(4, 1)[0].token, 'reserve_marker', 'arbitrary reserved-unit access succeeds');
    assert.equal(ctx.meta(4).sura, 4);
    assert.equal(ctx.rootOf('reserve_marker'), 'R_RESERVE');
    assert.equal(intercepted.size, 3);
  } finally { fs.readFileSync = originalRead; }
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
