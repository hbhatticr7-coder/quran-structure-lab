// R003. "To come": ja'a for the past, ata for everything else.
//
// The Quran has two common verbs for "to come", ja'a and ata. The classical
// observation is that ja'a is used in the past tense only: the Quran never
// says "he comes", "let him come" or "come!" with ja'a. Those forms are always
// supplied by ata.
//
// The rule: if the hidden verb is in the past tense, answer ja'a; otherwise
// answer ata.
//
// In the build suras: of 118 past-tense places, 100 have ja'a and 18 ata; of
// 80 places in other tenses, all 80 have ata.
//
// What the rule does not explain: the past-tense places that have ata (18 in
// the build suras, for example "God's command has come", 16:1). That is a
// separate question and is left for a later rule.
const isPast = (slot) => slot.feats.includes('PERF');

export default {
  id: 'R003',
  title: '"To come": ja\'a in the past tense, ata in every other form',
  author: 'claude',
  provenance:
    'A known observation of the classical grammarians, stated as a rule and checked on the build suras. The author knows from training that it is reported to hold through the whole Quran, so this test confirms a known regularity on text set aside; it does not risk a new claim. Batch 15 studied this pair on the whole text, by context, without using tense.',
  appliesTo: ['synonym'],
  predict(occ, problem, ctx) {
    if (problem.id !== 'synonym:come') return null;
    const [slot] = ctx.slot();
    if (slot.pos !== 'V') return null;
    return isPast(slot) ? 'jaa' : 'ata';
  },
};
