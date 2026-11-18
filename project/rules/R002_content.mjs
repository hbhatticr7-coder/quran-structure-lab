// R002. Content: the word chosen is the one that, in the build suras, keeps
// company with the other words found around this place.
//
// This is a learned rule, not a hand-written one. For each option it counts,
// over the build suras, which word-roots appear near it. To predict a new
// place, it asks which option's usual company best matches the words here
// (a naive Bayes classifier: each root present votes, weighted by how much
// more often it goes with one option than another).
//
// It says nothing by itself about WHY a word is chosen. It measures how much
// of the choice can be read off the surrounding words, and its strongest
// features are candidates for rules a person can state.
//
// Tuning on the build suras (see project/LOG.md, 2026-11-18):
// - Looking at the verse alone (WINDOW 0) did better than adding neighbouring verses.
// - On verse endings the rule did worse than the baseline (66% against 70%),
//   and on repeated phrases and paired words it showed no gain, so it is
//   applied to near-synonyms only.

export function make({ window, minSeen = 2, smoothing = 0.5 }) {
  const models = new WeakMap(); // one model per problem and per set of known occurrences

  // The roots (or bare words) present within `window` verses, slot words left out.
  function features(verses, skip) {
    const out = new Set();
    for (const verse of verses)
      for (const w of verse.words) {
        if (w.hidden || (skip && skip.has(`${w.s}:${w.v}:${w.w}`))) continue;
        out.add(w.root || w.token);
      }
    return out;
  }

  function train(problem, ctx) {
    const known = ctx.build.filter((o) => problem.options.includes(o.chosen));
    const n = new Map(problem.options.map((o) => [o, 0]));
    const seen = new Map(); // feature -> Map(option -> number of known places having it)
    for (const o of known) {
      n.set(o.chosen, n.get(o.chosen) + 1);
      const skip = new Set(o.slots.map((w) => `${o.s}:${o.v}:${w}`));
      const verses = [];
      for (let d = -window; d <= window; d++) {
        const words = ctx.verse(o.s, o.v + d);
        if (words) verses.push({ words });
      }
      for (const f of features(verses, skip)) {
        if (!seen.has(f)) seen.set(f, new Map());
        seen.get(f).set(o.chosen, (seen.get(f).get(o.chosen) || 0) + 1);
      }
    }
    for (const [f, m] of seen) if ([...m.values()].reduce((a, b) => a + b, 0) < minSeen) seen.delete(f);
    return { n, seen, total: known.length };
  }

  return function predict(occ, problem, ctx) {
    if (!models.has(ctx.build)) models.set(ctx.build, train(problem, ctx));
    const { n, seen, total } = models.get(ctx.build);
    if (total < 6) return null; // too little to learn from
    const here = features(ctx.window(window));
    let best = null;
    let bestScore = -Infinity;
    let second = -Infinity;
    for (const o of problem.options) {
      const k = n.get(o);
      if (!k) continue;
      let score = Math.log(k / total);
      for (const [f, m] of seen) {
        const p = ((m.get(o) || 0) + smoothing) / (k + 2 * smoothing);
        score += Math.log(here.has(f) ? p : 1 - p);
      }
      if (score > bestScore) {
        second = bestScore;
        bestScore = score;
        best = o;
      } else if (score > second) second = score;
    }
    return best;
  };
}

const WINDOW = 0;
const MIN_SEEN = 2;

export default {
  id: 'R002',
  title: 'Content: among near-synonyms, the word chosen is the one that usually keeps company with the other words of the verse',
  author: 'claude',
  provenance: 'A standard classifier, learned from the build suras at prediction time. Before writing it the author had seen one thing from the test suras: the overall score of rule R001 on synonyms there (no gain over the baseline).',
  appliesTo: ['synonym'],
  predict: make({ window: WINDOW, minSeen: MIN_SEEN }),
};
