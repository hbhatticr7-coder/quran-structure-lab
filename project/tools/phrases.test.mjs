import test from 'node:test';
import assert from 'node:assert/strict';
import { makePhraseProblems } from './phrases.mjs';
const OTHER = '(other)';
const verse = (s, tokens) => ({ s, v: 1, words: tokens.map((token, i) => ({ s, v: 1, w: i + 1, token, form: token, pos: 'N', prefixes: [], feats: [] })) });
const info = (tokens) => Object.fromEntries(tokens.map((token) => [token, { tokens: [token], roots: [] }]));
const build = new Set([1, 2]);
const make = (verses, settings) => makePhraseProblems({ verses }, build, info, OTHER, settings);
const at = (problems, s, w) => problems.flatMap((p) => p.occurrences.filter((o) => o.s === s && o.slots[0] === w).map((o) => ({ p, o })));
const shape = (problems) => problems.map(({ id, options, definition }) => ({ id, options, definition }));

test('test-only variation supplies neither a phrase problem nor an option', () => {
  const a = verse(1, ['a', 'b', 'red', 'c', 'd']);
  const b = verse(2, ['a', 'b', 'red', 'c', 'd']);
  const t = verse(3, ['a', 'b', 'blue', 'c', 'd']);
  assert.equal(at(make([a, b, t]), 3, 3).length, 0);
  b.words[2].token = b.words[2].form = 'green';
  const problems = make([a, b, t]);
  assert.deepEqual(at(problems, 3, 3)[0].p.options, ['red', 'green']);
  assert.equal(at(problems, 3, 3)[0].o.chosen, OTHER);
});

test('two-word contexts recover a choice whose third context word varies', () => {
  const vs = [verse(1, ['one', 'a', 'b', 'red', 'c', 'd', 'end']), verse(2, ['two', 'a', 'b', 'blue', 'c', 'd', 'end'])];
  assert.equal(at(make(vs, { radius: 3, aligned: false }), 1, 4).length, 0);
  assert.equal(at(make(vs), 1, 4).length, 1);
});

test('written context forms are retained when their lemmas happen to be equal', () => {
  const vs = [verse(1, ['a', 'b', 'red', 'c', 'd']), verse(2, ['a', 'b', 'blue', 'c', 'd'])];
  vs[1].words[1].form = 'b-plural';
  assert.equal(at(make(vs, { context: 'lemma', aligned: false }), 1, 3).length, 1);
  assert.equal(at(make(vs), 1, 3).length, 0);
});

test('build alignments recover an insertion outside the hidden substitution', () => {
  const vs = [verse(1, ['opening', 'a', 'b', 'red', 'c', 'd', 'ending']), verse(2, ['opening', 'a', 'insert', 'b', 'blue', 'c', 'd', 'ending'])];
  assert.equal(at(make(vs, { aligned: false }), 1, 4).length, 0);
  const p = at(make(vs), 1, 4)[0].p;
  assert.equal(p.definition.kind, 'aligned');
  assert.deepEqual(p.options, ['red', 'blue']);
});

test('aligned matching masks the answer, and test changes cannot change its prototypes', () => {
  const a = verse(1, ['opening', 'a', 'b', 'red', 'c', 'd', 'ending']);
  const b = verse(2, ['opening', 'a', 'insert', 'b', 'blue', 'c', 'd', 'ending']);
  const t = verse(3, ['opening', 'a', 'b', 'red', 'c', 'd', 'ending']);
  const first = make([a, b, t]);
  t.words[3].token = t.words[3].form = 'unseen';
  const second = make([a, b, t]);
  assert.deepEqual(shape(first), shape(second));
  assert.equal(at(first, 3, 4)[0].p.id, at(second, 3, 4)[0].p.id);
  assert.equal(at(second, 3, 4)[0].o.chosen, OTHER);
});

test('local frames own their slots even for unseen options; aligned frames do not duplicate them', () => {
  const vs = [verse(1, ['opening', 'a', 'b', 'red', 'c', 'd', 'ending']), verse(2, ['opening', 'a', 'b', 'blue', 'c', 'd', 'ending']), verse(3, ['opening', 'a', 'b', 'unseen', 'c', 'd', 'ending'])];
  const problems = make(vs);
  const keys = problems.flatMap((p) => p.occurrences.map((o) => `${o.s}:${o.v}:${o.slots[0]}`));
  assert.equal(new Set(keys).size, keys.length);
  const [hit] = at(problems, 3, 4);
  assert.equal(hit.p.definition.kind, 'local');
  assert.equal(hit.o.chosen, OTHER);
});
