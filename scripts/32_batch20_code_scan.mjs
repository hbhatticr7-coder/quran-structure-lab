// Batch 20: the code scanner on the real order of the suras.
// Specified in PREREGISTRATION_batch20.md. Run once, after the plan was committed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT_DIR } from '../src/corpus.mjs';
import { loadCounts, makeScanner, freeOrders, matchedOrders, calibrate, masks, score, identity, patternParts, patternName, ruleName, NPATTERNS, KNOWN_RULE, KINDS } from '../src/scanner.mjs';

const CAL = 200000;
const TEST = 100000;
const counts = loadCounts();
const scanner = makeScanner(counts);
const M = masks();
const out = new Uint8Array(NPATTERNS);
const r4 = (x) => +x.toFixed(4);
const p3 = (x) => +x.toPrecision(3);

const real = Uint8Array.from(scanner.scan(identity(), new Uint8Array(NPATTERNS)));
const STATS = [
  ['mainTest', 'primary', 'surprise'],
  ['exactIdentities', 'identities', 'surprise'],
  ['divisibility', 'divisibility', 'surprise'],
  ['withKnownRuleIncluded', 'everything', 'surprise'],
  ['numberOfPatternsHolding', 'primary', 'count'],
  ['rarestSinglePattern', 'primary', 'rarest'],
];

const result = {
  preregistrationSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch20.md'))).digest('hex'),
  patterns: NPATTERNS,
  patternsInMainTest: M.primary.reduce((a, b) => a + b, 0),
  totals: { suras: 114, sumOfNumbers: scanner.totals[1], verses: scanner.totals[2], words: scanner.totals[3], letters: scanner.totals[4] },
  calibrationDraws: CAL,
  testDraws: TEST,
  shuffles: {},
};

const setups = {
  free: { cal: freeOrders(3001), test: freeOrders(3002) },
  lengthMatched: { cal: matchedOrders(counts.W, 3011), test: matchedOrders(counts.W, 3012) },
};
const freqs = {};
for (const [name, s] of Object.entries(setups)) {
  const cal = calibrate(scanner, s.cal, CAL);
  freqs[name] = cal;
  const obs = STATS.map(([, mask, stat]) => score(real, cal.weight, M[mask])[stat]);
  const ge = new Float64Array(STATS.length);
  const sum = new Float64Array(STATS.length);
  const sq = new Float64Array(STATS.length);
  for (let d = 0; d < TEST; d++) {
    scanner.scan(s.test(), out);
    for (let i = 0; i < STATS.length; i++) {
      const x = score(out, cal.weight, M[STATS[i][1]])[STATS[i][2]];
      sum[i] += x;
      sq[i] += x * x;
      if (x >= obs[i] - 1e-9) ge[i]++;
    }
  }
  const block = {};
  STATS.forEach(([label], i) => {
    const mean = sum[i] / TEST;
    block[label] = { real: r4(obs[i]), shuffleMean: r4(mean), shuffleSd: r4(Math.sqrt(Math.max(0, sq[i] / TEST - mean * mean))), p: p3((ge[i] + 1) / (TEST + 1)) };
  });
  if (s.test.stats) block.lengthMatching = { noise: r4(s.test.stats.sigma), pairsOutOfLengthOrder: s.test.stats.target, generated: s.test.stats.generated, kept: s.test.stats.kept };
  result.shuffles[name] = block;
  console.log(name, JSON.stringify(block, null, 1));
}

// Every pattern that holds in the real order.
const holding = [];
for (let k = 0; k < NPATTERNS; k++) {
  if (!real[k]) continue;
  const p = patternParts(k);
  const v = scanner.values(identity(), k);
  holding.push({
    pattern: patternName(k),
    rule: ruleName(p.rule),
    kind: KINDS[p.kind],
    knownRule: p.rule === KNOWN_RULE,
    surasInGroup: v.groupSize,
    valueInGroup: v.yes,
    valueInRest: v.no,
    frequencyInFreeShuffles: p3(freqs.free.freq[k]),
    frequencyInLengthMatchedShuffles: p3(freqs.lengthMatched.freq[k]),
  });
}
holding.sort((a, b) => a.frequencyInFreeShuffles - b.frequencyInFreeShuffles);
result.patternsHoldingInRealOrder = holding.length;
result.holding = holding;
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch20.json'), JSON.stringify(result, null, 2));
console.log('patterns holding:', holding.length);
for (const h of holding.filter((x) => x.frequencyInFreeShuffles < 0.02)) console.log(h.frequencyInFreeShuffles, h.frequencyInLengthMatchedShuffles, h.pattern, h.surasInGroup, h.valueInGroup, h.valueInRest, h.knownRule ? '(known)' : '');
