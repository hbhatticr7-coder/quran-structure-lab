// R005. "Human being": bashar for "a human" as a kind of creature, insan for "man".
//
// The classical and modern account (al-Raghib; Bint al-Shati', al-Tafsir
// al-bayani): bashar is the human as a bodily creature, one of a kind set
// beside angels and God ("you are nothing but a human like us"). Insan is man
// as the one who is addressed, tested and described ("man is ever ungrateful").
//
// That difference shows in the grammar. Bashar classifies someone, so it comes
// without the article ("a human"). Insan names mankind, so it comes with it
// ("man", literally "the human").
//
// The rule: if the hidden word has the definite article, answer insan; if it
// is indefinite, answer bashar.
//
// In the build suras: with the article, 42 insan and 5 bashar; without it,
// 20 bashar and 2 insan (plus the plural "people", counted with insan).
export default {
  id: 'R005',
  title: '"Human being": bashar when the word classifies someone as a human (indefinite), insan when it names mankind (definite)',
  author: 'claude',
  provenance:
    'The distinction is from al-Raghib and from Bint al-Shati\'. Reading it off the definite article was the author\'s step, checked on the build suras. Batch 15 studied this pair on the whole text. The author knows many of the verses from training.',
  appliesTo: ['synonym'],
  predict(occ, problem, ctx) {
    if (problem.id !== 'synonym:human') return null;
    const [slot] = ctx.slot();
    if (slot.feats.includes('DEF')) return 'insan';
    if (slot.feats.includes('INDEF')) return 'bashar';
    return null;
  },
};
