// Scores one rule and records the result in project/ledger/.
//
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs          build suras; run as often as you like
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --test   test suras; ONCE per rule, then the rule is frozen
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --vault --owner-approved   only when the owner has asked for it
//
// A rule passes if, on the test suras, it is right more often than the baseline
// (the most common option in the build suras) with pGain below 0.01.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { LEDGER_DIR, predictAll, scoreByType } from './lib.mjs';

const file = process.argv[2];
if (!file) throw new Error('usage: node project/tools/evaluate.mjs <rule file> [--test]');
const part = process.argv.includes('--vault') ? 'vault' : process.argv.includes('--test') ? 'test' : 'build';
if (part === 'vault' && !process.argv.includes('--owner-approved')) throw new Error('The vault is opened only when the owner asks for it. See PROJECT.md.');

const rule = (await import(pathToFileURL(path.resolve(file)).href)).default;
for (const k of ['id', 'title', 'author', 'predict']) if (!rule[k]) throw new Error(`the rule must export ${k}`);
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
fs.mkdirSync(LEDGER_DIR, { recursive: true });
const ledgerFile = path.join(LEDGER_DIR, `${rule.id}.json`);
const entry = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : {};
if (part === 'test' && entry.test) throw new Error(`${rule.id} has already been scored on the test suras. A changed rule needs a new id.`);
if (part === 'build' && entry.test && entry.sha256 !== sha256) throw new Error(`${rule.id} was frozen when it was tested, and its file has changed since. Give the changed rule a new id.`);

const scores = scoreByType(predictAll(rule, part));
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
  entry.build = { date: stamp, sha256, ...scores };
  entry.buildRuns = (entry.buildRuns || 0) + 1;
  entry.status = entry.status || 'proposed';
} else if (part === 'test') {
  entry.sha256 = sha256;
  entry.test = { date: stamp, ...scores };
  const a = scores.all;
  entry.status = a.answered > 0 && a.gainOverBaseline > 0 && a.pGain < 0.01 ? 'passed' : 'failed';
  entry.challenge = entry.challenge || null;
} else {
  entry.vault = { date: stamp, ...scores };
}
fs.writeFileSync(ledgerFile, JSON.stringify(entry, null, 2) + '\n');
console.log(`${rule.id} on the ${part} suras${part === 'test' ? ` -> ${entry.status}` : ''}`);
console.table(scores);
