import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseV2, summarizeV2 } from './comparison-v2-run.mjs';
import { indexCorpus } from './comparison.mjs';
import { makeProblems } from './problems.mjs';
import { compileCandidates } from './compile-comparison-sets.mjs';
const verse = (s, tokens) => ({ s, v: 1, words: tokens.map((token, i) => ({ s, v: 1, w: i + 1, token, form: token, pos: null, root: null, prefixes: [], feats: [] })) });
const split = { build: [1, 2], test: [3], reserve: [4] };

test('comparison v2 never asks a rule about an unseen answer and counts it as a miss', () => {
  const corpus = indexCorpus([verse(1, ['a', 'b', 'red', 'c', 'd']), verse(2, ['a', 'b', 'blue', 'c', 'd']), verse(3, ['a', 'b', 'green', 'c', 'd'])]);
  let calls = 0;
  const rule = { id: 'invented', appliesTo: ['frame'], predict() { calls++; return 'red'; } };
  const r = analyseV2(corpus, split, 'test', [], [rule]).rules.invented;
  assert.equal(calls, 0);
  assert.equal(r.unseen, 1);
  assert.equal(r.eligibleSites, 1);
  assert.equal(r.accuracyAllPlaces, 0);
  assert.equal(r.baselineAllPlaces, 0);
});

test('comparison v2 refuses reserve or test units in a build analysis', () => {
  const corpus = indexCorpus([verse(1, ['a', 'b', 'red', 'c', 'd']), verse(2, ['a', 'b', 'blue', 'c', 'd']), verse(4, ['a', 'b', 'secret', 'c', 'd'])]);
  assert.throws(() => analyseV2(corpus, split, 'build', [], []), /excluded unit/);
});

test('comparison synonym support is measured only in defining units', () => {
  const set = { id: 'toy', minBuild: 5, options: [{ label: 'A', lemmas: ['red'] }, { label: 'B', lemmas: ['blue'] }] };
  const a = verse(1, [...Array(5).fill('red'), ...Array(4).fill('blue')]);
  const text = { verses: [a, verse(3, Array(30).fill('blue'))] };
  assert.equal(makeProblems(text, new Set([1]), [set]).some((p) => p.type === 'synonym'), false);
  a.words.push({ ...a.words[8], w: 10 });
  assert.equal(makeProblems(text, new Set([1]), [set]).filter((p) => p.type === 'synonym').length, 1);
});

test('catalogue compilation retains explicit attested forms and records rejected candidates', () => {
  const text = indexCorpus([verse(1, ['3820 a', '3824', 'האילן', 'אילן', 'absent'])]);
  const [heart, tree] = compileCandidates(text, [
    { id: 'heart', options: [{ label: 'short', lemmaIds: ['3820'] }, { label: 'long', lemmaIds: ['3824'] }] },
    { id: 'tree', options: [{ label: 'tree', surfaceStems: ['אילן'] }, { label: 'wood', surfaceStems: ['עץ'] }] },
  ]);
  assert.deepEqual(heart.options[0].lemmas, ['3820 a']);
  assert.deepEqual(tree.options[0].lemmas, ['אילן', 'האילן']);
  assert.deepEqual(tree.options[1].lemmas, []);
  assert.equal(tree.eligible, false);
});

test('catalogue matching normalizes canonically equivalent dictionary spellings', () => {
  const composed = 'a\u0301'.normalize('NFC');
  const [set] = compileCandidates(indexCorpus([verse(1, Array(5).fill(composed))]), [
    { id: 'normalization', options: [{ label: 'accented', lemmas: ['a\u0301'] }] },
  ]);
  assert.equal(set.options[0].buildCount, 5);
  assert.deepEqual(set.options[0].lemmas, [composed]);
});

test('comparison aggregate uses baseline fallback and keeps unknown choices in its denominator', () => {
  const problem = { id: 'toy', options: ['red', 'blue'] };
  const rows = [
    { problem, occ: { s: 1, chosen: 'red' }, prediction: 'red', baseline: 'blue', unseen: false },
    { problem, occ: { s: 2, chosen: 'blue' }, prediction: null, baseline: 'blue', unseen: false },
    { problem, occ: { s: 3, chosen: '(other)' }, prediction: null, baseline: null, unseen: true },
  ];
  const score = summarizeV2(rows);
  assert.equal(score.answered, 1);
  assert.equal(score.accuracyAllPlaces, 0.6667);
  assert.equal(score.baselineAllPlaces, 0.3333);
  assert.equal(score.unseen, 1);
});
