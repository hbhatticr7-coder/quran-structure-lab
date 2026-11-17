// Writes SCOREBOARD.md from the census and the ledger.
//
// The headline is measured on the test suras only: for every choice there, how
// often the right option is predicted (a) by the baseline alone and (b) by the
// rules that have passed, falling back on the baseline where no rule answers.
//
// Usage: node project/tools/scoreboard.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { TYPES, loadProblems, loadSplit, majority, predictAll, readLedger } from './lib.mjs';

const split = loadSplit();
const problems = loadProblems();
const ledger = readLedger();
const passed = ledger.filter((e) => e.status === 'passed').sort((a, b) => b.test.all.accuracy - a.test.all.accuracy);

// prediction of each passed rule for each test occurrence
const key = (p, o) => `${p.id}|${o.s}:${o.v}:${o.slots.join(',')}`;
const byRule = [];
for (const e of passed) {
  const rule = (await import(pathToFileURL(path.join(ROOT_DIR, e.file)).href)).default;
  const map = new Map();
  for (const r of predictAll(rule, 'test')) if (r.prediction !== null) map.set(key(r.problem, r.occ), r.prediction);
  byRule.push(map);
}

const stat = Object.fromEntries(TYPES.map((t) => [t, { n: 0, base: 0, rules: 0, answeredByRule: 0 }]));
for (const p of problems) {
  const base = majority(p.occurrences.filter((o) => split.partOf(o.s) === 'build'));
  for (const o of p.occurrences) {
    if (split.partOf(o.s) !== 'test') continue;
    const s = stat[p.type];
    s.n++;
    const baseScore = base === null ? 1 / p.options.length : base === o.chosen ? 1 : 0;
    s.base += baseScore;
    const hit = byRule.find((m) => m.has(key(p, o)));
    if (hit) {
      s.answeredByRule++;
      s.rules += hit.get(key(p, o)) === o.chosen ? 1 : 0;
    } else s.rules += baseScore;
  }
}
const tot = Object.values(stat).reduce((t, s) => ({ n: t.n + s.n, base: t.base + s.base, rules: t.rules + s.rules, answeredByRule: t.answeredByRule + s.answeredByRule }), { n: 0, base: 0, rules: 0, answeredByRule: 0 });
const pct = (x, n) => (n ? `${((100 * x) / n).toFixed(1)}%` : 'n/a');
const num = (x) => x.toLocaleString('en');
const f = (x) => (x === null || x === undefined ? '' : typeof x === 'number' ? String(x) : x);

const md = [
  '# Scoreboard',
  '',
  'Written by `project/tools/scoreboard.mjs`. Do not edit by hand.',
  '',
  '## Headline',
  '',
  `On the test suras there are **${num(tot.n)} choices**. Guessing the commonest option gets **${pct(tot.base, tot.n)}** right. With the rules that have passed, **${pct(tot.rules, tot.n)}** are predicted correctly.`,
  '',
  '| Type of choice | Choices in test suras | Right by baseline | Right with passed rules | Choices a passed rule answers |',
  '|---|---|---|---|---|',
  ...TYPES.map((t) => `| ${t} | ${num(stat[t].n)} | ${pct(stat[t].base, stat[t].n)} | ${pct(stat[t].rules, stat[t].n)} | ${num(stat[t].answeredByRule)} |`),
  `| **all** | ${num(tot.n)} | ${pct(tot.base, tot.n)} | ${pct(tot.rules, tot.n)} | ${num(tot.answeredByRule)} |`,
  '',
  'The baseline is the option used most often for the same choice in the build suras; where there is none, a random guess.',
  '',
  '## Rules',
  '',
  `${ledger.length} tried, ${passed.length} passed, ${ledger.filter((e) => e.status === 'failed').length} failed, ${ledger.filter((e) => e.status === 'proposed').length} not yet tested.`,
  '',
  '| Rule | By | Status | Test: answered | Test: right | Baseline on the same | p (better than baseline) | Checked by the other model |',
  '|---|---|---|---|---|---|---|---|',
  ...ledger.map((e) => {
    const t = e.test ? e.test.all : null;
    return `| ${e.id}: ${e.title} | ${e.author} | ${e.status} | ${t ? `${num(t.answered)} of ${num(t.occurrences)}` : ''} | ${t ? pct(t.correct, t.answered) : ''} | ${t ? pct(t.baselineAccuracy * t.answered, t.answered) : ''} | ${t ? f(t.pGain) : ''} | ${e.challenge ? `${e.challenge.by}: ${e.challenge.verdict}` : 'not yet'} |`;
  }),
  '',
];
fs.writeFileSync(path.join(ROOT_DIR, 'SCOREBOARD.md'), md.join('\n'));
console.log(md.slice(4, 16).join('\n'));
