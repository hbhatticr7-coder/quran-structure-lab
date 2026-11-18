// Scores one rule and records the result in project/ledger/.
//
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs          build suras; run as often as you like
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --dry    the same, without recording anything
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --test   test suras; ONCE per rule, then the rule is frozen
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --test --rescore
//        only for a rule tested under an older census version, with its file unchanged;
//        the old score is kept beside the new one
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --vault --owner-approved   only when the owner has asked for it
//
// On the build suras, problems are defined on one half and scored on the other,
// both ways. On the test suras, problems are defined on all the build suras.
//
// A rule passes if, on the test suras, it is right more often than the baseline
// (the most common option in the build suras) with BOTH pGain and pGainBySura
// below 0.01 (each place counted once, and each sura counted once).
//
// A test run is refused unless everything the score depends on (the rule, the
// files it imports, these tools, the list of synonyms, the split, the text) is
// committed and pushed. The hashes and the commit are written to the ledger.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { LEDGER_DIR, CENSUS_VERSION, predictAll, scoreByType, openVault } from './lib.mjs';

const file = process.argv[2];
const has = (flag) => process.argv.includes(flag);
if (!file) throw new Error('usage: node project/tools/evaluate.mjs <rule file> [--dry | --test]');
const part = has('--vault') ? 'vault' : has('--test') ? 'test' : 'build';
if (part === 'vault' && !has('--owner-approved')) throw new Error('The vault is opened only when the owner asks for it. See PROJECT.md.');
if (part === 'vault') openVault();

const hashOf = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const rel = (f) => path.relative(ROOT_DIR, path.resolve(f)).replace(/\\/g, '/');

// Everything a score depends on: the rule, whatever it imports from this
// repository (followed through), the tools, the synonym list, the split and the text.
function inputsOf(ruleFile) {
  const seen = new Set();
  const follow = (f) => {
    const abs = path.resolve(f);
    if (seen.has(abs)) return;
    seen.add(abs);
    if (!abs.endsWith('.mjs')) return;
    for (const m of fs.readFileSync(abs, 'utf8').matchAll(/(?:from|import)\s*\(?\s*['"](\.{1,2}\/[^'"]+)['"]/g)) follow(path.resolve(path.dirname(abs), m[1]));
  };
  follow(ruleFile);
  for (const f of ['project/tools/evaluate.mjs', 'project/tools/lib.mjs', 'project/tools/problems.mjs', 'project/synonyms.json', 'project/split.json', 'data/quran-morphology.txt', 'data/chronology.json']) follow(path.join(ROOT_DIR, f));
  return Object.fromEntries([...seen].map((f) => [rel(f), hashOf(f)]).sort((a, b) => (a[0] < b[0] ? -1 : 1)));
}

// Refuses a test unless every input is committed and the commit is on GitHub.
function committedAndPushed(files) {
  const git = (args) => execFileSync('git', args, { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  const dirty = git(['status', '--porcelain', '--', ...files]);
  if (dirty) throw new Error(`Commit and push these before a test run:\n${dirty}`);
  try {
    git(['fetch', '--quiet', 'origin']);
  } catch {
    // offline: fall back on what is known of origin/main
  }
  const head = git(['rev-parse', 'HEAD']);
  try {
    git(['merge-base', '--is-ancestor', head, 'origin/main']);
  } catch {
    throw new Error('The current commit is not on origin/main. Push before a test run, so the rule and the method are on record first.');
  }
  return head;
}

const rule = (await import(pathToFileURL(path.resolve(file)).href)).default;
for (const k of ['id', 'title', 'author', 'predict']) if (!rule[k]) throw new Error(`the rule must export ${k}`);
const sha256 = hashOf(file);
const inputs = inputsOf(file);
const commit = part === 'build' ? null : committedAndPushed(Object.keys(inputs));
fs.mkdirSync(LEDGER_DIR, { recursive: true });
const ledgerFile = path.join(LEDGER_DIR, `${rule.id}.json`);
const entry = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : {};
if (entry.test && entry.sha256 !== sha256) throw new Error(`${rule.id} was frozen when it was tested, and its file has changed since. Give the changed rule a new id.`);
if (part === 'test' && entry.test) {
  const older = (entry.test.censusVersion || 1) < CENSUS_VERSION;
  if (!(has('--rescore') && older)) throw new Error(`${rule.id} has already been scored on the test suras. A changed rule needs a new id.`);
}

const scores = scoreByType(predictAll(rule, part));
if (has('--dry')) {
  if (part !== 'build') throw new Error('--dry is for the build suras only');
  console.log(`${rule.id} on the build suras (dry run, nothing recorded)`);
  console.table(scores);
  process.exit(0);
}
const stamp = new Date().toISOString().slice(0, 10);
Object.assign(entry, {
  id: rule.id,
  title: rule.title,
  author: rule.author,
  provenance: rule.provenance || null,
  appliesTo: rule.appliesTo || 'all types',
  file: path.relative(process.cwd(), file).replace(/\\/g, '/'),
});
if (part === 'build') {
  entry.build = { date: stamp, censusVersion: CENSUS_VERSION, sha256, ...scores };
  entry.buildRuns = (entry.buildRuns || 0) + 1;
  entry.status = entry.status || 'proposed';
} else if (part === 'test') {
  if (entry.test) {
    entry.earlierTests = [...(entry.earlierTests || []), { ...entry.test, censusVersion: entry.test.censusVersion || 1, status: entry.status }];
  }
  entry.sha256 = sha256;
  entry.test = { date: stamp, censusVersion: CENSUS_VERSION, commit, inputs, ...scores };
  const a = scores.all;
  entry.status = a.answered > 0 && a.gainOverBaseline > 0 && a.pGain < 0.01 && a.pGainBySura < 0.01 ? 'passed' : 'failed';
  entry.challenge = entry.challenge || null;
} else {
  entry.vault = { date: stamp, censusVersion: CENSUS_VERSION, commit, inputs, ...scores };
}
fs.writeFileSync(ledgerFile, JSON.stringify(entry, null, 2) + '\n');
console.log(`${rule.id} on the ${part} suras${part === 'test' ? ` -> ${entry.status}` : ''}`);
console.table(scores);
