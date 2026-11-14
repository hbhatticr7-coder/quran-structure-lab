// Batch 8: a tournament of theories about the disconnected letters,
// exactly as specified in PREREGISTRATION_batch8.md.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadLetterData } from '../src/letters.mjs';
import { loadRhymes, rhymeFamily, LETTER_NAME } from '../src/rhyme.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { rng, shuffle, mean } from '../src/stats.mjs';
import { makePairs, nodeFixedEffects, dsp } from '../src/mrqap.mjs';

const N = 114;
const r4 = (x) => +x.toFixed(4);
const preregHash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT_DIR, 'PREREGISTRATION_batch8.md'))).digest('hex');
const { openers, counts, totals } = loadLetterData();
const lettered = [...openers.keys()].sort((a, b) => a - b);
assert.equal(lettered.length, 29);

// Letters by name, for readable code.
const L = {
  alif: 'ا', ba: 'ب', ta: 'ت', tha: 'ث', jim: 'ج', hha: 'ح', kha: 'خ', dal: 'د', dhal: 'ذ',
  ra: 'ر', zay: 'ز', sin: 'س', shin: 'ش', sad: 'ص', dad: 'ض', tta: 'ط', zza: 'ظ', ayn: 'ع',
  ghayn: 'غ', fa: 'ف', qaf: 'ق', kaf: 'ك', lam: 'ل', mim: 'م', nun: 'ن', ha: 'ه', waw: 'و', ya: 'ي',
};
const ALPHABET = Object.values(L);
assert.equal(ALPHABET.length, 28);
const THE14 = [...new Set(lettered.flatMap((s) => openers.get(s).letters))];
assert.equal(THE14.length, 14);
const openingStrings = [...new Set(lettered.flatMap((s) => openers.get(s).strings))];
assert.equal(openingStrings.length, 14);

// =====================================================================
// A. The letters rhyme with their sura
// =====================================================================
const rhymes = loadRhymes();
function testA({ subset, exact, seed }) {
  const suras = subset;
  const ending = suras.map((s) => LETTER_NAME[[...openers.get(s).family].pop()]);
  assert.ok(ending.every(Boolean), 'missing letter-name ending');
  const cls = (key) => (exact ? key : rhymeFamily(key));
  const profile = suras.map((s) => {
    const skip = new Set(openers.get(s).letterOnlyVerses);
    return rhymes.filter((x) => x.s === s && !skip.has(x.v)).map((x) => cls(x.key));
  });
  const match = (k, e) => profile[k].filter((c) => c === cls(e)).length / profile[k].length;
  const M = suras.map((_, k) => ending.map((e) => match(k, e)));
  const observed = mean(suras.map((_, k) => M[k][k]));
  const rand = rng(seed);
  const perm = suras.map((_, k) => k);
  let ge = 0;
  let sum = 0;
  const DRAWS = 100000;
  for (let d = 0; d < DRAWS; d++) {
    shuffle(perm, rand);
    let t = 0;
    for (let k = 0; k < perm.length; k++) t += M[k][perm[k]];
    t /= perm.length;
    sum += t;
    if (t >= observed - 1e-12) ge++;
  }
  return {
    suras: suras.length,
    measure: exact ? 'exact rhyme key' : 'rhyme family',
    meanShareOfVersesMatchingOwnOpening: r4(observed),
    meanUnderShuffle: r4(sum / DRAWS),
    p: +((ge + 1) / (DRAWS + 1)).toPrecision(3),
    perSura: suras.map((s, k) => ({ sura: s, opening: openers.get(s).family, ending: ending[k], share: r4(M[k][k]) })),
  };
}
const standalone = lettered.filter((s) => openers.get(s).letterOnlyVerses.includes(1));
const A = {
  primary: testA({ subset: lettered, exact: false, seed: 20261126 }),
  secondary: {
    lettersFormOwnVerse: testA({ subset: standalone, exact: false, seed: 20261136 }),
    exactKey: testA({ subset: lettered, exact: true, seed: 20261146 }),
  },
};

// =====================================================================
// B. The letters sample the shapes of the script
// =====================================================================
const C = (n, k) => {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
};
function testB(groups) {
  assert.equal(groups.flat().length, 28);
  const covered = groups.filter((g) => g.some((ch) => THE14.includes(ch))).length;
  // ways[k][c] = number of ways to choose k letters covering c groups
  let ways = Array.from({ length: 15 }, () => new Array(groups.length + 1).fill(0));
  ways[0][0] = 1;
  for (const g of groups) {
    const next = Array.from({ length: 15 }, () => new Array(groups.length + 1).fill(0));
    for (let k = 0; k <= 14; k++)
      for (let c = 0; c <= groups.length; c++) {
        if (!ways[k][c]) continue;
        for (let j = 0; j <= g.length && k + j <= 14; j++) next[k + j][c + (j > 0 ? 1 : 0)] += ways[k][c] * C(g.length, j);
      }
    ways = next;
  }
  const total = ways[14].reduce((t, x) => t + x, 0);
  assert.equal(total, C(28, 14));
  const atLeast = ways[14].slice(covered).reduce((t, x) => t + x, 0);
  return {
    groups: groups.length,
    groupsCoveredByThe14: covered,
    mostPossible: Math.min(14, groups.length),
    setsDoingAsWell: atLeast,
    ofAllSets: total,
    p: +(atLeast / total).toPrecision(3),
    groupsNotCovered: groups.filter((g) => !g.some((ch) => THE14.includes(ch))).map((g) => g.join(' ')),
  };
}
const G18 = [
  [L.alif], [L.ba, L.ta, L.tha], [L.hha, L.jim, L.kha], [L.dal, L.dhal], [L.ra, L.zay], [L.sin, L.shin], [L.sad, L.dad], [L.tta, L.zza],
  [L.ayn, L.ghayn], [L.fa], [L.qaf], [L.kaf], [L.lam], [L.mim], [L.nun], [L.ha], [L.waw], [L.ya],
];
const G15 = [
  [L.alif], [L.ba, L.ta, L.tha, L.nun, L.ya], [L.hha, L.jim, L.kha], [L.dal, L.dhal], [L.ra, L.zay], [L.sin, L.shin], [L.sad, L.dad], [L.tta, L.zza],
  [L.ayn, L.ghayn], [L.fa, L.qaf], [L.kaf], [L.lam], [L.mim], [L.ha], [L.waw],
];
// In each multi-letter group of G18 the first letter listed is the one written without dots today.
const multi = G18.filter((g) => g.length > 1 && g.some((ch) => THE14.includes(ch)));
const undotted = multi.filter((g) => THE14.includes(g[0]) && g.slice(1).every((ch) => !THE14.includes(ch)));
const B = {
  primary: testB(G18),
  secondary: {
    coarserGrouping15: testB(G15),
    undottedMember: {
      multiLetterGroupsHit: multi.length,
      whereTheLetterPresentIsTheUndottedOne: undotted.length,
      chanceIfOneLetterPerGroupWerePickedAtRandom: +multi.reduce((t, g) => t / g.length, 1).toPrecision(3),
    },
  },
};

// =====================================================================
// C. The letters keep one internal order
// =====================================================================
const multiOpenings = openingStrings.filter((s) => [...s].length > 1).map((s) => [...s]);
assert.equal(multiOpenings.length, 11);
function consistent(seqs) {
  // Is the "comes before" relation over all sequences free of cycles?
  const before = new Map();
  for (const q of seqs) for (let i = 0; i < q.length; i++) for (let j = i + 1; j < q.length; j++) {
    if (!before.has(q[i])) before.set(q[i], new Set());
    before.get(q[i]).add(q[j]);
  }
  const nodes = [...new Set(seqs.flat())];
  const indeg = new Map(nodes.map((n) => [n, 0]));
  for (const [, outs] of before) for (const o of outs) indeg.set(o, indeg.get(o) + 1);
  const queue = nodes.filter((n) => indeg.get(n) === 0);
  let seen = 0;
  while (queue.length) {
    const n = queue.pop();
    seen++;
    for (const o of before.get(n) || []) {
      indeg.set(o, indeg.get(o) - 1);
      if (indeg.get(o) === 0) queue.push(o);
    }
  }
  return seen === nodes.length;
}
const observedConsistent = consistent(multiOpenings);
{
  assert.equal(consistent([['a', 'b'], ['b', 'a']]), false);
  assert.equal(consistent([['a', 'b', 'c'], ['a', 'c']]), true);
}
const randC = rng(20261127);
const DRAWS_C = 2000000;
let okC = 0;
const copies = multiOpenings.map((q) => q.slice());
for (let d = 0; d < DRAWS_C; d++) {
  for (const q of copies) shuffle(q, randC);
  if (consistent(copies)) okC++;
}
const Cres = {
  multiLetterOpenings: multiOpenings.map((q) => q.join('')),
  observedOrderIsConsistent: observedConsistent,
  shareOfRandomArrangementsThatAreConsistent: +(okC / DRAWS_C).toPrecision(3),
  p: observedConsistent ? +((okC + 1) / (DRAWS_C + 1)).toPrecision(3) : 1,
};

// =====================================================================
// D. The letters balance the classes of sounds
// =====================================================================
const classes = {
  voiceless: [L.fa, L.hha, L.tha, L.ha, L.shin, L.kha, L.sad, L.sin, L.kaf, L.ta],
  stops: [L.alif, L.jim, L.dal, L.qaf, L.tta, L.ba, L.kaf, L.ta],
  emphatic: [L.sad, L.dad, L.tta, L.zza],
  elevated: [L.kha, L.sad, L.dad, L.ghayn, L.tta, L.qaf, L.zza],
  qalqala: [L.qaf, L.tta, L.ba, L.jim, L.dal],
};
const imbalance = (set) => Object.values(classes).reduce((t, cl) => t + Math.abs(cl.filter((ch) => set.has(ch)).length - cl.length / 2), 0);
const obsD = imbalance(new Set(THE14));
const randD = rng(20261128);
const DRAWS_D = 2000000;
let leD = 0;
const pool = ALPHABET.slice();
for (let d = 0; d < DRAWS_D; d++) {
  for (let i = 0; i < 14; i++) {
    const j = i + Math.floor(randD() * (28 - i));
    const t = pool[i];
    pool[i] = pool[j];
    pool[j] = t;
  }
  if (imbalance(new Set(pool.slice(0, 14))) <= obsD + 1e-9) leD++;
}
const D = {
  presentPerClass: Object.fromEntries(Object.entries(classes).map(([k, cl]) => [k, `${cl.filter((ch) => THE14.includes(ch)).length} of ${cl.length}`])),
  imbalance: obsD,
  smallestPossible: 1,
  p: +((leD + 1) / (DRAWS_D + 1)).toPrecision(3),
};

// =====================================================================
// E. The letter counts are multiples of 19
// =====================================================================
const BASMALA = { [L.ba]: 1, [L.sin]: 1, [L.mim]: 3, [L.alif]: 3, [L.lam]: 4, [L.ha]: 1, [L.ra]: 2, [L.hha]: 2, [L.nun]: 1, [L.ya]: 1 };
const inOpening = (s, ch) => openers.get(s).strings.join('').split('').filter((c) => c === ch).length;
const count = (s, ch, { rule = 'skeleton', basmala = false } = {}) =>
  (counts[rule][s].get(ch) || 0) + inOpening(s, ch) + (basmala && s !== 9 && s !== 1 ? BASMALA[ch] || 0 : 0);
const cases = lettered.flatMap((s) => openers.get(s).letters.map((ch) => ({ s, ch })));
assert.equal(cases.length, 78);
function binomTail(k, n, p) {
  let tail = 0;
  for (let i = k; i <= n; i++) tail += C(n, i) * p ** i * (1 - p) ** (n - i);
  return tail;
}
function testE(opts) {
  const hits = cases.filter(({ s, ch }) => count(s, ch, opts) % 19 === 0);
  return { cases: cases.length, multiplesOf19: hits.length, expectedByChance: r4(cases.length / 19), p: +binomTail(hits.length, cases.length, 1 / 19).toPrecision(3), which: hits.map(({ s, ch }) => `${s}:${ch}=${count(s, ch, opts)}`) };
}
const suraTotals = lettered.map((s) => openers.get(s).letters.reduce((t, ch) => t + count(s, ch), 0));
const sumOver = (suras, letters, opts) => suras.reduce((t, s) => t + letters.reduce((u, ch) => u + count(s, ch, opts), 0), 0);
const claim = (label, claimed, value) => ({ claim: label, khalifa: claimed, thisCount: value, multipleOf19: value % 19 === 0 });
const E = {
  primary: testE({}),
  secondary: {
    strictCount: testE({ rule: 'strict' }),
    basmalaIncluded: testE({ basmala: true }),
    perSuraTotals: {
      suras: 29,
      multiplesOf19: suraTotals.filter((x) => x % 19 === 0).length,
      expectedByChance: r4(29 / 19),
      which: lettered.filter((_, k) => suraTotals[k] % 19 === 0).map((s, k) => `${s}`),
    },
    khalifaHeadlineClaims: [
      claim('qaf in sura 50', 57, count(50, L.qaf)),
      claim('qaf in sura 42', 57, count(42, L.qaf)),
      claim('nun in sura 68', 133, count(68, L.nun)),
      claim('sad across suras 7, 19, 38', 152, sumOver([7, 19, 38], [L.sad])),
      claim('ha + mim across suras 40 to 46', 2147, sumOver([40, 41, 42, 43, 44, 45, 46], [L.hha, L.mim])),
    ],
  },
};

// =====================================================================
// F. Lettered suras form one class
// =====================================================================
const corpus = loadCorpus();
const meta = [];
for (const s of JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'chronology.json'), 'utf8')).suras) meta[s.sura] = s;
const P = makePairs(N);
const FE = nodeFixedEffects(P, N);
const col = (f) => Float64Array.from(P.pairs, ([i, j]) => f(i, j));
function percentileResponse(vecs) {
  const M = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
  for (let i = 1; i <= N; i++) for (let j = i + 1; j <= N; j++) M[i][j] = M[j][i] = cosine(vecs[i], vecs[j]);
  const pct = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
  for (let i = 1; i <= N; i++) {
    const others = [];
    for (let j = 1; j <= N; j++) if (j !== i) others.push(j);
    others.sort((a, b) => M[i][a] - M[i][b]);
    let k = 0;
    while (k < others.length) {
      let e = k;
      while (e + 1 < others.length && M[i][others[e + 1]] === M[i][others[k]]) e++;
      for (let t = k; t <= e; t++) pct[i][others[t]] = (k + e) / 2 / (others.length - 1);
      k = e + 1;
    }
  }
  return col((i, j) => (pct[i][j] + pct[j][i]) / 2);
}
const W = [];
const MVLv = [];
const lem = [];
const bookOpener = [];
const BOOK_ROOTS = new Set(['كتب', 'قرأ', 'نزل']);
for (let s = 1; s <= N; s++) {
  const vs = corpus.suras.get(s);
  lem[s] = lemmasOf(vs);
  W[s] = vs.reduce((t, v) => t + v.words.length, 0);
  MVLv[s] = W[s] / vs.length;
  bookOpener[s] = vs.filter((v) => v.v <= 3).some((v) => v.roots.some((r) => BOOK_ROOTS.has(r)));
}
const idf = idfTable(lem.slice(1));
const Slex = percentileResponse(lem.map((l) => (l ? vector(l, idf) : null)));
const profile = [];
for (let s = 1; s <= N; s++) {
  const rs = rhymes.filter((x) => x.s === s);
  const m = new Map();
  for (const x of rs) m.set(x.key, (m.get(x.key) || 0) + 1 / rs.length);
  profile[s] = m;
}
const Srhyme = percentileResponse(profile);
const isLettered = (s) => openers.has(s);
const BOTH = col((i, j) => (isLettered(i) && isLettered(j) ? 1 : 0));
const BOTHBOOK = col((i, j) => (bookOpener[i] && bookOpener[j] ? 1 : 0));
const base = [
  ...FE,
  col((i, j) => (j - i === 1 ? 1 : 0)),
  col((i, j) => Math.log(j - i)),
  col((i, j) => Math.log(1 + Math.abs(meta[i].egyptian - meta[j].egyptian))),
  col((i, j) => (meta[i].type === meta[j].type ? 1 : 0)),
  col((i, j) => Math.abs(Math.log(W[i]) - Math.log(W[j]))),
  col((i, j) => Math.abs(Math.log(MVLv[i]) - Math.log(MVLv[j]))),
];
const fmt = (label, r) => ({ test: label, beta: r4(r.beta), t: r4(r.t), p: +r.p.toPrecision(3) });
const F = {
  rhyme: fmt('rhyme, both suras lettered', dsp({ y: Srhyme, x: BOTH, Z: base, P, N, perms: 10000, seed: 20261129 })),
  vocabularyWithBookOpenerControl: fmt('vocabulary, both suras lettered, Book-opener controlled', dsp({ y: Slex, x: BOTH, Z: [...base, BOTHBOOK], P, N, perms: 10000, seed: 20261130 })),
  bookOpeners: {
    amongLettered: `${lettered.filter((s) => bookOpener[s]).length} of 29`,
    amongUnlettered: `${Array.from({ length: N }, (_, k) => k + 1).filter((s) => !isLettered(s) && bookOpener[s]).length} of 85`,
  },
};

const out = { preregistrationSha256: preregHash, A_rhyme: A, B_letterforms: B, C_order: Cres, D_soundClasses: D, E_nineteen: E, F_class: F };
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'batch8.json'), JSON.stringify(out, null, 2));
const brief = JSON.parse(JSON.stringify(out));
delete brief.A_rhyme.secondary.lettersFormOwnVerse.perSura;
delete brief.A_rhyme.secondary.exactKey.perSura;
console.log(JSON.stringify(brief, null, 1));
