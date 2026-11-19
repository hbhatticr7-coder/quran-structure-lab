# Wider phrases and comparison experiment 2

Codex, 2026-11-19. Linked tasks 4 and 12, claimed and pushed in `26f6fbb` and `80f19ec`. This protocol, code, catalogue and build results must be committed and pushed before any new test score. Keep experiment 1's split, build/test results and report intact.

## Phrase definition

The build-only examples in `project/sites/frame.json` were read first. They include closing attributes after “over every thing,” openings before “those who believed and did,” and closing choices after “does not guide the people.” Dictionary-word keys collapse distinct attached particles and grammatical forms. Three words on either side also miss a local choice when the third changes. An insertion can break the fixed window even when most of the verse is shared.

Method **5** uses **two written words on each side** of one hidden word, with boundary markers and at least two real context words. Native Quran context forms retain spelling, vowel marks and attached segments, normalized to NFC. Options remain dictionary tokens. A frame needs at least two options in the defining suras. This controls more of the visible form; it does not establish that the alternatives are interchangeable synonyms.

The aligned extension uses only defining verses. Candidate pairs share a written-word bigram; skip bigrams appearing in more than 400 defining verses. Pairs need four LCS matches and 70% similarity relative to the longer verse. A one-for-one substitution between consecutive matches supplies a slot. Its immediate left/right words are anchors, and each defining verse with that slot removed becomes a masked prototype.

An occurrence matches only if its anchors agree and its **masked remainder** has four matches and 70% LCS similarity to a frozen prototype. The answer never participates in this decision. Insertions elsewhere are allowed; multiword substitutions and empty slots remain outside this experiment. Local frames own their slots first. Aligned templates use only remaining slots and need two build options after that exclusion. An unseen answer cannot switch frames. Each physical phrase slot is counted once; other census types can still ask different questions about the same word.

## Build-only design evidence

`phrase-build.mjs` produces `project/phrase-build.json` on the existing build folds. No new test result was used to choose this definition.

| Definition | Build problems | Build places | Known places in build validation folds | Unseen there |
|---|---:|---:|---:|---:|
| Old three-word lemma context | 233 | 725 | 114 | 60 |
| Two-word lemma context | 663 | 2,491 | 617 | 327 |
| Two-word written context | 334 | 1,290 | 375 | 127 |
| Written context plus alignment | 334 | 1,290 | 375 | 127 |

Alignment works on insertion fixtures but adds no Quran build choices after local ownership. Keep this negative finding. Written contexts trade some coverage for control of visible form. This is exploratory build development after earlier test exposure. No rule was tuned; existing rule files and ledger scores stay unchanged.

## Comparison inputs

Reuse the exact source hashes, unit IDs and partitions in `project/comparison/split.json`. Never remake them. Quran data use only `loadText('build'|'test')`. Excluded comparison chapters/tractates are selected out before word tokenization and never reach definitions or scoring. Source bytes are read for hash checking and section selection; Mishnah JSON holds text strings before allowed tractates are selected. No Quran vault or comparison reserve is opened for analysis.

**Common surface arm, all four collections:** retain all orthographic words, including function words and one-letter words. Strip vowel/recitation marks; decompose Greek to strip accents but preserve precomposed Arabic hamza letters. Lowercase and use NFC. Both context and target use these normalized written forms. All predictor inputs have roots and grammatical features removed. Use the same phrase builder. This is the primary representation control.

**Lexical arm:** Quran uses QAC tokens; Greek uses all MorphGNT lemmas; Biblical Hebrew uses the annotated stem's Strong identifier including any homonym suffix, or a function-word identifier when there is no stem. Context keeps written forms. No roots or grammar are supplied to the predictors. Run phrase and synonym controls for these three collections. Mishnah lacks lemma annotation: its separate lexical contrast uses explicit surface forms, is not called a matched lemma experiment, and does not duplicate its surface phrase score.

Sources: [MorphGNT](https://github.com/morphgnt/sblgnt), [OSHB](https://github.com/openscriptures/morphhb), and the existing [Sefaria Mishnah download](https://developers.sefaria.org/reference/get-v3-texts). Reuse the existing downloads. Texts remain ignored; only isolated option tokens, provenance and aggregate results are committed. This improves matching but does not equalize genre, unit length, annotation, segmentation or dependence between parallel accounts. Surface prediction also differs from dictionary-word prediction. Neither arm supports a literary or theological ranking.

## Sourced lexical controls

`synonym-candidates.json` fixes the candidate list. `compile-comparison-sets.mjs` compiles explicit tokens from build units into `synonyms-v2.json`. Require **five examples per option in the defining units**, separately within each fold. Retain ineligible candidates and their build counts. No sense disambiguation is claimed.

- Greek asking (erotao/aiteo), speaking (lego/laleo), and love (agapao/phileo): [Strong's Greek entries](https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js). The asking overlap is also described by [Liddell–Scott through the Centre for the Greek Language](https://www.greek-language.gr/digitalResources/ancient_greek/tools/liddell-scott/search.html?lq=%E1%BC%90%CF%81%CF%89%CF%84%CE%AC%CF%89). Love fails the build minimum (12 versus 3); do not examine its test occurrences to rescue it.
- Biblical Hebrew speaking (H559/H1696) and heart (H3820/H3824): [Open Scriptures' Strong lexicon](https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/HebrewStrong.xml). The build token for H3820 is `3820 a`. The heart pair includes shorter/longer lexical variants, not an assumed semantic distinction.
- Mishnah illan/etz: Jastrow's [illan](https://www.sefaria.org/Jastrow%2C_%D7%90%D6%B4%D7%99%D7%9C%D6%B8%D6%BC%D7%9F.1) and [etz](https://daf-yomi.com/Dictionary.aspx?id=8&wordId=72253) entries. Match listed singular/plural/construct stems with zero to two prefix letters from `ובכלמשה`, then retain only build-attested forms. This limited spelling list is not a morphological analyzer. Etz includes wood/pole senses, so this is a broad lexical contrast.
- Quran: snapshot the existing nine sets and apply the same comparison minimum, removing roots. This does not change the native Quran synonym list or its grammar baseline.

The dictionaries support overlapping glosses or related lexical forms. Classifier success here need not establish a fine distinction between freely interchangeable words.

## Predictions and scores fixed before test

**C001_echo** is R001's unchanged function, restricted to frames and given root-free inputs. **C002_frame** applies R002's unchanged function to frames as in experiment 1. **R002** itself runs on the eligible lexical contrasts. Keep its settings: window zero, minimum feature count two, smoothing 0.5, six training examples. Neither comparison arm overwrites a Quran rule ledger.

The comparison baseline is the per-problem defining-unit majority, with expected uniform credit for ties. No hidden target grammar is given to either side. This differs from the native Quran grammar-matched baseline; do not compare their headline percentages as the same task.

Build validation ranks build units by current all-word count and alternates halves, defining on one and scoring the other in both directions. Test definitions use all build units. Unknown options are misses in all-place scores, excluded from gain tests, and not passed to a rule. Report known places, answers, accuracy, baseline on those answers, occurrence and unit-block gain p-values, unknown options, and all-place accuracy using baseline fallback. Report R002 per-set results descriptively alongside its fixed aggregate.

Report every declared collection and arm. These are multiple descriptive comparisons on previously exposed texts, with unadjusted p-values. None changes a pass status; do not select a global claim from whichever corpus or arm looks best.

## Exposure and execution

Both models know these texts from training. Earlier whole-text batches, comparison experiment 1, R001–R005 and the R003 challenge exposed test summaries; the challenge also inspected some Quran test choices. This is **a new frozen procedure on reused test data**, not independent blind confirmation. Preserve all earlier results and both reserves.

Use Node 24 (`.nvmrc`); the guard needs [Node's synchronous module hooks](https://nodejs.org/api/module.html#moduleregisterhooksoptions). Run the required guard suites and the new phrase, adapter and comparison fixtures.

```bash
node project/tools/compile-comparison-sets.mjs > project/comparison/synonyms-v2.json
node project/tools/comparison-v2.mjs --build
# Commit and push the complete method, catalogue, protocol and build results.
node project/tools/comparison-v2.mjs --test
node project/tools/census.mjs
node project/tools/scoreboard.mjs
```

The new test writes `project/comparison/v2/test.json` once, records the published commit, input/source hashes and runtime, and refuses overwrite. The loader guard checks tracked inputs against the commit; ignored external sources must match the original manifest hashes. Native census and scoreboard regeneration use the same already-published definition. No frozen rule file or ledger score changes.
