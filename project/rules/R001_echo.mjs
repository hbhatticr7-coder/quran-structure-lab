// R001. Echo: where the text chooses between words, it uses the one whose
// root occurs most often in the verses around it.
//
// This is the finding of batch 4 turned into a rule. Batch 4 looked at the
// whole text, so the test score of this rule is not fully clean.
//
// Tuning on the build suras: the rule was first tried on verse endings as well.
// There it was right 39% of the time against 55% for the baseline, so endings
// were dropped before the rule was tested.
export default {
  id: 'R001',
  title: 'Echo: the word chosen is the one whose root is commonest in the ten verses either side',
  author: 'claude',
  provenance: 'Batch 4 (phrase-level local fit), which used the whole text.',
  appliesTo: ['frame', 'synonym'],
  predict(occ, problem, ctx) {
    const counts = new Map(problem.options.map((o) => [o, 0]));
    for (const verse of ctx.window(10))
      for (const w of verse.words) {
        if (w.hidden) continue;
        for (const o of problem.options) {
          const info = problem.optionInfo[o];
          if ((w.root && info.roots.includes(w.root)) || info.tokens.includes(w.token)) counts.set(o, counts.get(o) + 1);
        }
      }
    const ranked = [...counts].sort((a, b) => b[1] - a[1]);
    if (ranked[0][1] === 0 || (ranked[1] && ranked[1][1] === ranked[0][1])) return null; // no echo, or a tie: no answer
    return ranked[0][0];
  },
};
