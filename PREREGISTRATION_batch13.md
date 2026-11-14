# Pre-registration, batch 13: a second length-ordered collection (the Mishnah)

Written 2026-11-14, after batch 12. At this point the Mishnah text had been downloaded and each tractate's chapter count printed. No similarity between tractates had been computed.

This is the first test plan committed to the public repository before its batch is run. The commit history is the record of that order.

## Question

Batch 11 found that the mushaf breaks its longest-first rule in places that make neighbouring suras more alike. Is that particular to the Quran, or is it what happens whenever people arrange a collection by length?

## The comparison collection

The Mishnah (compiled about 200 CE): 63 tractates in six orders. Within each order the tractates run from the most chapters to the fewest, with exceptions. Scholars of the Quran's arrangement commonly cite it as a parallel.

Text: Hebrew, from Sefaria (public domain editions). Order of tractates: Sefaria's table of contents, which follows the standard printed order.

Paul's letters, the other parallel usually cited, cannot be used: they have a single exception to their length order, so there is nothing to test.

## Measures

- **Length** = number of chapters, the criterion tradition names. Many tractates tie.
- **Disorder** = number of tractate pairs within an order that stand the wrong way round for a strict most-chapters-first sort (ties are not counted).
- **Similarity** = tf-idf cosine over word forms (vowel points and punctuation removed, words of two letters or more), weights from the 63 tractates, then turned into percentiles as for the suras. No lemmatiser is available for Mishnaic Hebrew, so this is cruder than the Quran measure: the same word with different prefixes counts as different words.

## Check that the measure works (V)

Tractates in the same order share a field of law, so they should be more alike than tractates in different orders. Statistic: mean similarity of same-order pairs minus mean of cross-order pairs. Null: tractates shuffled among orders (10,000 draws, seed 20261190). If p is not below 0.05 the measure is not informative and the result of M1 is reported as uninterpretable.

## M1 (primary)

- Statistic: mean similarity of adjacent tractates, over all 57 within-order adjacent pairs.
- Null: within each order, tractates sorted by ln(chapters) plus random noise, one noise level for all six orders, set so that the average total disorder equals the Mishnah's. Orders whose total disorder is within 10% of the Mishnah's (or within one pair, whichever is larger) are kept. 20,000 generated, seed 20261191.
- One-sided, threshold p < 0.05.

Because many tractates tie on chapter count, the null also places tied tractates in random order. The test therefore asks whether the Mishnah uses the freedom its length rule leaves, both exceptions and ties, to put similar tractates together.

## Secondary

- M2: length = words in place of chapters (no ties).
- M3: M1 with the tied pairs taken out of play: the null keeps tied tractates in their actual relative order, so only true exceptions are randomised.
- M4: M1 without Avot (not a legal tractate) and with the three Bavot treated as one unit (they were originally one tractate).
- The strict-sort value and the disorder share, for comparison with the mushaf (6.7% of pairs).

## Prediction, recorded before running

Uncertain. V will pass. M1 will probably pass, because ties leave a lot of freedom and tractates on related subjects are known to sit together (the three Bavot, for example). M3, which looks only at true exceptions, may well fail: there are only about twenty of them.

## How results will be read

- M1 and M3 pass: exceptions that raise resemblance are found in a second length-ordered collection. The pattern in the mushaf is then what careful human arrangement looks like, and is not distinctive.
- M1 passes, M3 fails: the Mishnah groups similar tractates where its rule is indifferent, but its true exceptions cannot be shown to do so.
- M1 fails: the pattern is not found in the Mishnah with this measure.

## Limits stated in advance

- One comparison collection, in a different genre (law), with a cruder similarity measure.
- The Mishnah has six thematic orders and the mushaf has none, so the two arrangements are not built the same way.
- About twenty true exceptions is a small number.
- Printed chapter counts differ slightly from older ones in a few tractates (Avot, Tamid).
