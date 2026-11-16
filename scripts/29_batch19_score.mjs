// Batch 19, scoring: exactly as specified in PREREGISTRATION_batch19.md.
// Usage: node scripts/29_batch19_score.mjs <path-to-key.json>
// Run after the judges and the blindness reader have written their answers.
// Copies the key into reading/key.json so the batch can be checked by others.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { ROOT_DIR } from '../src/corpus.mjs';
import { rng, mean } from '../src/stats.mjs';

const keyPath = process.argv[2];
const store = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const dir = path.join(ROOT_DIR, 'reading');
const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch19.md'))).digest('hex');

const answers = {};
for (const f of ['judge_answers_1.json', 'judge_answers_2.json', 'judge_answers_3.json', 'judge_answers_4.json']) Object.assign(answers, JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
const rankOf = (id) => {
  const a = answers[id];
  assert.ok(a && typeof a.ranking === 'string', `no answer for ${id}`);
  const order = a.ranking.toUpperCase().replace(/[^A-E]/g, '');
  assert.equal(new Set(order).size, 5, `bad ranking for ${id}: ${a.ranking}`);
  return order.indexOf(store.items[id].trueLabel) + 1;
};
const main = Object.keys(store.items).filter((id) => id.startsWith('S'));
const repeat = Object.keys(store.items).filter((id) => id.startsWith('R'));
assert.equal(main.length, 113);
const ranks = main.map(rankOf);
const obs = mean(ranks);
const rand = rng(20261230);
const DRAWS = 100000;
let le = 0;
for (let d = 0; d < DRAWS; d++) {
  let t = 0;
  for (let i = 0; i < ranks.length; i++) t += 1 + Math.floor(rand() * 5);
  if (t / ranks.length <= obs + 1e-12) le++;
}
const top1 = ranks.filter((r) => r === 1).length;
// exact binomial tail for top-1 at chance 0.2
const lnC = (n, k) => {
  let t = 0;
  for (let i = 1; i <= k; i++) t += Math.log(n - k + i) - Math.log(i);
  return t;
};
let pTop = 0;
for (let k = top1; k <= ranks.length; k++) pTop += Math.exp(lnC(ranks.length, k) + k * Math.log(0.2) + (ranks.length - k) * Math.log(0.8));

// agreement on the repeated 38 seams
const bySura = new Map(main.map((id) => [store.items[id].sura, id]));
const pairs = repeat.map((id) => ({ sura: store.items[id].sura, first: rankOf(bySura.get(store.items[id].sura)), second: rankOf(id) }));
const agreement = {
  seams: pairs.length,
  bothRankedTrueFirst: pairs.filter((p) => p.first === 1 && p.second === 1).length,
  firstJudgeRankedTrueFirst: pairs.filter((p) => p.first === 1).length,
  secondJudgeRankedTrueFirst: pairs.filter((p) => p.second === 1).length,
  sameRankGiven: pairs.filter((p) => p.first === p.second).length,
  meanRankFirstJudge: r4(mean(pairs.map((p) => p.first))),
  meanRankSecondJudge: r4(mean(pairs.map((p) => p.second))),
};

// blindness
const guesses = JSON.parse(fs.readFileSync(path.join(dir, 'blindness_answers.json'), 'utf8'));
const blindIds = Object.keys(store.blind);
const exact = blindIds.filter((id) => Number(guesses[id]) === store.blind[id]).length;
const near = blindIds.filter((id) => Math.abs(Number(guesses[id]) - store.blind[id]) <= 1).length;
const blindness = { closes: blindIds.length, identifiedExactly: exact, share: r4(exact / blindIds.length), withinOneSura: near, passed: exact / blindIds.length <= 0.25 };

const seams = main
  .map((id) => ({ seam: `${store.items[id].sura}-${store.items[id].sura + 1}`, rankOfTrueOpening: rankOf(id), judgeTopChoiceWasSura: store.items[id].options['ABCDE'.indexOf(answers[id].ranking.toUpperCase().replace(/[^A-E]/g, '')[0])], reasonForTopChoice: answers[id].reason || '' }))
  .sort((a, b) => parseInt(a.seam) - parseInt(b.seam));

const out = {
  preregistrationSha256: preregHash,
  blindness,
  primary: { seams: ranks.length, meanRankOfTrueOpening: r4(obs), chance: 3, p: +((le + 1) / (DRAWS + 1)).toPrecision(3) },
  rankedFirst: { count: top1, share: r4(top1 / ranks.length), chance: 0.2, p: +pTop.toPrecision(3) },
  rankDistribution: [1, 2, 3, 4, 5].map((r) => ranks.filter((x) => x === r).length),
  agreement,
  seams,
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch19.json'), JSON.stringify(out, null, 2));
fs.writeFileSync(path.join(dir, 'key.json'), JSON.stringify(store, null, 1));
const { seams: _s, ...brief } = out;
console.log(JSON.stringify(brief, null, 1));
