import test from 'node:test';
import assert from 'node:assert/strict';
import { makeProblems, OTHER } from './problems.mjs';
import echo from '../rules/R001_echo.mjs';
import content from '../rules/R002_content.mjs';
import { indexCorpus, splitUnits, comparisonContext, baselinePoint, summarize, unitSignFlip, analyse, mishnahTokens } from './comparison.mjs';

function verse(s, v, tokens) {
  return { s, v, words: tokens.map((token, i) => ({ s, v, w: i + 1, token, root: null, pos: null, prefixes: [] })) };
}
const frame = (s, choice, v = 1) => verse(s, v, ['left-a', 'left-b', 'left-c', choice, 'right-a', 'right-b', 'right-c']);
const definitions = (corpus) => makeProblems(corpus, new Set([1, 2]), []).map(({ id, options, optionInfo }) => ({ id, options, optionInfo })).sort((a, b) => a.id.localeCompare(b.id));

test('test-only variation cannot create a choice; novel test words stay OTHER', () => {
  const single = indexCorpus([frame(1, 'red'), frame(2, 'red'), frame(3, 'blue')]);
  assert.equal(definitions(single).length, 0);
  const first = indexCorpus([frame(1, 'red'), frame(2, 'blue'), frame(3, 'green')]);
  const changed = indexCorpus([frame(1, 'red'), frame(2, 'blue'), frame(3, 'yellow'), verse(4, 1, ['novel', 'test', 'phrase', 'only'])]);
  assert.deepEqual(definitions(first), definitions(changed));
  const [problem] = makeProblems(first, new Set([1, 2]), []);
  assert.deepEqual(problem.options, ['red', 'blue']);
  assert.equal(problem.occurrences.find((o) => o.s === 3).chosen, OTHER);
});

test('all target views mask the answer and other held-out units are denied', () => {
  const corpus = indexCorpus([frame(1, 'red'), frame(2, 'blue'), frame(3, 'red'), frame(4, 'green')]);
  const ctx = comparisonContext(corpus, { s: 3, v: 1, slots: [4] }, [], new Set([1, 2]));
  for (const words of [ctx.verse(), ctx.verse(3, 1), ctx.window(10)[0].words, ctx.sura()[0].words]) {
    assert.equal(words[3].hidden, true);
    assert.equal(words[3].token, undefined);
  }
  assert.equal(ctx.verse(1, 1)[3].token, 'red');
  assert.throws(() => ctx.verse(4, 1), /outside build/);
  assert.throws(() => ctx.meta(4), /outside build/);
  const words = ctx.verse(1, 1);
  words[3].token = 'changed';
  assert.equal(ctx.verse(1, 1)[3].token, 'red');
});

test('deterministic length split is exhaustive, disjoint and keeps the remainder in build', () => {
  const units = Array.from({ length: 13 }, (_, i) => ({ s: i + 1, words: 100 - i }));
  const split = splitUnits(units);
  assert.deepEqual(split, splitUnits(units));
  assert.equal(split.build.length, 7);
  assert.equal(split.test.length, 3);
  assert.equal(split.reserve.length, 3);
  assert.ok(split.build.includes(13));
  assert.equal(new Set(Object.values(split).flat()).size, 13);
});

test('unknown answers get no credit, including a tied baseline, and abstentions stay distinct', () => {
  const problem = { id: 'fixture', options: ['red', 'blue'] };
  const rows = [
    { problem, occ: { s: 1, chosen: 'red' }, prediction: 'red', baseline: null },
    { problem, occ: { s: 2, chosen: OTHER }, prediction: 'red', baseline: null },
    { problem, occ: { s: 3, chosen: 'blue' }, prediction: null, baseline: 'blue' },
  ];
  assert.equal(baselinePoint(rows[1]), 0);
  const result = summarize(rows);
  assert.equal(result.occurrences, 2);
  assert.equal(result.answered, 1);
  assert.equal(result.accuracy, 1);
  assert.equal(result.baselineAccuracy, 0.5);
  assert.equal(result.baselineAllScored, 0.75);
  assert.equal(result.baselineAllEligible, 0.5);
  assert.equal(result.accuracyIncludingUnseen, 0.5);
  assert.equal(result.withBaselineFallbackAllEligible, 0.6667);
  assert.equal(summarize([]).accuracy, null);
});

test('ten repeated wins in one unit count as one sign, not ten independent signs', () => {
  const row = { problem: { options: ['red', 'blue'] }, occ: { s: 1, chosen: 'red' }, prediction: 'red', baseline: 'blue' };
  assert.equal(unitSignFlip(Array(10).fill(row)).pGain, 0.5);
  assert.equal(unitSignFlip([{ ...row, occ: { s: 1, chosen: 'red' } }, { ...row, occ: { s: 2, chosen: 'red' } }]).pGain, 0.25);
});

test('reserved words are never passed to problem construction; R002 stays out of scope', () => {
  const reserved = { s: 4, v: 1, get words() { throw new Error('reserved words accessed'); } };
  const corpus = indexCorpus([frame(1, 'red'), frame(2, 'blue'), frame(3, 'red'), reserved]);
  const result = analyse(corpus, { build: [1, 2], test: [3], reserve: [4] }, 'test', [echo, content]);
  assert.equal(result.problems, 1);
  assert.equal(result.rules.R001.occurrences, 1);
  // Without a repeated option in its context, echo must abstain.
  assert.equal(result.rules.R001.answered, 0);
  assert.equal(result.rules.R002.occurrences, 0);
});

test('Mishnah tokenizer preserves batch-13 treatment of HTML, points and one-letter forms', () => {
  assert.deepEqual(mishnahTokens(['<b>אב</b>־גד', ['ה', 'וָז']]), ['אב', 'גד', 'וז']);
});

test('the content adaptation learns a build cue without seeing the target answer', () => {
  const cue = (s, v, choice, feature) => verse(s, v, [feature, 'left-a', 'left-b', 'left-c', choice, 'right-a', 'right-b', 'right-c']);
  const build = [1, 2, 3].flatMap((v) => [cue(1, v, 'red', 'warm'), cue(2, v, 'blue', 'cold')]);
  const rule = { ...content, id: 'content_fixture', appliesTo: ['frame'] };
  const split = { build: [1, 2], test: [3], reserve: [] };
  const score = (target) => analyse(indexCorpus([...build, cue(3, 1, target, 'warm')]), split, 'test', [rule]).rules.content_fixture;
  const matching = score('red'), conflicting = score('blue');
  assert.equal(matching.answered, 1);
  assert.equal(matching.correct, 1);
  assert.equal(conflicting.answered, 1);
  assert.equal(conflicting.correct, 0);
});
