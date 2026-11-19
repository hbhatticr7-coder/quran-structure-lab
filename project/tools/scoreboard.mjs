// Writes SCOREBOARD.md from the ledger.
//
// The headline is measured on the test suras only: for every choice there, how
// often the right option is predicted (a) by the baseline alone and (b) by the
// rules that have passed, falling back on the baseline where no rule answers.
// Where two passed rules answer the same choice, the one with the higher
// accuracy on the BUILD suras is used, so the test suras play no part in the pick.
//
// A rule counts toward the headline only if it passed under the present method
// version AND the other model has challenged THAT test and found that it holds.
// A challenge names the test it reviewed (method version, commit, hash of the
// rule file); a challenge of an earlier test does not carry over.
//
// Usage: node project/tools/scoreboard.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { ROOT_DIR } from '../../src/corpus.mjs';
import { TYPES, CENSUS_VERSION, predictAll, readLedger } from './lib.mjs';

const ledger = readLedger();
const current = (e) => e.test && (e.test.censusVersion || 1) === CENSUS_VERSION;
const VERDICTS = ['holds', 'holds in part', 'broken'];
// The challenge of the present test, or null: written by the other model, with
// a known verdict, and naming this test's method version, commit and rule file.
const reviewOf = (e) => {
  const c = e.challenge;
  if (!c || !e.test || !VERDICTS.includes(c.verdict)) return null;
  if (!c.by || c.by === e.author) return null;
  if (c.censusVersion !== (e.test.censusVersion || 1) || !c.testCommit || c.testCommit !== e.test.commit || !c.ruleSha256 || c.ruleSha256 !== e.sha256) return null;
  return c;
};
const checked = (e) => reviewOf(e)?.verdict === 'holds';
const awaiting = ledger.filter((e) => e.status === 'passed' && current(e) && !reviewOf(e));
const passed = ledger.filter((e) => e.status === 'passed' && current(e) && checked(e)).sort((a, b) => (b.build?.all?.accuracy || 0) - (a.build?.all?.accuracy || 0));

const key = (r) => `${r.problem.id}|${r.occ.s}:${r.occ.v}:${r.occ.slots.join(',')}`;
const byRule = [];
for (const e of passed) {
  if (crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, e.file))).digest('hex') !== e.sha256) throw new Error(`${e.id}: the rule file is not the one that was tested`);
  const rule = (await import(pathToFileURL(path.join(ROOT_DIR, e.file)).href)).default;
  const map = new Map();
  for (const r of predictAll(rule, 'test')) if (r.prediction !== null) map.set(key(r), r.prediction);
  byRule.push(map);
}

const stat = Object.fromEntries(TYPES.map((t) => [t, { n: 0, base: 0, plain: 0, rules: 0, answeredByRule: 0, unseen: 0 }]));
const scoreOf = (guess, r) => (guess === null ? 1 / r.problem.options.length : guess === r.occ.chosen ? 1 : 0);
for (const r of predictAll(null, 'test')) {
  const s = stat[r.problem.type];
  if (r.unseen) {
    s.unseen++;
    continue;
  }
  s.n++;
  const baseScore = scoreOf(r.baseline, r);
  s.base += baseScore;
  s.plain += scoreOf(r.plainBaseline, r);
  const hit = byRule.find((m) => m.has(key(r)));
  if (hit) {
    s.answeredByRule++;
    s.rules += hit.get(key(r)) === r.occ.chosen ? 1 : 0;
  } else s.rules += baseScore;
}
const tot = Object.values(stat).reduce((t, s) => ({ n: t.n + s.n, base: t.base + s.base, plain: t.plain + s.plain, rules: t.rules + s.rules, answeredByRule: t.answeredByRule + s.answeredByRule, unseen: t.unseen + s.unseen }), { n: 0, base: 0, plain: 0, rules: 0, answeredByRule: 0, unseen: 0 });
const tested = ledger.filter((e) => e.test).length;
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
  `On the test suras there are **${num(tot.n)} choices**. The baseline gets **${pct(tot.base, tot.n)}** right. With the rules that have passed and been checked, **${pct(tot.rules, tot.n)}** are predicted correctly.`,
  '',
  '| Type of choice | Choices in test suras | Right by commonest option, form ignored | Right by baseline | Right with passed and checked rules | Choices such a rule answers | Places left out: word never seen there in the build suras |',
  '|---|---|---|---|---|---|---|',
  ...TYPES.map((t) => `| ${NAME[t]} | ${num(stat[t].n)} | ${pct(stat[t].plain, stat[t].n)} | ${pct(stat[t].base, stat[t].n)} | ${pct(stat[t].rules, stat[t].n)} | ${num(stat[t].answeredByRule)} | ${num(stat[t].unseen)} |`),
  `| **all** | ${num(tot.n)} | ${pct(tot.plain, tot.n)} | ${pct(tot.base, tot.n)} | ${pct(tot.rules, tot.n)} | ${num(tot.answeredByRule)} | ${num(tot.unseen)} |`,
  '',
  '**The baseline** is the option used most often for the same choice in the build suras; where there is none, a random guess. For near-synonyms it is the option used most often there *in the same grammatical form* (a verb\'s tense, a noun\'s definiteness). A rule is told the form only where the baseline uses it. Beating this baseline means beating a coarse grammar control (part of speech, tense, definiteness). It does not by itself show an explanation beyond grammar: the words around the hidden word can carry grammar the control is not given. That question is put to each passing rule in its challenge.',
  '',
  `**What grammar alone settles.** For near-synonyms, knowing the form lifts the commonest-option guess from ${pct(stat.synonym.plain, stat.synonym.n)} to ${pct(stat.synonym.base, stat.synonym.n)}. The largest part of that is one fact: of the two verbs for "to come", ja'a is used in the past tense and ata supplies the other forms (rule R003 below). That is counted as grammar, not as wording explained.`,
  '',
  `**What these numbers leave out.** A choice is counted only if the word used is one the build suras show in that place. In ${num(tot.unseen)} further places in the test suras the word is a new one, which no rule and no baseline could name. Counting those as misses, the baseline is right on ${pct(tot.base, tot.n + tot.unseen)} of ${num(tot.n + tot.unseen)} places, and the passed and checked rules on ${pct(tot.rules, tot.n + tot.unseen)}.`,
  '',
  '## Rules',
  '',
  `${ledger.length} tried: ${ledger.filter((e) => e.status === 'passed').length} passed, ${ledger.filter((e) => e.status === 'failed').length} failed, ${ledger.filter((e) => e.status === 'proposed').length} not yet tested.`,
  '',
  `A rule passes only if it beats the baseline with p below 0.01 two ways: one sign per place, and one sign per sura (each sura's gains and losses summed). Each rule gets one test. With ${tested} tested so far, luck alone would be expected to pass at most about ${(tested * 0.01).toFixed(2)} of them. That is a rough upper figure, not an exact one: it assumes each test is fair, and rules written after seeing earlier results are not fully independent attempts. A pass counts toward the headline only after the other model has challenged that test and found that it holds; "holds in part" and "broken" do not count.${awaiting.length ? ` Awaiting challenge: ${awaiting.map((e) => e.id).join(', ')}.` : ''}`,
  '',
  `The method has changed ${CENSUS_VERSION - 1} times as flaws were found (see \`project/CENSUS.md\`). Each rule is shown with the score from its own test and the method version it was tested under. A rule tested under an earlier version does not count toward the headline.`,
  '',
  '| Rule | By | Status | Test: answered | Test: right | Baseline on the same | p, one sign per place | p, one sign per sura | Checked by the other model |',
  '|---|---|---|---|---|---|---|---|---|',
  ...ledger.map((e) => {
    const t = e.test ? e.test.all : null;
    const old = e.test && !current(e) ? ` (method version ${e.test.censusVersion || 1})` : '';
    return `| ${e.id}: ${e.title} | ${e.author} | ${e.status}${old} | ${t ? `${num(t.answered)} of ${num(t.occurrences)}` : ''} | ${t ? pct(t.correct, t.answered) : ''} | ${t ? pct(t.baselineAccuracy * t.answered, t.answered) : ''} | ${t ? t.pGain : ''} | ${t ? (t.pGainBySura ?? 'not run') : ''} | ${e.challenge ? `${e.challenge.by}: ${e.challenge.verdict}${reviewOf(e) ? '' : ' (not tied to this test)'}` : 'not yet'} |`;
  }),
  '',
];
fs.writeFileSync(path.join(ROOT_DIR, 'SCOREBOARD.md'), md.join('\n'));
console.log(md.slice(4, 16).join('\n'));
