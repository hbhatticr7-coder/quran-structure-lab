// Checks on the loader and on the guard that runs before a test, using
// invented text and disposable local Git repositories only. Neither the real
// corpus nor the real project's Git settings are touched.
//
// Written by codex for its review of version 3 (project/CENSUS_V3_REVIEW.md),
// where the three checks reproduced gaps. Changed by claude on 2026-11-18 for
// method version 4: each now checks that its gap is closed, as the review
// asked. The fixture builder is as codex wrote it.
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

test('closed in version 4: the lines of an excluded sura are skipped unparsed', async () => {
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
    assert.equal(result.corpus.at(4, 1), undefined, 'returned data is filtered');
    assert.ok(result.corpus.at(1, 1), 'the allowed sura is loaded');
    assert.equal(parsedExcludedPayload, false, 'and the excluded line was never split into fields');
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

test('closed in version 4: an imported helper that git ignores and nobody committed is refused', (t) => {
  const helper = 'project/rules/private.mjs';
  const f = fixture(t, "import './private.mjs';\nexport default {};\n", { [helper]: 'export const choice = 1;\n' }, [helper]);
  const inputs = f.guard.inputsOf(f.rule);
  assert.ok(Object.hasOwn(inputs, helper), 'helper is hashed');
  assert.throws(() => f.git(['cat-file', '-e', `HEAD:${helper}`]), 'helper has no committed blob');
  assert.equal(f.git(['status', '--porcelain', '--', helper]), '', 'git status does not list it');
  assert.throws(() => f.guard.committedAndPushed(Object.keys(inputs)), /private\.mjs: not in the current commit/);
});

test('version 4: published inputs pass; an edited or unpushed one is refused', (t) => {
  const child = 'project/rules/child.mjs', leaf = 'project/rules/leaf.mjs';
  const f = fixture(t, "import './child.mjs';\nexport default {};\n", {
    [child]: "export { value } from './leaf.mjs';\n", [leaf]: 'export const value = 1;\n',
  });
  const inputs = f.guard.inputsOf(f.rule);
  assert.ok(Object.hasOwn(inputs, child) && Object.hasOwn(inputs, leaf), 'the helper and the helper it imports are both frozen');
  assert.equal(f.guard.committedAndPushed(Object.keys(inputs)), f.git(['rev-parse', 'HEAD']), 'everything committed and pushed: accepted');
  // A change two imports away from the rule is caught.
  fs.writeFileSync(path.join(f.root, leaf), 'export const value = 2;\n');
  assert.throws(() => f.guard.committedAndPushed(Object.keys(inputs)), /leaf\.mjs: differs from the committed file/);
  // Committed but not pushed is caught too.
  f.git(['add', '.']);
  f.git(['commit', '--quiet', '-m', 'Synthetic change, not pushed']);
  assert.throws(() => f.guard.committedAndPushed(Object.keys(inputs)), /not on origin\/main/);
});

test('closed in version 4: a rule may import only written-out .mjs files of the repository', (t) => {
  const refused = (ruleSource, extra, pattern) => {
    const f = fixture(t, ruleSource, extra);
    assert.throws(() => f.guard.inputsOf(f.rule), pattern);
  };
  // A CommonJS helper (the review's case): refused outright, so nothing behind it can go unfrozen.
  refused("import value from './bridge.cjs';\nexport default value;\n", { 'project/rules/bridge.cjs': "module.exports = require('./leaf.cjs');\n", 'project/rules/leaf.cjs': 'module.exports = { value: 1 };\n' }, /may import only other \.mjs files/);
  // The same reached through an .mjs helper.
  refused("import './helper.mjs';\nexport default {};\n", { 'project/rules/helper.mjs': "import { createRequire } from 'node:module';\nexport const r = createRequire(import.meta.url);\n" }, /may not use require, a computed import or import\.meta/);
  // A computed import.
  refused("const name = './x.mjs';\nexport default { load: () => import(name) };\n", {}, /may not use require, a computed import or import\.meta/);
  // A Node module (a rule has no business reading files).
  refused("import fs from 'node:fs';\nexport default { fs };\n", {}, /imports "node:fs"/);
  // A file outside the repository.
  refused("import '../../../outside.mjs';\nexport default {};\n", {}, /may import only other \.mjs files/);
});
