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
// On the build suras, problems are defined on one half and scored on the other,
// both ways. On the test suras, problems are defined on all the build suras.
//
// A rule passes if, on the test suras, it is right more often than the baseline
// with BOTH pGain and pGainBySura below 0.01 (one sign per place, and one sign
// per sura). The baseline is the most common option in the build suras; for
// near-synonym places, the most common option there in the same grammatical form.
//
// Order of work: the command is checked, then the ledger, then the rule's
// imports, then (for a test) that everything is committed and published. Only
// after all of that is the rule's code loaded and run.
//
// A rule file is named R###_name.mjs. It, and any helper it imports, may
// import only other .mjs files of this repository, by a relative path written
// out in the file. Anything else (require, a computed import, a package, a Node
// module) is refused, because it could not be frozen with the rule.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { LEDGER_DIR, CENSUS_VERSION, predictAll, scoreByType, openVault } from './lib.mjs';

const hashOf = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const rel = (f) => path.relative(ROOT_DIR, path.resolve(f)).replace(/\\/g, '/');

// ---------- 1. the command ----------
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

// ---------- 2. the ledger ----------
const sha256 = hashOf(file);
fs.mkdirSync(LEDGER_DIR, { recursive: true });
const ledgerFile = path.join(LEDGER_DIR, `${id}.json`);
const entry = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : {};
if (entry.test && entry.sha256 !== sha256) throw new Error(`${id} was frozen when it was tested, and its file has changed since. Give the changed rule a new id.`);
if (part === 'test' && entry.test) {
  const older = (entry.test.censusVersion || 1) < CENSUS_VERSION;
  if (!(has('--rescore') && older)) throw new Error(`${id} has already been scored on the test suras. A changed rule needs a new id.`);
}

// ---------- 3. the rule's imports, and 4. publication ----------
const inputs = inputsOf(file);
const commit = part === 'build' ? null : committedAndPushed(Object.keys(inputs));
if (part === 'vault') openVault();

// Everything a score depends on, with a hash of each file: the rule and what
// it imports (followed through, under the strict policy above), then the
// tools and what they import, the synonym list, the split and the text.
function inputsOf(ruleFile) {
  const seen = new Set();
  const inside = (abs) => {
    const r = path.relative(ROOT_DIR, abs);
    return r !== '' && !r.startsWith('..') && !path.isAbsolute(r);
  };
  const withoutComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const follow = (f, strict) => {
    const abs = path.resolve(f);
    if (seen.has(abs)) return;
    seen.add(abs);
    if (!abs.endsWith('.mjs')) return; // a data file: hashed, nothing to follow
    const src = withoutComments(fs.readFileSync(abs, 'utf8'));
    const where = path.relative(ROOT_DIR, abs).replace(/\\/g, '/');
    if (strict && /\brequire\s*\(|\bcreateRequire\b|\bimport\s*\(|\bimport\s*\.\s*meta\b/.test(src)) throw new Error(`${where}: a rule and its helpers may not use require, a computed import or import.meta. Import other .mjs files of this repository by a written-out relative path.`);
    const specs = [...src.matchAll(/\bimport\s*(?:[\w*${}\s,]+?\bfrom\s*)?['"]([^'"]+)['"]/g), ...src.matchAll(/\bexport\s*[\w*{}\s,]+?\bfrom\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const spec of specs) {
      const relative = spec.startsWith('./') || spec.startsWith('../');
      if (!relative) {
        if (strict) throw new Error(`${where}: imports "${spec}". A rule and its helpers may import only other .mjs files of this repository.`);
        continue; // the tools use Node's own modules
      }
      const target = path.resolve(path.dirname(abs), spec);
      if (strict && (!target.endsWith('.mjs') || !inside(target))) throw new Error(`${where}: imports "${spec}". A rule and its helpers may import only other .mjs files of this repository.`);
      follow(target, strict);
    }
  };
  follow(ruleFile, true);
  for (const f of ['project/tools/evaluate.mjs', 'project/tools/lib.mjs', 'project/tools/problems.mjs', 'project/synonyms.json', 'project/split.json', 'data/quran-morphology.txt', 'data/chronology.json']) follow(path.join(ROOT_DIR, f), false);
  return Object.fromEntries([...seen].map((f) => [rel(f), hashOf(f)]).sort((a, b) => (a[0] < b[0] ? -1 : 1)));
}

// Refuses a test unless every input is in the current commit, byte for byte,
// and that commit is on GitHub. A clean "git status" is not enough: a file
// that git ignores is not listed there, so each file is checked against the
// commit directly.
function committedAndPushed(files) {
  const git = (args) => execFileSync('git', args, { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
  const head = git(['rev-parse', 'HEAD']);
  const wrong = [];
  for (const f of files) {
    let committed = null;
    try {
      committed = git(['rev-parse', '--verify', '--quiet', `${head}:${f}`]);
    } catch {
      committed = null;
    }
    if (!committed) wrong.push(`${f}: not in the current commit`);
    else if (git(['hash-object', '--', f]) !== committed) wrong.push(`${f}: differs from the committed file`);
  }
  if (wrong.length) throw new Error(`Commit and push these before a test run:\n${wrong.join('\n')}`);
  try {
    git(['fetch', '--quiet', 'origin']);
  } catch {
    // offline: fall back on what is known of origin/main
  }
  try {
    git(['merge-base', '--is-ancestor', head, 'origin/main']);
  } catch {
    throw new Error('The current commit is not on origin/main. Push before a test run, so the rule and the method are on record first.');
  }
  return head;
}

const rule = (await import(pathToFileURL(path.resolve(file)).href)).default;
// ---------- 5. the rule itself ----------
for (const k of ['id', 'title', 'author', 'predict']) if (!rule[k]) throw new Error(`the rule must export ${k}`);
if (rule.id !== id) throw new Error(`the file is named ${id} but the rule calls itself ${rule.id}`);

const scores = scoreByType(predictAll(rule, part));
if (has('--dry')) {
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
