# Pre-registration, batch 15: the word-choice atlas

Written 2026-11-16, after batch 14. Before writing, the roots and lemmas named below were looked up in the corpus to confirm their spelling and total counts. No occurrence was looked at in its verse and no co-occurrence was counted. Committed to the public repository before the batch's code was written.

## Purpose

Where the Quran has two words for nearly the same thing, classical scholars (al-Raghib al-Isfahani, Abu Hilal al-Askari and the commentators) say each is chosen for a reason. This batch does two things:

1. checks seven of those claims against every occurrence, by a rule fixed here;
2. builds an atlas showing what company each word keeps, for study.

## A caution about blindness

I know many of these verses, including the famous examples each claim is built on. The rules below were therefore not written in ignorance of the text. What the checks add is coverage: each rule is applied to every occurrence, including those the claim's supporters do not usually quote, and every exception is listed.

## Part 1. Seven claims

"Same verse" means the verse containing the word. "Nearby" means that verse or the one before or after it in the same sura. Marker words are given as roots. Tests are Fisher's exact test, one-sided in the direction of the claim, threshold p < 0.05; with seven claims the stricter mark is p < 0.007.

**W1. Rain: *matar* for punishment, *ghayth* for mercy.**
Words: root m-t-r (15 occurrences) against lemma *ghayth* (3). Rule: a punishment marker nearby: roots for punish ('-dh-b), stones (h-j-r), evil (s-w-'), criminals (j-r-m), warn (n-dh-r), destroy (h-l-k), harm ('-dh-y). Reported: the share of each word with a marker, and every occurrence.

**W2. Wind: singular *rih* for harm, plural *riyah* for mercy.**
Lemma *rih*, split by number (10 plural, 19 singular). Rule: in the same verse, harm markers (punish '-dh-b, roaring s-r-s-r, barren '-q-m, violent '-s-f, destroy h-l-k and d-m-r, break q-s-f, insolent '-t-w) or mercy markers (good news b-sh-r, mercy r-h-m, fertilise l-q-h, clouds s-h-b, spread n-sh-r, pleasant t-y-b). Each occurrence is classed harm, mercy, both or neither. Test on those classed harm or mercy.

**W3. Sent down: *nazzala* (gradual) for the Quran, *anzala* for the earlier scriptures.**
Lemmas *anzala* (183) and *nazzala* (62). Rule: the same verse names the Torah or the Gospel. Test: such verses use *anzala* more than the two verbs' overall proportions predict. Every such verse is listed.

**W4. Fear: *khashya* is fear of God; *khawf* is fear in general.**
Roots kh-sh-y (48) and kh-w-f (124). Rule: one of the next three words after the fear word is God, Lord or the Merciful. Test: the share is higher for kh-sh-y.

**W5. Heart: *fu'ad* is the heart as a faculty alongside hearing and sight.**
Lemmas *fu'ad* (16) and *qalb* (132). Rule: the same verse contains both the root for hearing (s-m-') and the root for sight (b-s-r). Test: the share is higher for *fu'ad*.

**W6. Oaths: *halafa* for the oaths of people who lie; *aqsama* for solemn oaths, including God's own.**
Root h-l-f (13) and lemma *aqsama* (20). Rule A: a marker of falsehood nearby (lie k-dh-b, hypocrisy n-f-q). Test: the share is higher for h-l-f. Rule B (reported, no test): how many occurrences of each are first-person singular, which is how God's own oaths appear.

**W7. Year: *sana* for years of hardship, *'am* for years of ease.**
Lemmas *sana* and *sinin* (19) against *'am* (9). No automatic rule can judge hardship, so every occurrence is listed and classed by reading as hardship, ease, or a plain count of time, and the tally is given. This one is a reading and is labelled as such; no p-value.

## Part 2. The atlas

For each of the seven pairs, and for three further pairs too frequent to audit by rule (came: *ja'a* / *ata*; human: *bashar* / *insan*; did: *'amila* / *fa'ala*):

- how often each word occurs, and how its occurrences divide between Meccan and Medinan suras;
- the roots that most distinguish the company of one word from the company of the other (same verse; roots occurring at least five times across the pair; ranked by log-odds with a half-count correction; top eight each way).

Written to `ATLAS.md` and `results/word_atlas.json`. The atlas is description. Nothing in it is tested.

## Predictions, recorded before running

W1, W4, W5 and W6 will hold. W2 will hold with known exceptions (a "pleasant wind" in 10:22). W3 will hold weakly and has a known counterexample (3:93). W7 will fit the famous cases and little else: most occurrences will be plain counts of time.

## How results will be read

A claim "holds" if its test passes and its exceptions are few; it "holds as a tendency" if the test passes with several exceptions; it "does not hold" otherwise. Every exception is listed in either case.

## Limits stated in advance

- The marker lists are mine. A different list could change a borderline result.
- Markers catch a sense only when it is put in those particular words.
- Counts are small for several pairs (three occurrences of *ghayth*, nine of *'am*).
- Whether a context-sensitive choice of words is unusual is not addressed. Batch 5 found that other texts also choose words to fit their surroundings.
