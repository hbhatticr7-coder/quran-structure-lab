// Batch 20, check of the scanner. Never evaluates the real order of the suras.
// (The real order's length-disorder, a single number, sets the length-matched shuffles.)
//  1. False alarms: fresh shuffles put through the main test.
//  2. Planted patterns: random orders altered by swaps until chosen exact
//     identities hold, then put through the main test.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../src/corpus.mjs';
import { rng } from '../src/stats.mjs';
import { loadCounts, makeScanner, freeOrders, matchedOrders, calibrate, masks, score, patternParts, patternName, NPATTERNS, KNOWN_RULE } from '../src/scanner.mjs';

const CAL = 200000;
const TEST = 100000;
const counts = loadCounts();
const scanner = makeScanner(counts);
const M = masks();
const out = new Uint8Array(NPATTERNS);
const r4 = (x) => +x.toFixed(4);

function nullScores(next, weight) {
  const s = new Float64Array(TEST);
  for (let d = 0; d < TEST; d++) s[d] = score(scanner.scan(next(), out), weight, M.primary).surprise;
  return s.sort();
}
const pOf = (sorted, x) => {
  // share of sorted values >= x, with the +1 correction
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] >= x - 1e-9) hi = mid;
    else lo = mid + 1;
  }
  return (sorted.length - lo + 1) / (sorted.length + 1);
};

const result = { note: 'Check of the scanner on shuffled and planted arrangements. The real order is never scanned here.', calibrationDraws: CAL, testDraws: TEST };

// ---------- false alarms ----------
const setups = {
  free: { cal: freeOrders(2001), test: freeOrders(2002), fresh: freeOrders(2003) },
  lengthMatched: { cal: matchedOrders(counts.W, 2011), test: matchedOrders(counts.W, 2012), fresh: matchedOrders(counts.W, 2013) },
};
const state = {};
for (const [name, s] of Object.entries(setups)) {
  const cal = calibrate(scanner, s.cal, CAL);
  const sorted = nullScores(s.test, cal.weight);
  state[name] = { cal, sorted };
  let below01 = 0;
  let below05 = 0;
  const FRESH = 2000;
  for (let i = 0; i < FRESH; i++) {
    const p = pOf(sorted, score(scanner.scan(s.fresh(), out), cal.weight, M.primary).surprise);
    if (p < 0.01) below01++;
    if (p < 0.05) below05++;
  }
  let informative = 0;
  for (let k = 0; k < NPATTERNS; k++) if (M.primary[k] && cal.freq[k] > 0 && cal.freq[k] < 1) informative++;
  result[name] = {
    patternsThatSometimesHold: informative,
    meanScoreOfShuffles: r4(sorted.reduce((a, b) => a + b, 0) / TEST),
    score99thPercentile: r4(sorted[Math.floor(0.99 * TEST)]),
    falseAlarms: { fresh: FRESH, shareBelow001: r4(below01 / FRESH), shareBelow005: r4(below05 / FRESH) },
  };
  console.log(name, JSON.stringify(result[name]));
}

// ---------- planted patterns (free shuffle) ----------
const { cal, sorted } = state.free;
const eligible = [];
for (let k = 0; k < NPATTERNS; k++) {
  const p = patternParts(k);
  if (p.rule === KNOWN_RULE || p.kind > 1) continue;
  if (cal.freq[k] > 0 && cal.freq[k] < 0.01) eligible.push(k);
}
const rand = rng(2021);
const draw = freeOrders(2022);
function plant(targets) {
  const perm = Int32Array.from(draw());
  const cost = () => targets.reduce((t, k, i) => t + Math.log1p(scanner.deviation(perm, k, i > 0)), 0);
  let c = cost();
  let T = 1;
  for (let it = 0; it < 40000 && c > 0; it++) {
    const a = 1 + Math.floor(rand() * 114);
    const b = 1 + Math.floor(rand() * 114);
    if (a === b) continue;
    [perm[a], perm[b]] = [perm[b], perm[a]];
    const c2 = cost();
    if (c2 <= c || rand() < Math.exp((c - c2) / T)) c = c2;
    else [perm[a], perm[b]] = [perm[b], perm[a]];
    T = Math.max(0.02, T * 0.9999);
  }
  return c === 0 ? perm : null;
}
result.planted = { eligibleIdentities: eligible.length, byNumberPlanted: {} };
for (const m of [1, 2, 3, 5]) {
  let made = 0;
  let tries = 0;
  let detected = 0;
  let surprisePlanted = 0;
  const ps = [];
  while (made < 20 && tries < 80) {
    tries++;
    const targets = [];
    while (targets.length < m) {
      const k = eligible[Math.floor(rand() * eligible.length)];
      // one planted identity per grouping rule, so they are not copies of each other
      if (!targets.some((t) => patternParts(t).rule === patternParts(k).rule)) targets.push(k);
    }
    const perm = plant(targets);
    if (tries % 10 === 0) console.log("  planting", m, "tries", tries, "made", made + (perm ? 1 : 0));
    if (!perm) continue;
    made++;
    surprisePlanted += targets.reduce((t, k) => t + cal.weight[k], 0);
    const p = pOf(sorted, score(scanner.scan(perm, out), cal.weight, M.primary).surprise);
    ps.push(p);
    if (p < 0.01) detected++;
  }
  ps.sort((a, b) => a - b);
  result.planted.byNumberPlanted[m] = { arrangementsMade: made, attempts: tries, meanSurpriseOfPlanted: made ? r4(surprisePlanted / made) : null, detectedAtP001: detected, medianP: made ? +ps[Math.floor(made / 2)].toPrecision(3) : null };
  console.log('planted', m, JSON.stringify(result.planted.byNumberPlanted[m]));
}
result.examplesOfEligibleIdentities = eligible.slice(0, 5).map((k) => ({ pattern: patternName(k), frequency: cal.freq[k] }));
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch20_check.json'), JSON.stringify(result, null, 2));
