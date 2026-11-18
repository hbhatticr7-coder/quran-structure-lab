// Descriptive check of baseline granularity on BUILD suras only. No rule is
// run, no test/vault partition is loaded, and no ledger or site file is written.
// The alternatives are diagnostic controls, not a selected replacement policy.
import assert from 'node:assert/strict';
import { loadText, loadSplit, problemsDefinedOn, formClass, formBaseline, majority, FORM_MIN, OTHER } from '../tools/lib.mjs';

const { corpus } = loadText('build');
const { sets } = loadSplit();
assert.ok(corpus.verses.every((v) => sets.build.has(v.s)));
const wordAt = (o) => corpus.at(o.s, o.v).words.find((w) => w.w === o.slots[0]);
const moodVoice = /^(PASS|MOOD:(IND|SUBJ|JUS))$/;
const remainingInflection = /^(PASS|MOOD:(IND|SUBJ|JUS)|NOM|ACC|GEN|[123]?[MF]?[SDP]|[MF])$/;
const enriched = (word, allowed) => `${formClass(word)}|${word.feats.filter((f) => allowed.test(f)).sort().join('+') || '-'}`;
const classes = {
  plain: () => 'all',
  method4: formClass,
  plusMoodVoice: (w) => enriched(w, moodVoice),
  plusMoodVoiceAgreementCase: (w) => enriched(w, remainingInflection),
};
function tally(occurrences, keyOf) {
  const groups = new Map();
  for (const o of occurrences) {
    if (o.chosen === OTHER) continue;
    const key = keyOf(wordAt(o));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  }
  return groups;
}
function snapshot(problem) {
  const known = problem.occurrences.filter((o) => o.chosen !== OTHER);
  return {
    problem: problem.id, occurrences: known.length,
    forms: [...tally(known, formClass)].map(([form, examples]) => ({
      form, count: examples.length, options: Object.fromEntries(problem.options.map((option) => [option, examples.filter((o) => o.chosen === option).length])),
      fallback: examples.length < FORM_MIN || majority(examples) === null,
    })).sort((a, b) => a.form.localeCompare(b.form)),
  };
}
const fullBuild = problemsDefinedOn('build', 'build').filter((p) => p.type === 'synonym');
const statistics = Object.fromEntries(Object.keys(classes).map((name) => [name, {
  knownPlaces: 0, unseenPlaces: 0, correct: 0, fallbackPlaces: 0, sparsePlaces: 0, tiedPlaces: 0,
}]));
const perProblem = {};
for (const [defining, scored] of [['foldA', 'foldB'], ['foldB', 'foldA']]) {
  for (const problem of problemsDefinedOn(defining, 'build').filter((p) => p.type === 'synonym')) {
    const known = problem.occurrences.filter((o) => sets[defining].has(o.s));
    const plain = majority(known);
    const productionAt = formBaseline(known, corpus, plain);
    const groups = Object.fromEntries(Object.entries(classes).map(([name, keyOf]) => [name, tally(known, keyOf)]));
    perProblem[problem.id] ||= Object.fromEntries(Object.keys(classes).map((name) => [name, { knownPlaces: 0, correct: 0, fallbackPlaces: 0 }]));
    for (const occ of problem.occurrences.filter((o) => sets[scored].has(o.s))) {
      for (const [name, keyOf] of Object.entries(classes)) {
        const out = statistics[name];
        if (occ.chosen === OTHER) { out.unseenPlaces++; continue; }
        const same = groups[name].get(keyOf(wordAt(occ))) || [];
        const sparse = name !== 'plain' && same.length < FORM_MIN;
        const tied = name !== 'plain' && same.length >= FORM_MIN && majority(same) === null;
        const fallback = sparse || tied;
        const prediction = name === 'plain' || fallback ? plain : majority(same);
        if (name === 'method4') assert.equal(prediction, productionAt(occ));
        const correct = prediction === null ? 1 / problem.options.length : Number(prediction === occ.chosen);
        out.knownPlaces++; out.correct += correct;
        out.fallbackPlaces += Number(fallback); out.sparsePlaces += Number(sparse); out.tiedPlaces += Number(tied);
        const detail = perProblem[problem.id][name];
        detail.knownPlaces++; detail.correct += correct; detail.fallbackPlaces += Number(fallback);
      }
    }
  }
}
for (const out of Object.values(statistics)) out.accuracy = out.knownPlaces ? +(out.correct / out.knownPlaces).toFixed(4) : null;
console.log(JSON.stringify({
  scope: 'Build suras only. Two defining/scoring halves, both directions. No significance tests or policy selection.',
  formMinimum: FORM_MIN, baselineDefinitions: {
    plain: 'Per-problem majority; a tie receives expected uniform-guess credit.',
    method4: 'Production formClass and formBaseline (asserted equal at every known place).',
    plusMoodVoice: 'Add PASS and MOOD:IND/SUBJ/JUS to method4.',
    plusMoodVoiceAgreementCase: 'Also add person/number/gender tags and NOM/ACC/GEN. No lemma, root or derived verb-form tag.',
  },
  fullBuild: fullBuild.map(snapshot), crossValidation: statistics, perProblem,
}, null, 2));
