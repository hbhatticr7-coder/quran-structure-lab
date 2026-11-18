// Independent diagnostics for version 3. These reproduce gaps, not desired
// behavior. Uses invented text and disposable local Git repositories only.
// Neither the real corpus nor the real project's Git settings are changed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { ROOT_DIR, MORPH_PATH } from '../../src/corpus.mjs';

const source = fs.readFileSync(path.join(ROOT_DIR, 'project/tools/evaluate.mjs'), 'utf8');
const inputStart = source.indexOf('function inputsOf(');
const gitStart = source.indexOf('function committedAndPushed(');
const mainStart = source.indexOf('const rule =');
assert.ok(inputStart >= 0 && gitStart > inputStart && mainStart > gitStart, 'update the diagnostic harness if evaluator structure changes');
const guardFunctions = source.slice(inputStart, mainStart);
const hashOf = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

test('gap: excluded morphology is parsed before loadText drops it', async () => {
  const { loadText } = await import('../tools/lib.mjs?v3-loader-diagnostic');
  const excluded = '4:1:1\treserved_fixture\tN\tLEM:reserved_fixture|ROOT:RESERVED';
  const replacements = new Map([
    [MORPH_PATH, '1:1:1\tbuild_fixture\tN\tLEM:build_fixture|ROOT:BUILD\n' + excluded],
    [path.join(ROOT_DIR, 'project/split.json'), JSON.stringify({ build: [1], test: [3], vault: [4] })],
    [path.join(ROOT_DIR, 'data/chronology.json'), JSON.stringify({ suras: [{ sura: 1 }, { sura: 3 }, { sura: 4 }] })],
  ]);
  const originalRead = fs.readFileSync, originalSplit = String.prototype.split;
  let parsedExcludedPayload = false;
  fs.readFileSync = function (file, options) {
    const name = path.resolve(String(file));
    if (replacements.has(name)) return options === 'utf8' ? replacements.get(name) : Buffer.from(replacements.get(name));
    if (name.startsWith(path.join(ROOT_DIR, 'data') + path.sep) || name.startsWith(path.join(ROOT_DIR, 'project/sites') + path.sep)) throw new Error('real corpus access forbidden');
    return originalRead.call(this, file, options);
  };
  String.prototype.split = function (separator, ...rest) {
    if (String(this) === excluded && separator === '\t') parsedExcludedPayload = true;
    return originalSplit.call(this, separator, ...rest);
  };
  try {
    const result = loadText('build');
    assert.equal(result.corpus.at(4, 1), undefined, 'returned data is correctly filtered');
    assert.equal(parsedExcludedPayload, true, 'but the excluded line was parsed first');
  } finally {
    fs.readFileSync = originalRead;
    String.prototype.split = originalSplit;
  }
});

function fixture(t, ruleSource, extraFiles, ignored = []) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'quran-v3-guard-audit-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const root = path.join(temporary, 'work'), remote = path.join(temporary, 'origin.git');
  fs.mkdirSync(root);
  const environment = { ...process.env,
    GIT_AUTHOR_NAME: 'Synthetic audit', GIT_AUTHOR_EMAIL: 'audit@example.invalid',
    GIT_COMMITTER_NAME: 'Synthetic audit', GIT_COMMITTER_EMAIL: 'audit@example.invalid',
    GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null',
  };
  const execute = (command, args, options = {}) => execFileSync(command, args, { ...options, env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
  const git = (args) => execute('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git(['init', '--quiet', '--bare', remote]);
  git(['init', '--quiet', '--initial-branch=main']);
  const defaults = Object.fromEntries([
    'project/tools/evaluate.mjs', 'project/tools/lib.mjs', 'project/tools/problems.mjs',
    'project/synonyms.json', 'project/split.json', 'data/quran-morphology.txt', 'data/chronology.json',
  ].map((f) => [f, f.endsWith('.mjs') ? 'export {};\n' : 'synthetic fixture\n']));
  const files = { ...defaults, '.gitignore': ignored.join('\n') + '\n', 'project/rules/R900_fixture.mjs': ruleSource, ...extraFiles };
  for (const [file, text] of Object.entries(files)) {
    const absolute = path.join(root, file);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, text);
  }
  git(['add', '.']);
  git(['commit', '--quiet', '-m', 'Synthetic fixture']);
  git(['remote', 'add', 'origin', remote]);
  git(['push', '--quiet', '-u', 'origin', 'main']);
  // Execute the production functions verbatim, supplying only the fixture root.
  const guard = vm.runInNewContext(guardFunctions + '\n({inputsOf, committedAndPushed})', {
    fs, path, ROOT_DIR: root, execFileSync: execute, hashOf,
    rel: (f) => path.relative(root, path.resolve(f)).replace(/\\/g, '/'),
  });
  return { root, git, guard, rule: path.join(root, 'project/rules/R900_fixture.mjs') };
}

test('gap: ignored uncommitted imported helper passes the published-input guard', (t) => {
  const helper = 'project/rules/private.mjs', ordinary = 'project/rules/ordinary.mjs';
  const f = fixture(t, "import './private.mjs';\nimport './ordinary.mjs';\nexport default {};\n", {
    [helper]: 'export const choice = 1;\n', [ordinary]: 'export const choice = 2;\n',
  }, [helper]);
  const inputs = f.guard.inputsOf(f.rule);
  assert.ok(Object.hasOwn(inputs, helper), 'helper is hashed');
  assert.throws(() => f.git(['cat-file', '-e', `HEAD:${helper}`]), 'helper has no committed blob');
  assert.equal(f.guard.committedAndPushed(Object.keys(inputs)), f.git(['rev-parse', 'HEAD']), 'nevertheless accepted');
  // Positive control: ordinary tracked edits do get rejected.
  fs.writeFileSync(path.join(f.root, ordinary), 'export const choice = 3;\n');
  assert.throws(() => f.guard.committedAndPushed(Object.keys(inputs)), /Commit and push/);
});

test('gap: a changed transitive CommonJS helper is absent from frozen inputs', (t) => {
  const bridge = 'project/rules/bridge.cjs', leaf = 'project/rules/leaf.cjs';
  const f = fixture(t, "import value from './bridge.cjs';\nexport default value;\n", {
    [bridge]: "module.exports = require('./leaf.cjs');\n", [leaf]: 'module.exports = { value: 1 };\n',
  });
  fs.writeFileSync(path.join(f.root, leaf), 'module.exports = { value: 2 };\n');
  const inputs = f.guard.inputsOf(f.rule);
  assert.ok(Object.hasOwn(inputs, bridge));
  assert.equal(Object.hasOwn(inputs, leaf), false, 'only .mjs files are traversed');
  assert.ok(f.git(['status', '--porcelain', '--', leaf]).includes(leaf), 'the dependency is modified');
  assert.equal(f.guard.committedAndPushed(Object.keys(inputs)), f.git(['rev-parse', 'HEAD']), 'change is outside the guard list');
});
