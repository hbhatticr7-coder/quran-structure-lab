// Checks from Codex's independent review of method version 4
// (project/METHOD_V4_REVIEW.md). All data here are invented. The Git fixtures
// have local, disposable origins; no real corpus or ledger is read.
//
// Written by codex, where four of the six checks reproduced gaps. Changed by
// claude on 2026-11-19 (task 21): each now checks that its gap is closed. The
// fixture builder and the three import spellings are as codex wrote them. The
// guard is no longer cut out of evaluate.mjs and run in a vm: it is the
// exported function of project/tools/freeze.mjs, given the fixture's root.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { formBaseline, majority, scoreRows, shownForm } from '../tools/lib.mjs';
import { startFreeze } from '../tools/freeze.mjs';

const RAN = '__method4FixtureRan';

function fixture(t, ruleSource, { ignoreHelper = true } = {}) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'quran-method4-audit-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const root = path.join(temporary, 'work');
  const remote = path.join(temporary, 'origin.git');
  fs.mkdirSync(root);
  const environment = { ...process.env,
    GIT_AUTHOR_NAME: 'Synthetic audit', GIT_AUTHOR_EMAIL: 'audit@example.invalid',
    GIT_COMMITTER_NAME: 'Synthetic audit', GIT_COMMITTER_EMAIL: 'audit@example.invalid',
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  };
  const execute = (command, args, options = {}) => execFileSync(command, args, {
    ...options, env: environment, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const git = (args) => execute('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git(['init', '--quiet', '--bare', remote]);
  git(['init', '--quiet', '--initial-branch=main']);
  const helper = 'project/rules/private.mjs';
  const files = Object.fromEntries([
    'project/tools/evaluate.mjs', 'project/tools/lib.mjs', 'project/tools/problems.mjs',
    'project/synonyms.json', 'project/split.json', 'data/quran-morphology.txt', 'data/chronology.json',
  ].map((f) => [f, f.endsWith('.mjs') ? 'export {};\n' : 'invented fixture\n']));
  Object.assign(files, {
    '.gitignore': (ignoreHelper ? helper : '') + '\n',
    'project/rules/R900_fixture.mjs': ruleSource,
    // The uncommitted helper leaves a mark if it ever runs. (A committed one
    // may not: the guard's word list refuses a helper that touches globalThis.)
    [helper]: `${ignoreHelper ? `globalThis.${RAN} = true; ` : ''}export const value = 1; export default value;\n`,
  });
  for (const [name, contents] of Object.entries(files)) {
    const file = path.join(root, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, contents);
  }
  git(['add', '.']);
  git(['commit', '--quiet', '-m', 'Invented method-4 fixture']);
  git(['remote', 'add', 'origin', remote]);
  git(['push', '--quiet', '-u', 'origin', 'main']);
  return { root, helper, git, execute, rule: path.join(root, 'project/rules/R900_fixture.mjs') };
}

// Loads the fixture's rule through the production guard, as a test run does.
async function frozen(f) {
  const freeze = startFreeze({ root: f.root, check: true, exec: f.execute });
  try {
    await freeze.rule(f.rule);
  } finally {
    freeze.stop();
  }
  return freeze;
}

const spellings = [
  ['written in the ordinary way',
    "import value from './private.mjs';\nexport default value;\n"],
  ['with an inline comment between the import binding and from',
    "import value // explanation\n from './private.mjs';\nexport default value;\n"],
  ['with a quoted imported name',
    "import { 'value' as value } from './private.mjs';\nexport default value;\n"],
  ['with comment delimiters inside ordinary strings',
    "const opening = '/*';\nimport value from './private.mjs';\nconst closing = '*/';\nexport default value;\n"],
  ['as a re-export',
    "export { default } from './private.mjs';\n"],
];
for (const [name, ruleSource] of spellings) {
  test(`closed: an import ${name} cannot bring in an uncommitted helper`, async (t) => {
    const f = fixture(t, ruleSource);
    assert.throws(() => f.git(['cat-file', '-e', `HEAD:${f.helper}`]), 'the helper has no committed blob');
    delete globalThis[RAN];
    await assert.rejects(frozen(f), /private\.mjs: not in the current commit/);
    assert.equal(globalThis[RAN], undefined, 'and it was refused before any of it ran');
  });

  test(`closed: an import ${name} is recorded, and a later change to the helper is caught`, async (t) => {
    const f = fixture(t, ruleSource, { ignoreHelper: false });
    const freeze = await frozen(f);
    assert.ok(Object.hasOwn(freeze.inputs(), f.helper), 'the helper is among the recorded inputs');
    assert.equal(freeze.published(), f.git(['rev-parse', 'HEAD']));
    fs.writeFileSync(path.join(f.root, f.helper), 'export const value = 2; export default value;\n');
    assert.throws(() => freeze.verify(), /private\.mjs: differs from the committed file/);
  });
}

test('closed: once the rule is loaded, nothing more can be loaded', async (t) => {
  const f = fixture(t, "export default { later: (name) => import(name) };\n", { ignoreHelper: false });
  // The word list refuses a computed import outright.
  await assert.rejects(frozen(f), /uses a computed import/);
  // And without the word list the loader itself refuses: the guard is sealed.
  const g = fixture(t, 'export default 1;\n', { ignoreHelper: false });
  const freeze = startFreeze({ root: g.root, check: true, exec: g.execute });
  try {
    await freeze.rule(g.rule);
    await assert.rejects(import('./' + 'does-not-matter.mjs'), /No code may be loaded once the rule is loaded/);
  } finally {
    freeze.stop();
  }
});

test('closed: where the baseline falls back for want of places, the rule is not told the form', () => {
  const words = new Map();
  const occurrence = (s, tense, chosen) => {
    words.set(s, { words: [{ w: 1, pos: 'V', feats: [tense], prefixes: [] }] });
    return { s, v: 1, slots: [1], chosen };
  };
  const known = [
    ...[1, 2, 3, 4].map((s) => occurrence(s, 'PERF', 'A')),
    ...[5, 6].map((s) => occurrence(s, 'IMPV', 'B')),
  ];
  const corpus = { at: (s) => words.get(s) };
  const at = formBaseline(known, corpus, majority(known));
  const problem = { id: 'invented', options: ['A', 'B'] };
  const rows = Array.from({ length: 12 }, (_, i) => {
    const occ = occurrence(100 + i, 'IMPV', 'B');
    // Two imperative build examples are too few: the baseline falls back on plain A.
    assert.equal(at.matched(occ), false);
    // The rule of the review, which learns B for imperatives from those two
    // examples. It is given only what ctx.slot() gives, and that is now empty here.
    const slot = shownForm(corpus.at(occ.s).words[0], at.matched(occ));
    assert.deepEqual(slot, { pos: null, feats: [] });
    const prediction = slot.feats.includes('IMPV') ? 'B' : 'A';
    return { problem, occ, prediction, baseline: at(occ), plainBaseline: 'A', unseen: false };
  });
  const score = scoreRows(rows, { draws: 5000 });
  assert.equal(score.gainOverBaseline, 0, 'so the form alone gains nothing there');
  // Where the form has enough places, the rule is told it, and so is the baseline.
  const past = occurrence(200, 'PERF', 'A');
  assert.equal(at.matched(past), true);
  assert.deepEqual(shownForm(corpus.at(200).words[0], true), { pos: 'V', feats: ['PERF'] });
});

test('closed: a challenge counts only for the test it names, and only if it holds', () => {
  const scoreboard = fs.readFileSync(path.join(ROOT_DIR, 'project/tools/scoreboard.mjs'), 'utf8');
  const selectorStart = scoreboard.indexOf('const current =');
  const selectorEnd = scoreboard.indexOf('const key =');
  assert.ok(selectorStart >= 0 && selectorEnd > selectorStart);
  const counted = (entry) => vm.runInNewContext(scoreboard.slice(selectorStart, selectorEnd) + '\n({passed})', { ledger: [entry], CENSUS_VERSION: 4 }).passed.length;
  const base = { id: 'R900', author: 'claude', status: 'passed', sha256: 'rule-hash', test: { censusVersion: 4, commit: 'new-commit' }, earlierTests: [{ censusVersion: 3, commit: 'old-commit' }] };
  const review = { by: 'codex', date: '2026-11-17', verdict: 'holds', censusVersion: 4, testCommit: 'new-commit', ruleSha256: 'rule-hash', notes: 'Invented review.' };
  assert.equal(counted({ ...base, challenge: review }), 1, 'a challenge of the present test that holds: counted');
  assert.equal(counted({ ...base, challenge: { by: 'codex', date: '2026-11-17', verdict: 'holds', notes: 'Names no test.' } }), 0);
  assert.equal(counted({ ...base, challenge: { ...review, censusVersion: 3, testCommit: 'old-commit' } }), 0, 'a challenge of the earlier test does not carry over');
  assert.equal(counted({ ...base, challenge: { ...review, ruleSha256: 'another-file' } }), 0);
  assert.equal(counted({ ...base, challenge: { ...review, by: 'claude' } }), 0, 'the author cannot challenge their own rule');
  assert.equal(counted({ ...base, challenge: { ...review, verdict: 'holds in part' } }), 0);
  assert.equal(counted({ ...base, challenge: { ...review, verdict: 'fine' } }), 0, 'an unknown verdict');
  // On a re-score the evaluator moves the old challenge aside with the old score.
  const run = fs.readFileSync(path.join(ROOT_DIR, 'project/tools/evaluate-run.mjs'), 'utf8');
  assert.match(run, /challenge: entry\.challenge \|\| null \}\]/, 'the old challenge is kept with the old test');
  assert.match(run, /entry\.challenge = null;/, 'and the new test starts without one');
});

test('the entry file loads nothing ahead of the guard except Node itself and the guard', () => {
  // Whatever evaluate.mjs imports directly is loaded before the guard exists.
  // Ask Node what that is: a loader hook registered first, in a child process, lists it.
  const recorder = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'quran-method4-entry-')), 'recorder.mjs');
  fs.writeFileSync(recorder, "import m from 'node:module';\nm.registerHooks({ resolve(s, c, n) { if (c.parentURL && c.parentURL.endsWith('/project/tools/evaluate.mjs')) console.log('ASKED ' + s); return n(s, c); } });\n");
  let out = '';
  try {
    out = execFileSync(process.execPath, ['--import', pathToFileURL(recorder).href, path.join(ROOT_DIR, 'project/tools/evaluate.mjs')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    out = String(e.stdout); // no rule named: the command is refused, after its imports were resolved
  }
  fs.rmSync(path.dirname(recorder), { recursive: true, force: true });
  const asked = out.split('\n').filter((l) => l.startsWith('ASKED ')).map((l) => l.slice(6).trim());
  assert.ok(asked.includes('./freeze.mjs'));
  assert.deepEqual(asked.filter((s) => !s.startsWith('node:') && s !== './freeze.mjs'), []);
});
