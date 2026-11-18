// Codex's independent method-4 review. All data here are invented. The Git
// fixtures have local, disposable origins; no real corpus or ledger is read.
// Diagnostic assertions reproduce remaining gaps, rather than silently
// treating the existing guard suite as proof that every import is frozen.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { formBaseline, majority, scoreRows } from '../tools/lib.mjs';

const source = fs.readFileSync(path.join(ROOT_DIR, 'project/tools/evaluate.mjs'), 'utf8');
const start = source.indexOf('function inputsOf(');
const end = source.indexOf('const rule =');
assert.ok(start >= 0 && end > start, 'update the harness if evaluator structure changes');
const functions = source.slice(start, end);
const hashOf = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

// As in the version-3 review, run the production guard functions verbatim,
// replacing only their filesystem root and subprocess environment.
function fixture(t, ruleSource) {
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
    '.gitignore': helper + '\n',
    'project/rules/R900_fixture.mjs': ruleSource,
    [helper]: 'export const value = 1; export default value;\n',
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
  const guard = vm.runInNewContext(functions + '\n({inputsOf, committedAndPushed})', {
    fs, path, ROOT_DIR: root, execFileSync: execute, hashOf,
    rel: (f) => path.relative(root, path.resolve(f)).replace(/\\/g, '/'),
  });
  return { root, helper, git, guard, rule: path.join(root, 'project/rules/R900_fixture.mjs') };
}

test('control: an ordinary ignored relative import is frozen and refused', (t) => {
  const f = fixture(t, "import value from './private.mjs';\nexport default value;\n");
  const inputs = f.guard.inputsOf(f.rule);
  assert.ok(Object.hasOwn(inputs, f.helper));
  assert.throws(() => f.guard.committedAndPushed(Object.keys(inputs)), /not in the current commit/);
});

const missedImports = [
  ['an inline comment between the import binding and from',
    "import value // explanation\n from './private.mjs';\nexport default value;\n"],
  ['a quoted imported name',
    "import { 'value' as value } from './private.mjs';\nexport default value;\n"],
  ['comment delimiters inside ordinary strings',
    "const opening = '/*';\nimport value from './private.mjs';\nconst closing = '*/';\nexport default value;\n"],
];
for (const [name, ruleSource] of missedImports) {
  test(`gap: ${name} hides an executable, uncommitted helper`, async (t) => {
    const f = fixture(t, ruleSource);
    const inputs = f.guard.inputsOf(f.rule);
    assert.equal(Object.hasOwn(inputs, f.helper), false, 'the scanner misses the helper');
    assert.throws(() => f.git(['cat-file', '-e', `HEAD:${f.helper}`]));
    assert.equal(f.guard.committedAndPushed(Object.keys(inputs)), f.git(['rev-parse', 'HEAD']));
    fs.writeFileSync(path.join(f.root, f.helper), 'export const value = 2; export default value;\n');
    assert.deepEqual(f.guard.inputsOf(f.rule), inputs, 'changing executable input leaves the recorded hashes unchanged');
    assert.equal(f.guard.committedAndPushed(Object.keys(inputs)), f.git(['rev-parse', 'HEAD']));
    const executed = await import(pathToFileURL(f.rule).href);
    assert.equal(executed.default, 2, 'Node really executes the unfrozen helper');
  });
}

test('method 4: a slot-only rule can beat the sparse-form fallback', () => {
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
    // A rule can learn B from the two imperative build examples, without
    // seeing any surrounding word. The baseline falls back to plain A.
    const prediction = corpus.at(occ.s).words[0].feats.includes('IMPV') ? 'B' : 'A';
    return { problem, occ, prediction, baseline: at(occ), plainBaseline: 'A', unseen: false };
  });
  const score = scoreRows(rows, { draws: 5000 });
  assert.equal(score.accuracy, 1);
  assert.equal(score.baselineAccuracy, 0);
  assert.ok(score.pGain < 0.01 && score.pGainBySura < 0.01);
});

test('gap: an earlier-method challenge qualifies a later-method pass', () => {
  const scoreboard = fs.readFileSync(path.join(ROOT_DIR, 'project/tools/scoreboard.mjs'), 'utf8');
  const selectorStart = scoreboard.indexOf('const current =');
  const selectorEnd = scoreboard.indexOf('const key =');
  assert.ok(selectorStart >= 0 && selectorEnd > selectorStart);
  const entry = {
    id: 'R900', author: 'claude', status: 'passed',
    test: { censusVersion: 4 },
    earlierTests: [{ censusVersion: 3 }],
    challenge: { by: 'codex', date: '2026-11-17', verdict: 'holds', notes: 'Invented earlier-method review.' },
  };
  const { passed } = vm.runInNewContext(scoreboard.slice(selectorStart, selectorEnd) + '\n({passed})', {
    ledger: [entry], CENSUS_VERSION: 4,
  });
  assert.equal(passed.length, 1, 'the new score inherits the old review without a new challenge');
  assert.match(source, /entry\.challenge = entry\.challenge \|\| null/, 'the evaluator retains that old challenge on rescore');
});
