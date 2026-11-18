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
// (the most common option in the build suras) with pGain below 0.01.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { LEDGER_DIR, CENSUS_VERSION, predictAll, scoreByType } from './lib.mjs';

const file = process.argv[2];
const has = (flag) => process.argv.includes(flag);
if (!file) throw new Error('usage: node project/tools/evaluate.mjs <rule file> [--dry | --test]');
const part = has('--vault') ? 'vault' : has('--test') ? 'test' : 'build';
if (part === 'vault' && !has('--owner-approved')) throw new Error('The vault is opened only when the owner asks for it. See PROJECT.md.');

const rule = (await import(pathToFileURL(path.resolve(file)).href)).default;
for (const k of ['id', 'title', 'author', 'predict']) if (!rule[k]) throw new Error(`the rule must export ${k}`);
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
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
  entry.test = { date: stamp, censusVersion: CENSUS_VERSION, ...scores };
  const a = scores.all;
  entry.status = a.answered > 0 && a.gainOverBaseline > 0 && a.pGain < 0.01 ? 'passed' : 'failed';
  entry.challenge = entry.challenge || null;
} else {
  entry.vault = { date: stamp, censusVersion: CENSUS_VERSION, ...scores };
}
fs.writeFileSync(ledgerFile, JSON.stringify(entry, null, 2) + '\n');
console.log(`${rule.id} on the ${part} suras${part === 'test' ? ` -> ${entry.status}` : ''}`);
console.table(scores);
