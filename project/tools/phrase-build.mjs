// Build-only design diagnostics for the version-5 phrase census.
import { loadText, loadSplit, majority } from './lib.mjs';
import { makePhraseProblems } from './phrases.mjs';
const { corpus } = loadText('build');
const { sets } = loadSplit();
const OTHER = '(other)';
const info = (tokens) => Object.fromEntries(tokens.map((token) => [token, { tokens: [token], roots: [] }]));
const variants = [
  { name: 'old-three-lemma', radius: 3, context: 'lemma', aligned: false },
  { name: 'two-lemma', radius: 2, context: 'lemma', aligned: false },
  { name: 'two-form', radius: 2, context: 'form', aligned: false },
  { name: 'two-form-aligned', radius: 2, context: 'form', aligned: true },
];
const results = variants.map((variant) => {
  const problems = makePhraseProblems(corpus, sets.build, info, OTHER, variant);
  const folds = { known: 0, unseen: 0, baselineCorrect: 0, alignedKnown: 0 };
  for (const [defining, scoring] of [[sets.foldA, sets.foldB], [sets.foldB, sets.foldA]]) {
    for (const problem of makePhraseProblems(corpus, defining, info, OTHER, variant)) {
      const baseline = majority(problem.occurrences.filter((o) => defining.has(o.s)));
      for (const occ of problem.occurrences.filter((o) => scoring.has(o.s))) {
        if (occ.chosen === OTHER) { folds.unseen++; continue; }
        folds.known++;
        folds.baselineCorrect += baseline === null ? 1 / problem.options.length : Number(baseline === occ.chosen);
        folds.alignedKnown += Number(problem.definition.kind === 'aligned');
      }
    }
  }
  return { ...variant, problems: problems.length, places: problems.reduce((n, p) => n + p.occurrences.length, 0),
    alignedProblems: problems.filter((p) => p.definition.kind === 'aligned').length,
    alignedPlaces: problems.filter((p) => p.definition.kind === 'aligned').reduce((n, p) => n + p.occurrences.length, 0), folds };
});
console.log(JSON.stringify({ scope: 'Build suras only; no rule scores, test suras or vault.', results }, null, 2));
