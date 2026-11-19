// Scores one rule and records the result in project/ledger/.
//
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs          build suras; run as often as you like
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --dry    the same, without recording anything
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --test   test suras; ONCE per rule, then the rule is frozen
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --test --rescore
//        only for a rule tested under an older method version, with its file unchanged;
//        the old score is kept beside the new one
//   node project/tools/evaluate.mjs project/rules/R001_echo.mjs --vault --owner-approved   only when the owner has asked for it
//
// This file only checks the command and starts the guard of freeze.mjs. The
// work is in evaluate-run.mjs, which is loaded through that guard, like every
// other file of code the run uses. KEEP IT THAT WAY: this file must import
// nothing but Node's own modules and ./freeze.mjs, because whatever it imports
// directly is loaded before the guard exists.
//
// Order of work: the command is checked; the guard starts; the tools are
// loaded (for a test, each file is first compared with the current commit);
// the ledger is checked; the data files and publication are checked; and only
// then is the rule's code loaded, each of its files checked in the same way
// before any of it runs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startFreeze } from './freeze.mjs';

const args = process.argv.slice(2);
const KNOWN = ['--dry', '--test', '--rescore', '--vault', '--owner-approved'];
const flags = new Set(args.filter((a) => a.startsWith('--')));
const has = (flag) => flags.has(flag);
const file = args.find((a) => !a.startsWith('--'));
for (const f of flags) if (!KNOWN.includes(f)) throw new Error(`unknown option ${f}`);
if (!file) throw new Error('usage: node project/tools/evaluate.mjs <rule file> [--dry | --test [--rescore] | --vault --owner-approved]');
if (has('--test') && has('--vault')) throw new Error('--test and --vault cannot be combined');
const part = has('--vault') ? 'vault' : has('--test') ? 'test' : 'build';
if (has('--dry') && part !== 'build') throw new Error('--dry is for the build suras only');
if (has('--rescore') && part !== 'test') throw new Error('--rescore goes with --test');
if (part === 'vault' && !has('--owner-approved')) throw new Error('The vault is opened only when the owner asks for it. See PROJECT.md.');
if (!fs.existsSync(file)) throw new Error(`no such file: ${file}`);
const id = (path.basename(file).match(/^(R\d{3})_[\w-]+\.mjs$/) || [])[1];
if (!id) throw new Error('a rule file is named R###_name.mjs');

const here = path.dirname(fileURLToPath(import.meta.url));
const freeze = startFreeze({ root: path.resolve(here, '..', '..'), check: part !== 'build' });
freeze.add(['project/tools/evaluate.mjs', 'project/tools/freeze.mjs']);
const { run } = await freeze.tools(path.join(here, 'evaluate-run.mjs'));
await run(freeze, { file, id, part, dry: has('--dry'), rescore: has('--rescore') });
