// R004. "Fear": khawf for fear of what may happen, khashya for fear of someone.
//
// The classical account (al-Raghib, al-Askari): khawf is expecting a harm;
// khashya is fear joined with regard for the greatness of the one feared, and
// so it takes a being as its object, above all God.
//
// The rule, in the order applied:
//   1. Fear of an outcome -> khawf. Recognised by "that" or "upon/for" straight
//      after the word ("I fear that ...", "no fear upon them", "I fear for
//      you"), or "if" or "indeed" straight before it ("if you fear",
//      "indeed I fear").
//   2. Fear of a being -> khashya. Recognised by God, the Lord, the Merciful
//      or "the people" as the very next word.
//   3. Otherwise no answer.
//
// The rule looks only at the word before and the word after. It was written
// from the classical account and then checked on the build suras; the lists of
// words below were fixed there. In the build suras it answers 26 of 75 places
// and is right on 23; the baseline is right on 18 of the same 26.
const OUTCOME_AFTER = new Set(['أَن', 'عَلَى']); // that; upon, for
const OUTCOME_BEFORE = new Set(['إِن', 'إِنّ']); // if; indeed
const BEINGS = new Set(['اللَّه', 'رَبّ', 'رَحْمٰن', 'ناس']); // God, Lord, the Merciful, people

export default {
  id: 'R004',
  title: '"Fear": khawf for fear of what may happen, khashya for fear of a being (God or people)',
  author: 'claude',
  provenance:
    'The distinction is from the classical works on near-synonyms (al-Raghib, Mufradat; al-Askari, al-Furuq). The cues that recognise each case were chosen on the build suras. Batch 15 studied this pair on the whole text. The author knows many of the verses from training.',
  appliesTo: ['synonym'],
  predict(occ, problem, ctx) {
    if (problem.id !== 'synonym:fear') return null;
    const words = ctx.verse();
    const i = words.findIndex((w) => w.hidden);
    const before = words[i - 1];
    const after = words[i + 1];
    if (after && !after.hidden && OUTCOME_AFTER.has(after.token)) return 'khawf';
    if (before && !before.hidden && OUTCOME_BEFORE.has(before.token)) return 'khawf';
    if (after && !after.hidden && BEINGS.has(after.token)) return 'khashya';
    return null;
  },
};
