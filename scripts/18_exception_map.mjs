// Descriptive only (no test): which suras are most out of place for a strict
// longest-first order, and are they more like their mushaf neighbours than the
// neighbours a strict sort would give them?
import fs from 'node:fs';
import path from 'node:path';
import { loadCorpus, ROOT_DIR } from '../src/corpus.mjs';
import { loadLetterData } from '../src/letters.mjs';
import { idfTable, vector, cosine, lemmasOf } from '../src/similarity.mjs';
import { mean } from '../src/stats.mjs';

const N = 114;
const r4 = (x) => +x.toFixed(3);
const corpus = loadCorpus();
const { openers } = loadLetterData();
const words = [];
const lem = [];
for (let s = 1; s <= N; s++) {
  const vs = corpus.suras.get(s);
  lem[s] = lemmasOf(vs);
  words[s] = vs.reduce((t, v) => t + v.words.length, 0);
}
const idf = idfTable(lem.slice(1));
const vec = lem.map((l) => (l ? vector(l, idf) : null));
const M = Array.from({ length: N + 1 }, () => new Float64Array(N + 1));
for (let i = 1; i <= N; i++) for (let j = i + 1; j <= N; j++) M[i][j] = M[j][i] = cosine(vec[i], vec[j]);
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
const S = (i, j) => (pct[i][j] + pct[j][i]) / 2;

const mushaf = Array.from({ length: N - 1 }, (_, k) => k + 2);
const sorted = mushaf.slice().sort((a, b) => words[b] - words[a]);
const neighbours = (order, s) => {
  const k = order.indexOf(s);
  return [order[k - 1], order[k + 1]].filter(Boolean);
};
const rows = mushaf.map((s) => {
  const actual = neighbours(mushaf, s);
  const bySort = neighbours(sorted, s);
  const a = mean(actual.map((n) => S(s, n)));
  const b = mean(bySort.map((n) => S(s, n)));
  return {
    sura: s,
    words: words[s],
    letters: openers.has(s) ? openers.get(s).family : '',
    mushafPosition: mushaf.indexOf(s) + 1,
    lengthRank: sorted.indexOf(s) + 1,
    displacement: mushaf.indexOf(s) - sorted.indexOf(s),
    mushafNeighbours: actual,
    strictSortNeighbours: bySort,
    similarityToMushafNeighbours: r4(a),
    similarityToStrictSortNeighbours: r4(b),
    gain: r4(a - b),
  };
});
const big = rows.filter((r) => Math.abs(r.displacement) >= 10);
const small = rows.filter((r) => Math.abs(r.displacement) < 10);
const summary = (set) => ({ suras: set.length, withGain: set.filter((r) => r.gain > 0).length, withLoss: set.filter((r) => r.gain < 0).length, meanGain: r4(mean(set.map((r) => r.gain))) });
const out = {
  note: 'Descriptive. No test attached.',
  displacedByTenOrMorePlaces: summary(big),
  displacedByFewerThanTen: summary(small),
  mostDisplaced: rows.slice().sort((x, y) => Math.abs(y.displacement) - Math.abs(x.displacement)).slice(0, 12),
};
fs.writeFileSync(path.join(ROOT_DIR, 'results', 'exception_map.json'), JSON.stringify({ ...out, all: rows }, null, 1));
console.log(JSON.stringify(out.displacedByTenOrMorePlaces), JSON.stringify(out.displacedByFewerThanTen));
for (const r of out.mostDisplaced) console.log(r.sura, 'words', r.words, 'letters', r.letters || '-', 'pos', r.mushafPosition, 'lenRank', r.lengthRank, 'disp', r.displacement, 'nb', r.mushafNeighbours.join(','), 'vs', r.strictSortNeighbours.join(','), 'sim', r.similarityToMushafNeighbours, 'vs', r.similarityToStrictSortNeighbours, 'gain', r.gain);
