# Pre-registration, batch 17: sound and subject

Written 2026-11-16, after batch 16 and before any of the analysis below was coded or run. Committed to the public repository before the batch's code was written.

## Question

Do verses of warning and verses of mercy sound different? Several published studies say that harsh and emphatic sounds go with threat and soft, flowing sounds with mercy. One search found those studies to be descriptive, on chosen passages, with no comparison across the whole text. This batch tests the claim on every verse.

## Classifying verses by subject

By marker words in the verse:

- **Mercy**: the roots for mercy (r-h-m), forgive (gh-f-r), triumph (f-w-z), be pleased (r-d-w), reward ('-j-r), and the words *janna* (garden) and *na'im* (bliss).
- **Warning**: the roots for punish ('-dh-b), blaze (j-h-m, s-'-r), woe (w-y-l), destroy (h-l-k), curse (l-'-n), and the words *nar* (fire), *jahannam* (hell) and *'iqab* (punishment).

A verse is a mercy verse if it has a mercy marker and no warning marker, a warning verse if the reverse. Verses with both or neither are left out.

## Removing the obvious circularity

The marker words have their own letters ("punishment" contains 'ayn, dhal, ba). If they stayed in, warning verses would differ in sound simply because they contain the word for punishment. So every marker word is removed from its verse before any sound is measured. What is tested is the sound of the rest of the verse.

## Sound features of a verse

Letters are taken from the word forms in the morphology file, reduced to the written skeleton as in batch 7.

- **F1, hard consonants**: the share of consonants that are emphatic (sad, dad, ta, za) or qalqala stops (qaf, ta, ba, jim, dal). Predicted higher in warning verses.
- **F2, soft consonants**: the share that are liquids or nasals (lam, mim, nun, ra). Predicted higher in mercy verses.
- **F3, long vowels**: long vowels per short vowel mark, a rough measure of how drawn-out the verse is. Predicted higher in mercy verses.
- **F4, verse length** in words. No direction predicted.

Consonants here are the 22 letters whose value is unambiguous in the script; alif, waw and ya (which can be vowels) are not counted in F1 and F2.

## Test

Verses of one sura share period, style and rhyme, and subjects come in runs, so verses are not independent. The unit is therefore the sura.

- Suras with at least five mercy verses and at least five warning verses are used.
- For each sura and feature: the mean over its warning verses minus the mean over its mercy verses.
- Test: are those per-sura differences on one side of zero? Random sign flips across suras, 100,000 draws, seed 20261220. One-sided for F1 (positive), F2 and F3 (negative); two-sided for F4. Threshold p < 0.05; with four features the stricter mark is p < 0.0125.

## Also reported (description, no test)

- For each of the 28 letters, the per-sura difference in its share between warning and mercy verses, with the number of suras leaning each way. This shows which letters, if any, lean towards warning or mercy.
- The counts of verses of each class by rhyme ending.

## Prediction, recorded before running

Uncertain. I expect F4 to differ (warning verses shorter). For F1 to F3 I expect small effects in the predicted directions, possibly not distinguishable from zero.

## How results will be read

- F1 to F3 in the predicted directions: with the marker words themselves taken out, warning and mercy verses still differ in sound in the way the descriptive studies say.
- Not so: the claim does not hold across the whole text by these measures, whatever is true of chosen passages.

## Limits stated in advance

- Any two subjects use different vocabulary, and different words have different letters. A difference in sound could come from the Arabic lexicon (harsh things having harsh-sounding names in the language at large) and not from choices made in the Quran. This test cannot separate the two; it would take a comparison with other Arabic texts.
- The marker lists are mine. Mercy verses will include many that simply end with the names "the Forgiving, the Merciful".
- Letter classes follow the classical lists used in batch 8; the script-based count of long vowels is approximate.
- Recitation features that the script does not show (nasalisation, lengthening rules, pauses) are not measured.
