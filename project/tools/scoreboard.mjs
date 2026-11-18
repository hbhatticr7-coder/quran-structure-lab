// Writes SCOREBOARD.md from the ledger.
//
// The headline is measured on the test suras only: for every choice there, how
// often the right option is predicted (a) by the baseline alone and (b) by the
// rules that have passed, falling back on the baseline where no rule answers.
// Where two passed rules answer the same choice, the one with the higher
// accuracy on the BUILD suras is used, so the test suras play no part in the pick.
//
// Usage: node project/tools/scoreboard.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { TYPES, CENSUS_VERSION, predictAll, readLedger } from './lib.mjs';

const ledger = readLedger();
const current = (e) => e.test && (e.test.censusVersion || 1) === CENSUS_VERSION;
const passed = ledger.filter((e) => e.status === 'passed' && current(e)).sort((a, b) => (b.build?.all?.accuracy || 0) - (a.build?.all?.accuracy || 0));

const key = (r) => `${r.problem.id}|${r.occ.s}:${r.occ.v}:${r.occ.slots.join(',')}`;
const byRule = [];
for (const e of passed) {
  const rule = (await import(pathToFileURL(path.join(ROOT_DIR, e.file)).href)).default;
  const map = new Map();
  for (const r of predictAll(rule, 'test')) if (r.prediction !== null) map.set(key(r), r.prediction);
  byRule.push(map);
}

const stat = Object.fromEntries(TYPES.map((t) => [t, { n: 0, base: 0, rules: 0, answeredByRule: 0 }]));
for (const r of predictAll(null, 'test')) {
  const s = stat[r.problem.type];
  s.n++;
  const baseScore = r.baseline === null ? 1 / r.problem.options.length : r.baseline === r.occ.chosen ? 1 : 0;
  s.base += baseScore;
  const hit = byRule.find((m) => m.has(key(r)));
  if (hit) {
    s.answeredByRule++;
    s.rules += hit.get(key(r)) === r.occ.chosen ? 1 : 0;
  } else s.rules += baseScore;
}
const tot = Object.values(stat).reduce((t, s) => ({ n: t.n + s.n, base: t.base + s.base, rules: t.rules + s.rules, answeredByRule: t.answeredByRule + s.answeredByRule }), { n: 0, base: 0, rules: 0, answeredByRule: 0 });
const pct = (x, n) => (n ? `${((100 * x) / n).toFixed(1)}%` : 'n/a');
const num = (x) => x.toLocaleString('en');
const NAME = { frame: 'repeated phrase, one word changed', synonym: 'near-synonyms', ending: 'word closing a verse', order: 'order of a pair' };

const md = [
  '# Scoreboard',
  '',
  `Written by \`project/tools/scoreboard.mjs\` (census version ${CENSUS_VERSION}). Do not edit by hand.`,
  '',
  '## Headline',
  '',
  `On the test suras there are **${num(tot.n)} choices**. Guessing the commonest option gets **${pct(tot.base, tot.n)}** right. With the rules that have passed, **${pct(tot.rules, tot.n)}** are predicted correctly.`,
  '',
  '| Type of choice | Choices in test suras | Right by baseline | Right with passed rules | Choices a passed rule answers |',
  '|---|---|---|---|---|',
  ...TYPES.map((t) => `| ${NAME[t]} | ${num(stat[t].n)} | ${pct(stat[t].base, stat[t].n)} | ${pct(stat[t].rules, stat[t].n)} | ${num(stat[t].answeredByRule)} |`),
  `| **all** | ${num(tot.n)} | ${pct(tot.base, tot.n)} | ${pct(tot.rules, tot.n)} | ${num(tot.answeredByRule)} |`,
  '',
  'The baseline is the option used most often for the same choice in the build suras; where there is none, a random guess.',
  '',
  '## Rules',
  '',
  `${ledger.length} tried: ${ledger.filter((e) => e.status === 'passed').length} passed, ${ledger.filter((e) => e.status === 'failed').length} failed, ${ledger.filter((e) => e.status === 'proposed').length} not yet tested.`,
  '',
  '| Rule | By | Status | Test: answered | Test: right | Baseline on the same | p (better than baseline) | Checked by the other model |',
  '|---|---|---|---|---|---|---|---|',
  ...ledger.map((e) => {
    const t = e.test ? e.test.all : null;
    const old = e.test && !current(e) ? ' (older census)' : '';
    return `| ${e.id}: ${e.title} | ${e.author} | ${e.status}${old} | ${t ? `${num(t.answered)} of ${num(t.occurrences)}` : ''} | ${t ? pct(t.correct, t.answered) : ''} | ${t ? pct(t.baselineAccuracy * t.answered, t.answered) : ''} | ${t ? t.pGain : ''} | ${e.challenge ? `${e.challenge.by}: ${e.challenge.verdict}` : 'not yet'} |`;
  }),
  '',
];
fs.writeFileSync(path.join(ROOT_DIR, 'SCOREBOARD.md'), md.join('\n'));
console.log(md.slice(4, 16).join('\n'));
