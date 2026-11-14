// Batch 1 tests exactly as specified in PREREGISTRATION.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, range, ROOT_DIR } from '../src/corpus.mjs';
import { findBridges, suraPairWeights, pairKey } from '../src/ngrams.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { rng, shuffle, mean, sd, pUpper, allMatchings } from '../src/stats.mjs';

const SEED = 20261114;
const DRAWS = 100000;
const registry = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'claims', 'registry.json'), 'utf8'));
const claim = (id) => registry.claims.find((c) => c.id === id);
const preregHash = crypto
  .createHash('sha256')
  .update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION.md')))
  .digest('hex');

const corpus = loadCorpus();
const { verses, suras } = corpus;
const r4 = (x) => +x.toFixed(4);

// ---------- sura-level similarity matrices ----------
const suraLemmas = [];
for (let s = 1; s <= 114; s++) suraLemmas[s] = lemmasOf(suras.get(s));
const suraIdf = idfTable(suraLemmas.slice(1));
const suraVec = suraLemmas.map((l) => (l ? vector(l, suraIdf) : null));
const M2 = Array.from({ length: 115 }, () => new Float64Array(115));
for (let i = 1; i <= 114; i++)
  for (let j = i + 1; j <= 114; j++) M2[i][j] = M2[j][i] = cosine(suraVec[i], suraVec[j]);

function formulaMatrix(n) {
  const { versePairs } = suraPairWeights(findBridges(verses, n));
  const m = Array.from({ length: 115 }, () => new Float64Array(115));
  for (const [k, w] of versePairs) {
    const [a, b] = k.split('-').map(Number);
    m[a][b] = m[b][a] = w;
  }
  return m;
}
const M1n3 = formulaMatrix(3);
const M1n5 = formulaMatrix(5);

// ---------- T1: pairs ----------
function testPairs(M, label) {
  const c = claim('farrin-pairs');
  const adj = (i) => M[i][i + 1];
  const observed = mean(c.pairs.map(([a]) => adj(a)));
  // Self-check: the claimed tiling, walked as tiles, gives the same statistic.
  const singles = new Set(c.singles);
  const walk = (tiles) => {
    let pos = 1;
    let sum = 0;
    for (const t of tiles) {
      if (t === 2) {
        sum += adj(pos);
        pos += 2;
      } else pos += 1;
    }
    assert.equal(pos, 115);
    return sum / c.pairs.length;
  };
  const claimedTiles = [];
  for (let s = 1; s <= 114; ) {
    if (singles.has(s)) {
      claimedTiles.push(1);
      s += 1;
    } else {
      claimedTiles.push(2);
      s += 2;
    }
  }
  assert.ok(Math.abs(walk(claimedTiles) - observed) < 1e-12);
  const rand = rng(SEED);
  const tiles = claimedTiles.slice();
  const nulls = new Float64Array(DRAWS);
  for (let d = 0; d < DRAWS; d++) nulls[d] = walk(shuffle(tiles, rand));
  // Effect size against the two off-phase neighbours.
  const diffs = c.pairs.map(([a, b]) => {
    const nb = [];
    if (a > 1) nb.push(adj(a - 1));
    if (b < 114) nb.push(adj(b));
    return adj(a) - mean(nb);
  });
  return {
    measure: label,
    observedMean: r4(observed),
    nullMean: r4(mean([...nulls])),
    nullSd: r4(sd([...nulls])),
    z: r4((observed - mean([...nulls])) / sd([...nulls])),
    p: +pUpper(observed, nulls).toPrecision(3),
    meanAdvantageOverOffPhaseNeighbours: r4(mean(diffs)),
    pairsBeatingNeighbours: `${diffs.filter((x) => x > 0).length} of ${diffs.length}`,
  };
}

// ---------- T2: groups ----------
function testGroups(M, label, distances) {
  const c = claim('farrin-groups');
  const sizes = c.groups.map(([a, b]) => b - a + 1);
  assert.equal(sizes.reduce((t, x) => t + x, 0), 111);
  const groupOfFromSizes = (sz) => {
    const g = new Int32Array(115).fill(-1);
    let s = 2;
    sz.forEach((n, gi) => {
      for (let k = 0; k < n; k++) g[s++] = gi;
    });
    assert.equal(s, 113);
    return g;
  };
  const stat = (g) => {
    let total = 0;
    for (const d of distances) {
      let same = 0;
      let nSame = 0;
      let cross = 0;
      let nCross = 0;
      for (let i = 2; i + d <= 112; i++) {
        if (g[i] === g[i + d]) {
          same += M[i][i + d];
          nSame++;
        } else {
          cross += M[i][i + d];
          nCross++;
        }
      }
      total += same / nSame - cross / nCross;
    }
    return total / distances.length;
  };
  const gObs = groupOfFromSizes(sizes);
  const observed = stat(gObs);
  const rand = rng(SEED + 1);
  const sz = sizes.slice();
  const nulls = new Float64Array(DRAWS);
  for (let d = 0; d < DRAWS; d++) nulls[d] = stat(groupOfFromSizes(shuffle(sz, rand)));
  const perGroup = c.groups.map(([a, b], gi) => {
    const within = [];
    const boundary = [];
    for (let i = 2; i <= 112; i++)
      for (let d = 1; d <= 3 && i + d <= 112; d++) {
        const inI = gObs[i] === gi;
        const inJ = gObs[i + d] === gi;
        if (inI && inJ) within.push(M[i][i + d]);
        else if (inI || inJ) boundary.push(M[i][i + d]);
      }
    return {
      group: `${a}-${b}`,
      within: r4(mean(within)),
      acrossItsBoundaries: r4(mean(boundary)),
      difference: r4(mean(within) - mean(boundary)),
    };
  });
  return {
    measure: label,
    distances,
    observed: r4(observed),
    nullMean: r4(mean([...nulls])),
    nullSd: r4(sd([...nulls])),
    z: r4((observed - mean([...nulls])) / sd([...nulls])),
    p: +pUpper(observed, nulls).toPrecision(3),
    perGroup,
  };
}

// ---------- T4: rings ----------
const verseIdf = idfTable(verses.map((v) => v.lemmas));
function ringTest(id) {
  const c = claim(id);
  const vec = new Map(
    c.sections.map(([name, from, to]) => [name, vector(lemmasOf(range(corpus, c.sura, from, to)), verseIdf)])
  );
  const names = c.sections.map((x) => x[0]).filter((n) => n !== c.centre);
  const sim = (a, b) => cosine(vec.get(a), vec.get(b));
  const score = (m) => m.reduce((t, [a, b]) => t + sim(a, b), 0);
  const matchings = allMatchings(names);
  const scores = matchings.map(score);
  const claimed = score(c.mirrorPairs);
  const m = mean(scores);
  const s = sd(scores);
  const ge = scores.filter((x) => x >= claimed - 1e-12).length;
  const pairSims = c.mirrorPairs.map(([a, b]) => {
    // Rank of the claimed partner among all possible partners of a.
    const others = names.filter((n) => n !== a).map((n) => [n, sim(a, n)]).sort((x, y) => y[1] - x[1]);
    return {
      pair: `${a} / ${b}`,
      similarity: r4(sim(a, b)),
      partnerRank: `${others.findIndex((o) => o[0] === b) + 1} of ${others.length}`,
    };
  });
  return {
    id,
    sura: c.sura,
    blind: c.blind,
    pairings: matchings.length,
    claimedScore: r4(claimed),
    nullMean: r4(m),
    nullSd: r4(s),
    z: r4((claimed - m) / s),
    exactP: +(ge / matchings.length).toPrecision(3),
    rankAmongPairings: `${ge} of ${matchings.length}`,
    pairSims,
    _z: scores.map((x) => (x - m) / s),
    _zClaimed: (claimed - m) / s,
  };
}

// ---------- T3: size-controlled view of the 5-gram network ----------
function networkTest() {
  const bridges = findBridges(verses, 5);
  const seen = new Set();
  const edges = [];
  for (const { a, b } of bridges) {
    const k = a.idx < b.idx ? `${a.idx}|${b.idx}` : `${b.idx}|${a.idx}`;
    if (seen.has(k)) continue;
    seen.add(k);
    edges.push([a.s, b.s]);
  }
  const L = new Float64Array(115);
  for (const v of verses) L[v.s] += Math.max(0, v.roots.length - 4);
  let denom = 0;
  for (let i = 1; i <= 114; i++) for (let j = i + 1; j <= 114; j++) denom += L[i] * L[j];
  const groups = claim('farrin-groups').groups;
  const gOf = new Int32Array(115).fill(-1);
  groups.forEach(([a, b], gi) => {
    for (let s = a; s <= b; s++) gOf[s] = gi;
  });
  const countWithin = (es) => {
    const c = new Int32Array(groups.length);
    for (const [x, y] of es) if (gOf[x] >= 0 && gOf[x] === gOf[y]) c[gOf[x]]++;
    return c;
  };
  const obs = countWithin(edges);
  const expSize = groups.map(([a, b]) => {
    let e = 0;
    for (let i = a; i <= b; i++) for (let j = i + 1; j <= b; j++) e += (edges.length * L[i] * L[j]) / denom;
    return e;
  });
  // Degree-preserving rewiring by edge swaps; no same-sura edges.
  const rand = rng(SEED + 3);
  const es = edges.map((e) => e.slice());
  const NDRAW = 20000;
  const ge = new Int32Array(groups.length);
  const sumNull = new Float64Array(groups.length);
  let geTotal = 0;
  let sumTotal = 0;
  const obsTotal = obs.reduce((t, x) => t + x, 0);
  const swapsPerDraw = es.length * 3;
  const doSwaps = (k) => {
    for (let t = 0; t < k; t++) {
      const i = Math.floor(rand() * es.length);
      const j = Math.floor(rand() * es.length);
      if (i === j) continue;
      if (rand() < 0.5) [es[j][0], es[j][1]] = [es[j][1], es[j][0]];
      const [a, b] = es[i];
      const [c, d] = es[j];
      if (a === d || c === b) continue;
      es[i][1] = d;
      es[j][1] = b;
    }
  };
  doSwaps(es.length * 50); // burn-in
  for (let n = 0; n < NDRAW; n++) {
    doSwaps(swapsPerDraw);
    const c = countWithin(es);
    let tot = 0;
    for (let g = 0; g < groups.length; g++) {
      if (c[g] >= obs[g]) ge[g]++;
      sumNull[g] += c[g];
      tot += c[g];
    }
    if (tot >= obsTotal) geTotal++;
    sumTotal += tot;
  }
  return {
    bridgedVersePairs: edges.length,
    withinGroupTotal: {
      observed: obsTotal,
      expectedBySize: r4(expSize.reduce((t, x) => t + x, 0)),
      expectedByRewiring: r4(sumTotal / NDRAW),
      pRewiring: +((geTotal + 1) / (NDRAW + 1)).toPrecision(3),
    },
    perGroup: groups.map(([a, b], g) => ({
      group: `${a}-${b}`,
      observed: obs[g],
      expectedBySize: r4(expSize[g]),
      expectedByRewiring: r4(sumNull[g] / NDRAW),
      pRewiring: +((ge[g] + 1) / (NDRAW + 1)).toPrecision(3),
    })),
  };
}

// ---------- run ----------
assert.equal(allMatchings([1, 2, 3, 4, 5, 6]).length, 15);
assert.equal(allMatchings([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).length, 945);

const T1 = { primary: testPairs(M2, 'M2 vocabulary'), secondary: [testPairs(M1n3, 'M1 formulas n=3'), testPairs(M1n5, 'M1 formulas n=5')] };
const T2 = {
  primary: testGroups(M2, 'M2 vocabulary', [1, 2, 3]),
  secondary: [
    testGroups(M2, 'M2 vocabulary', [2, 3]),
    testGroups(M1n3, 'M1 formulas n=3', [1, 2, 3]),
    testGroups(M1n5, 'M1 formulas n=5', [1, 2, 3]),
  ],
};
const rings = ['farrin-ring-2', 'farrin-ring-3', 'farrin-ring-12'].map(ringTest);
// Exact combined null: every combination of pairings across the three suras.
const obsZ = rings.reduce((t, r) => t + r._zClaimed, 0);
let geC = 0;
let totalC = 0;
for (const z1 of rings[0]._z) for (const z2 of rings[1]._z) for (const z3 of rings[2]._z) {
  totalC++;
  if (z1 + z2 + z3 >= obsZ - 1e-12) geC++;
}
const strip = ({ _z, _zClaimed, ...rest }) => rest;
const T4 = {
  primary: { combinedZsum: r4(obsZ), combinations: totalC, exactP: +(geC / totalC).toPrecision(3) },
  perSura: rings.map(strip),
  kahfRetestNotBlind: strip(ringTest('kahf-ring-prior')),
};
const T3 = networkTest();

const out = {
  preregistrationSha256: preregHash,
  seed: SEED,
  draws: DRAWS,
  bonferroniThreshold: 0.0167,
  T1_pairs: T1,
  T2_groups: T2,
  T4_rings: T4,
  T3_network_exploratory: T3,
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch1.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
