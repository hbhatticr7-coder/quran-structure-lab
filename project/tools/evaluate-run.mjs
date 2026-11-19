// The work of evaluate.mjs. Loaded through the guard of freeze.mjs; see
// evaluate.mjs for the commands.
//
// On the build suras, problems are defined on one half and scored on the other,
// both ways. On the test suras, problems are defined on all the build suras.
//
// A rule passes if, on the test suras, it is right more often than the baseline
// with BOTH pGain and pGainBySura below 0.01 (one sign per place, and one sign
// per sura). The baseline is the most common option in the build suras; for
// near-synonym places, the most common option there in the same grammatical form.
//
// A rule file is named R###_name.mjs. It, and any helper it imports, may
// import only other .mjs files of this repository, by a relative path written
// out in the file. Anything else is refused, because it could not be frozen
// with the rule.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { LEDGER_DIR, CENSUS_VERSION, predictAll, scoreByType, openVault } from './lib.mjs';

// Files that are read, not imported.
const DATA = ['project/synonyms.json', 'project/split.json', 'data/quran-morphology.txt', 'data/chronology.json'];

export async function run(freeze, { file, id, part, dry, rescore }) {
  // ---------- the ledger ----------
  const sha256 = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
  const ledgerFile = path.join(LEDGER_DIR, `${id}.json`);
  const entry = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8')) : {};
  if (entry.test && entry.sha256 !== sha256) throw new Error(`${id} was frozen when it was tested, and its file has changed since. Give the changed rule a new id.`);
  if (part === 'test' && entry.test) {
    const older = (entry.test.censusVersion || 1) < CENSUS_VERSION;
    if (!(rescore && older)) throw new Error(`${id} has already been scored on the test suras. A changed rule needs a new id.`);
  }

  // ---------- the data files, and publication ----------
  freeze.add(DATA);
  const commit = part === 'build' ? null : freeze.published();
  if (part === 'vault') openVault();

  // ---------- the rule ----------
  const rule = (await freeze.rule(file)).default;
  for (const k of ['id', 'title', 'author', 'predict']) if (!rule[k]) throw new Error(`the rule must export ${k}`);
  if (rule.id !== id) throw new Error(`the file is named ${id} but the rule calls itself ${rule.id}`);

  const scores = scoreByType(predictAll(rule, part));
  freeze.verify();
  const inputs = freeze.inputs();
  freeze.stop();
  if (dry) {
    console.log(`${rule.id} on the build suras (dry run, nothing recorded)`);
    console.table(scores);
    return;
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
    // An earlier test moves aside together with its status and with the
    // challenge that reviewed it. A challenge belongs to one test; the new
    // score starts without one.
    if (entry.test) {
      entry.earlierTests = [...(entry.earlierTests || []), { ...entry.test, censusVersion: entry.test.censusVersion || 1, status: entry.status, challenge: entry.challenge || null }];
    }
    entry.sha256 = sha256;
    entry.test = { date: stamp, censusVersion: CENSUS_VERSION, commit, inputs, ...scores };
    const a = scores.all;
    entry.status = a.answered > 0 && a.gainOverBaseline > 0 && a.pGain < 0.01 && a.pGainBySura < 0.01 ? 'passed' : 'failed';
    entry.challenge = null;
  } else {
    entry.vault = { date: stamp, censusVersion: CENSUS_VERSION, commit, inputs, ...scores };
  }
  fs.writeFileSync(ledgerFile, JSON.stringify(entry, null, 2) + '\n');
  console.log(`${rule.id} on the ${part} suras${part === 'test' ? ` -> ${entry.status}` : ''}`);
  console.table(scores);
}
