# Structure in the Quran's arrangement: what seventeen pre-registered batches of tests found

14 November 2026. Working report. Full numbers and limits for every test are in `RESULTS.md`.

## Summary

The order of suras in the mushaf is more than a sort by length. Neighbouring suras share vocabulary and rhyme beyond what their lengths and revelation dates predict, and the places where the mushaf breaks the longest-first rule are the places that produce this. None of 15,541 random orders that break the rule equally often did as well.

This is not particular to the Quran. The Mishnah, a collection arranged by length by its human editors, shows the same pattern at the same strength. The finding is evidence that the mushaf was arranged deliberately; it is not evidence of anything beyond what careful human arrangement produces.

Seventeen batches of tests were run. Each had its measures, comparison and pass mark written down before the code was written, and each was run once. Several claims failed, including predictions of my own. The findings are sorted below by how well they held.

## Findings

### Established

Passed a pre-registered test and survived the checks set for it.

| Finding | Evidence |
|---|---|
| Mushaf neighbours share vocabulary beyond length and date | +5.4 percentile points, p = 0.0004; holds under a second chronology (batch 2) |
| Mushaf neighbours share rhyme beyond length and date | +7.1 points, p = 0.0004; survives removal of its five strongest pairs (batch 6) |
| The exceptions to the length rule raise neighbour resemblance | Vocabulary 0.623 against 0.554 for random exceptions, p = 0.00006; rhyme p = 0.0002; holds with all lettered suras removed (batch 11) |
| The Mishnah's exceptions to its length rule do the same | Adjacent tractates 0.822 against 0.740 for random exceptions, p = 0.0001; holds for true exceptions alone (batch 13) |
| Each telling of a prophet's story is fitted to its sura | The details particular to a Moses telling recur in the rest of its sura twice as often as in other suras (25% against 12%, p = 0.00006); holds for five of six other prophets (batch 16) |
| Sura 12 is a ring in its wording | Farrin's mirror pairing is the best of 945; the Genesis telling shows none under its published outline, p = 0.62 (batches 1, 3) |
| Suras with opening letters form one class | Alike in rhyme (+13.1 points, p = 0.0001) and in vocabulary (+5.0), whichever letters they carry (batches 7, 8) |
| The opening letters keep one internal order | 0.11% of random arrangements are as consistent (batch 8) |

### Suggestive

Passed at the ordinary level but with a known weakness.

| Finding | Weakness |
|---|---|
| The traditional sura pairs stand out from other neighbours | In vocabulary only (+8.1 points, p = 0.0045, a follow-up test); not in rhyme (p = 0.32) |
| A change of rhyme inside a sura tends to mark a change of subject | 29 of 39 suras, p = 0.014; the effect is small |
| The 14 opening letters have 14 different shapes, balanced sound classes, and tend to follow the old abjad order | p = 0.014, 0.026 and 0.010; all three were noticed by scholars before being tested, and all describe the same 14 letters |
| Letter-names rhyme with their suras | 17 of 19 where the letters form a verse, p = 0.021; the verse division may itself follow the rhyme |
| Sura 50 is unusually rich in the letter qaf | Highest rate of any sura with 1,000 or more letters; the sura's subject may simply favour the letter |
| Where a repeated phrase varies by one word, the word used recurs nearby | Real (p = 0.0006), but the Gospels and Samuel-Kings-Chronicles do the same to the same degree |

### Not supported

| Claim | Result |
|---|---|
| Farrin's 19 groups of suras | Boundaries no better than random ones, p = 0.49 |
| Rings in suras 2 and 3 | Pairings rank 4th and 7th of 15 |
| The close of each sura links to the opening of the next, as a general rule | Seam no stronger than its reverse, p = 0.79; 23 individual seams are strong and are mapped in `SEAMS.md` (batch 14) |
| Warning verses sound harsh and mercy verses soft | With the marker words removed: hard consonants 15.4% against 14.5% (p = 0.063), soft consonants no difference, long vowels the opposite way to the prediction. Letter differences trace to common words (batch 17) |
| Rings found without an outline, across all suras | 2 of 47 suras flagged, the detector's own error rate; 5 of 161 biblical chapters. The detector also missed sura 12, so this null is weak (batch 12) |
| Suras with the same letters form families | No effect once neighbourhood and date are controlled, p = 0.80 |
| A sura's letters are unusually frequent in it, as a general rule | Rests on sura 50; nothing for the ALM, ALR and HM suras |
| Letter counts are multiples of 19 | 5 of 78, against about 4 by chance |
| Lettered suras talk more about scripture (my prediction) | No difference beyond their opening lines, p = 0.56 |
| The letters' order runs from throat to lips (my prediction) | p = 0.061; the abjad order fits better |
| A vocabulary signature for lettered suras | Failed its validation; median p = 0.18 over 40 split-half tests |

### Classical claims about near-synonyms (batch 15)

Each claim was checked against every occurrence by a rule fixed in advance. The atlas of what company each word keeps is in `ATLAS.md`.

| Claim | Verdict |
|---|---|
| *matar* is rain as punishment, *ghayth* rain as mercy | Holds: 15 of 15, on very small numbers |
| *halafa* for the oaths of liars, *aqsama* for solemn oaths | Holds: 8 of 13 against 1 of 20; every oath in God's voice uses *aqsama* |
| A destructive wind is singular; the plural is merciful | Holds as a tendency: the plural is never harmful, the singular is not always |
| *fu'ad* is the heart beside hearing and sight | Holds as a tendency: 44% against 5%; all 16 uses are Meccan |
| *khashya* is fear of God, *khawf* fear in general | Holds as a tendency: 42% against 15% |
| *anzala* for the Torah and Gospel, *nazzala* for the Quran | Does not hold beyond the verse it is built on (3:3) |
| *sana* for years of hardship, *'am* for years of ease | Does not hold as a rule: 22 of 28 occurrences are plain counts of time |

## The main finding in more detail

After sura 1 the mushaf runs roughly longest to shortest, but 6.7% of sura pairs are out of order. The question was whether those exceptions are arbitrary.

| | Mushaf | Strict longest-first | Random exceptions |
|---|---|---|---|
| Vocabulary similarity of neighbours (chance 0.50) | 0.623 | 0.599 | 0.554 |
| Rhyme similarity of neighbours | 0.628 | 0.585 | 0.557 |
| Adjacent pairs with identical opening letters | 13 | 1 | 1.8 |

Breaking the length rule at random makes neighbours less alike. The mushaf breaks it as often and ends up above a perfect sort. The length sort accounts for about 80% of the mushaf's raw advantage over a random order, which agrees with an earlier study; the remaining fifth is what these tests show to be deliberate.

Two qualifications. A search found an order with the same amount of rule-breaking that scores 0.744, so the mushaf is arranged with resemblance in view but not to maximise it. And the gain is spread across the whole order: the twenty most displaced suras do not individually gain more than the rest (ten gain, ten lose against their strict-sort neighbours).

## Method

Words are reduced to root and lemma with the Quranic Arabic Corpus morphology. Vocabulary similarity is a weighted overlap of lemmas; rhyme comes from each verse's final word as pronounced in pause. Every claim is compared with the alternatives it could have been: other pairings, other boundary placements, other orders with the same disorder, other assignments of letters to suras. Sura-pair tests control for each sura's baseline, two traditional chronologies, Meccan or Medinan period, length and verse length. Comparison texts were Genesis, Samuel-Kings-Chronicles and the Synoptic Gospels.

## Limits

- **Outside timestamps start late.** Batches 1 to 12 were committed publicly only after they had run. Batch 13 is the first whose plan was committed before its results.
- **One text.** Each new test on the same text is less blind than the last. Later batches built on measures developed in earlier ones.
- **Shared wording only.** The measures cannot see a thematic parallel that uses different words, so a null result does not refute a claim made on thematic grounds.
- **Chronology is uncertain.** Both revelation orders are traditional lists, and many suras mix periods.
- **The arrangement pattern is not distinctive.** One comparison collection, the Mishnah, shows it equally. Its similarity measure is cruder (word forms, no lemmas) and its genre is different, so a second comparison with lemma-level data would firm this up.
- **Structure is not authorship.** These tests show that the arrangement and some compositions are deliberate. They do not show who was responsible, and careful human arrangement would produce the same patterns.

## Next

1. Test a third length-ordered collection with lemma-level data, to check the Mishnah comparison like for like.
2. Build a ring detector that allows sections of unequal length; the equal-block one missed sura 12.

## Files

- `RESULTS.md`: every batch in full.
- `PREREGISTRATION*.md`: the seventeen test plans.
- `results/`: numbers for each batch; `results/exception_map.json` lists every sura's displacement from length order.
- `SEAMS.md`: every boundary between neighbouring suras with the word-families shared across it.
- `ATLAS.md`: ten pairs of near-synonyms and the company each word keeps.
- `RETELLINGS.md`: which Moses episodes each sura tells, and what is particular to each telling.
- `claims/registry.json`: the claims tested and their sources.
- `README.md`: how to re-run everything.
