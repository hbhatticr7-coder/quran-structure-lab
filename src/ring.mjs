// Ring test with a matching null: is the claimed mirror pairing of a text's
// sections better (in summed similarity) than the other ways of pairing them?
import { vector, cosine } from './similarity.mjs';
import { allMatchings, mean, sd } from './stats.mjs';

// sections: [[name, lemmaArray], ...] (centre already excluded)
// mirrorPairs: [[nameA, nameB], ...]
export function ringTest({ sections, mirrorPairs, idf }) {
  const vec = new Map(sections.map(([name, lemmas]) => [name, vector(lemmas, idf)]));
  const names = sections.map((s) => s[0]);
  const sim = (a, b) => cosine(vec.get(a), vec.get(b));
  const score = (m) => m.reduce((t, [a, b]) => t + sim(a, b), 0);
  const scores = allMatchings(names).map(score);
  const claimed = score(mirrorPairs);
  const m = mean(scores);
  const s = sd(scores);
  const ge = scores.filter((x) => x >= claimed - 1e-12).length;
  const r4 = (x) => +x.toFixed(4);
  return {
    sectionSizes: Object.fromEntries(sections.map(([name, lemmas]) => [name, lemmas.length])),
    pairings: scores.length,
    claimedScore: r4(claimed),
    nullMean: r4(m),
    nullSd: r4(s),
    z: r4((claimed - m) / s),
    exactP: +(ge / scores.length).toPrecision(3),
    rankAmongPairings: `${ge} of ${scores.length}`,
    pairs: mirrorPairs.map(([a, b]) => {
      const others = names.filter((n) => n !== a).map((n) => [n, sim(a, n)]).sort((x, y) => y[1] - x[1]);
      return {
        pair: `${a} / ${b}`,
        similarity: r4(sim(a, b)),
        partnerRank: `${others.findIndex((o) => o[0] === b) + 1} of ${others.length}`,
        closestPartner: others[0][0],
      };
    }),
  };
}
