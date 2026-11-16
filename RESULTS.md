# Results, batch 1 (2026-11-14)

Tests were specified in `PREREGISTRATION.md` before they were coded, and each was run once. Full numbers are in `results/batch1.json`. Confirmation threshold for the three primary tests: p < 0.0167.

## Summary

| Claim (Farrin 2014) | Primary result | Verdict |
|---|---|---|
| 53 adjacent sura pairs | p = 0.041 | Suggestive, not confirmed |
| 19 sura groups | p = 0.49 | Not supported |
| Rings in suras 2, 3, 12 (combined) | p = 0.0015 | Confirmed, but only sura 12 carries it |

## T0. Rebuild check

The rebuilt pipeline reproduces the May 2026 session numbers exactly: 228 sura pairs share an exclusive 5-root formula (3.5% of all pairs), 628 verses carry one, and 4:43 / 5:6 share 12.

## T1. Sura pairs

Farrin's 53 pairs share more distinctive vocabulary than random adjacent pairings do (mean similarity 0.090 against 0.084, z = 1.9, p = 0.041). That misses the pre-set threshold. 31 of the 53 pairs are more similar to each other than to their neighbours on the other side.

The exclusive-formula measure points the same way without reaching significance (n = 3: p = 0.069; n = 5: p = 0.052). Only 5 to 8 of the 53 pairs share any exclusive formula at all, so that measure has little power for short suras.

## T2. Sura groups

Farrin's group boundaries do no better than the same group sizes placed at random along the sura sequence (p = 0.49; adjacent pairs excluded: p = 0.56; formulas n = 3: p = 0.72; n = 5: p = 0.15).

Per group, 2-5 stands clearly above its surroundings, with smaller positive differences for 57-66, 25-32 and 47-49. Most other groups are at or below zero.

## T3. Is the 2-5 cluster a size effect? (exploratory)

No. Suras 2-5 share 32 bridged verse pairs; their sizes predict about 18 and a degree-preserving rewiring predicts about 12 (p = 0.00005). Suras 25-32 share 14 against 2 to 5 expected (p = 0.0002).

Across all 19 groups there are 67 within-group bridges against 32 to 36 expected. Read together with T2, this says nearby suras share formulas more than chance, but Farrin's particular boundaries are not what captures it. Revelation period and subject matter (Medinan law in 2-5, prophet stories in 26-28) are not controlled here and are the obvious candidate explanations.

## T4. Rings

| Sura | Claimed pairing's rank among all pairings | Exact p | Blind |
|---|---|---|---|
| 12 (Yusuf) | 1 of 945 | 0.0011 | No |
| 2 (al-Baqara) | 4 of 15 | 0.27 | Yes |
| 3 (Al 'Imran) | 7 of 15 | 0.47 | Yes |
| 18 (al-Kahf), re-test | 7 of 15 | 0.47 | No |

Yusuf is a strong result. Farrin's pairing is the single best of 945 possible pairings, and in four of the five mirror pairs each section's claimed partner is its closest match among nine candidates. The combined primary test passes only because of this sura.

Suras 2 and 3 show no lexical ring. In sura 3, C' is the least similar of the five candidates to C.

Al-Kahf matches the earlier sessions: the frame and the Cave / Dhul-Qarnayn pair are each other's closest matches, while Gardens / Khidr is the worst of five.

## Limits

- Both measures see shared wording only. Thematic parallels without shared distinctive words are invisible, so the nulls for groups and for suras 2 and 3 do not show those claims are false.
- The Yusuf ring had been examined in an earlier session with a different measure, so that test is not blind.
- Yusuf is a single continuous story whose plot mirrors itself (dream and fulfilment, separation and reunion). A ring in the wording may follow from the plot. Whether the Genesis telling shows the same pattern is untested.
- No comparison corpus yet. Nothing here says whether the Quran's structure is unusual relative to other texts.
- The pre-registration is internal. It has no third-party timestamp.

## Not yet encoded

See `notYetEncoded` in `claims/registry.json`: Farrin's concentric arrangement of the groups, his three-part outlines, and all claims from Cuypers, Robinson, Mir/Islahi, Dayeh and Bannister.

---

# Results, batch 2: the arrangement test (2026-11-14)

Specified in `PREREGISTRATION_batch2.md` before it was coded; run once. Numbers are in `results/batch2.json`. The post hoc checks at the end are in `results/batch2_posthoc.json`.

Question: do suras that are neighbours in the mushaf share more distinctive vocabulary than their lengths and revelation dates predict?

## Summary

| Test | Effect | p | Reading |
|---|---|---|---|
| Primary: mushaf neighbours, controlling for revelation order, period, length, verse length and each sura's baseline | +5.4 percentile points | 0.0004 | Passes |
| S1: same, plus a log mushaf-distance control | +1.8 | 0.16 | Does not pass |
| S2: Noldeke's chronology instead of the Egyptian | +4.6 | 0.002 | Holds |
| S3: raw cosine instead of percentiles | positive | 0.02 | Holds |
| S5: Farrin's 53 pairs | +9.8 | 0.0001 | Strong |
| S5: the other 60 adjacent pairs | +1.7 | 0.22 | Nothing |
| S6: neighbours in revelation order | +3.4 | 0.018 | Smaller than the mushaf effect |

Mushaf neighbours sit on average at the 62nd percentile of each other's similarity lists (chance is 50). Neighbours revealed far apart are still at the 61st.

## Reading under the pre-stated rule

The rule written in advance says: positive in the primary but not in S1 means nearby suras are similar in a broad way and adjacency itself is not shown. That is the formal verdict.

The distance profile (S4) does not fit that reading well. The effect is +5.7 points at distance 1 (p = 0.0002) and indistinguishable from zero at distances 2, 3, 4-5 and 6-10. There is no broad gradient for adjacency to ride on. A log-distance term is steepest between distance 1 and 2, so it competes directly with the adjacency indicator, which is the likely reason S1 fails. S1 was a poorly chosen control; that is a judgement made after seeing results and carries no confirmatory weight.

## Farrin's pairs

The adjacency effect is concentrated in the pairs identified by Islahi, Mir and Farrin. Their 53 pairs are +9.8 points above expectation; the 60 adjacent pairs that fall between them are not distinguishable from zero. This is stronger support for the pair claim than batch 1 gave (p = 0.041), now with length and date controlled. It is a secondary analysis.

## Post hoc checks (not pre-registered)

- Difference between Farrin's pairs and the other adjacent pairs: +8.1 points, p = 0.0045.
- The five strongest adjacent pairs are 113-114, 91-92, 89-90, 92-93 and 109-110, all short suras. With those five removed the primary effect halves to +2.8 points, p = 0.044.
- 61 of 113 adjacent pairs are above expectation. The effect comes from a minority of pairs with large excess, not from a uniform lift.

## What this does and does not show

- With length and revelation date controlled, the mushaf order still carries a lexical signal. The claim that the order is only a sort by length does not account for these data.
- The signal is strongest in short suras near the end, and about half of it rests on five pairs.
- It does not show who arranged the suras or why. Anyone arranging by hand could place similar suras together.
- Genre is controlled only through period, verse length and sura length. Short suras of the same type placed together (oath suras, refuge prayers) are the obvious alternative explanation.
- Both chronologies are traditional lists with real uncertainty, and many suras mix material from different periods.
- The lexical data have now been examined twice. Any further confirmatory test on sura pairs needs a different kind of feature (rhyme, verse-ending formulas, syntax), since there is no second Quran to hold out.

---

# Results, batch 3: Yusuf against Genesis (2026-11-14)

Specified in `PREREGISTRATION_batch3.md` before the Hebrew data were parsed; run once. Numbers are in `results/batch3.json`.

Question: sura 12's ring might simply follow from a plot that mirrors itself. Does the Genesis telling of the same story (Genesis 37-50) show a ring in its wording too?

## Summary

| Test | Claimed pairing's rank | Exact p |
|---|---|---|
| Sura 12, Farrin's outline (batch 1) | 1 of 945 | 0.0011 |
| Genesis 37-50, Rendsburg's outline (primary) | 6,460 of 10,395 | 0.62 |
| Sura 12, six-section design | 1 of 15 | 0.067 |
| Genesis, same six plot episodes | 5 of 15 | 0.33 |

The 15-pairing design cannot produce a p-value below 0.067, so its two rows are for comparing the two tellings, not for significance.

## G0. The measure works on Hebrew

The two "wife presented as sister" stories (12:10-20 and 20:1-18) score 0.26, at the 97.6th percentile of 1,425 comparison windows (median 0.125). Validation passed.

## G1. Rendsburg's ring

No ring in the wording. The claimed pairing is slightly worse than the average pairing (z = -0.37). Only F / F' (the final test and its conclusion, chapters 44 and 45) are close, and those two units are adjacent. For most units the closest match is a neighbouring unit, not the mirror unit. Computing word weights over the Joseph story alone gives the same result (p = 0.70).

## G2 and G3. The same six plot episodes in both tellings

| Mirror pair | Sura 12: partner's rank | Genesis: partner's rank |
|---|---|---|
| a / a': the dream, and the family reunited | 1 of 5 | 3 of 5 |
| b / b': the brothers' plot, and the brothers' journeys | 1 of 5 | 1 of 5 |
| c / c': settled in the Egyptian's house, and raised to authority | 2 of 5 | 1 of 5 |

Two of the three pairs mirror in the Genesis wording as well. So part of sura 12's ring does come with the plot: the same characters and settings return in the matching episodes of either telling.

The difference is the outer pair. In sura 12 the dream and the reunion are the most similar pair of all (0.36): the closing scene names the dream and its fulfilment (12:100). In Genesis they score 0.08, and the dream episode's closest match is the brothers' journeys, where Genesis places the fulfilment (42:6-9). Including the genealogy in a' does not change the picture.

Sura 12 also has two mirror pairs that Genesis has no material for: the vindication scene (12:50-53), which answers the seduction scene, and the prologue and epilogue that frame the story.

## Reading under the pre-stated rule

G1 was not significant and G0 passed. Under its best-known published outline the Genesis telling does not show a lexical ring, while sura 12 does under Farrin's. Of these two tellings, the Quranic one is the more tightly mirrored in its wording.

A mirrored plot explains some of sura 12's ring (pairs b and c appear in Genesis too) but not all of it. The parts that complete the ring in sura 12, namely the dream fulfilled at the very end, the vindication scene, and the frame, are features of how the Quran tells the story.

## Limits

- One comparison text. This says nothing about how sura 12 compares with other well-constructed narratives.
- The two outlines come from different scholars. Farrin's sections are fine-grained story scenes; Rendsburg's are whole chapters and include material outside the Joseph plot (Judah and Tamar, Jacob's blessings). A different Genesis outline might do better; only one published outline and one transferred plan were tested.
- Rendsburg's case rests partly on themes and on particular catchwords. Thematic parallels are invisible to this measure, so this result does not refute his chiasm.
- Two languages and two annotation schemes.
- A tighter ring shows more deliberate concentric composition. It does not identify the composer.

---

# Results, batch 4: near-twin verses (2026-11-14)

Specified in `PREREGISTRATION_batch4.md`; run once. Numbers are in `results/batch4.json`, with every case listed in `results/batch4_all_sites.json` and `results/batch4_all_frames.json`.

Question: where two almost identical passages differ by one word, is each variant more at home in its own surroundings than its twin's word would be?

## Summary

| Analysis | Cases | Positive / negative | p |
|---|---|---|---|
| Registered primary: whole-verse twins, whole-sura context | 21 pairs | 11 / 10 | 0.18 |
| Amended: phrase-level, whole-sura context | 65 frames | 35 / 28 | 0.020 |
| Amended: phrase-level, ten verses either side | 65 frames | 37 / 19 | 0.0006 |
| Amended: phrase-level, sura with local passage and repeats removed | 65 frames | 29 / 31 | 0.12 |
| Amended: phrase-level, suras of the same period | 65 frames | 32 / 29 | 0.92 |

## Status of these results

The registered primary test is a null. Its rules found only 21 usable pairs, because most near-twin verses differ by added or dropped words, not by a clean one-word swap. All its secondary variants are null as well.

The phrase-level analysis was added after that yield was seen and before any outcome was computed; its rule is recorded in Amendment A1 and was not tuned. It is reported as an amended analysis, not as the registered primary.

## What the amended analysis shows

- **Variant words fit their immediate surroundings.** Within the ten verses on either side, the word actually used is more frequent than its twin's word in 37 of 56 informative cases (p = 0.0006).
- **The fit does not clearly extend to the rest of the sura.** With the local passage and repeated formulas removed, the effect is not distinguishable from zero (p = 0.12).
- **It is not explained by period.** Against the vocabulary of suras revealed around the same time, there is no effect at all (p = 0.92). The pattern belongs to the passage, not to the era.

Under the reading rule set in advance, this is the second outcome: the fit comes from local wording, which is consistent local diction and a weaker thing than the claim that each variant suits its sura as a whole.

## Two cases, checked against the corpus

- 2:60 and 7:160 (water from the rock) differ in the verb: root f-j-r in sura 2, root b-j-s in sura 7. Root f-j-r returns fourteen verses later at 2:74 (rivers bursting from rocks) and does not occur in sura 7. Root b-j-s occurs nowhere else in the Quran.
- 9:39 and 11:57 share a clause that names "Allah" in sura 9 and "my Lord" in sura 11. Sura 9 uses the root of "Allah" 103 times per thousand content words and the root of "Lord" 1.8 times; sura 11 uses "Lord" 36 times per thousand.

## Limits

- Sixty-five frames is a small sample, and the positive result rests on an analysis added mid-batch.
- The measure only sees a variant root that is repeated nearby. Classical explanations based on meaning, emphasis or rhetoric are not tested, so the null for the wider sura does not refute them.
- Some frames are loose formula templates ("have you not seen that God ... the heavens and the earth") and not twin verses in the classical sense.
- Writers generally repeat words within a passage. Without a comparison text, this result cannot say whether the Quran does so more than other careful compositions. Parallel passages in other scriptures (for example the Synoptic Gospels) would be the natural comparison.
- Variants in function words and word order, a large part of the classical literature, are outside this test.

---

# Results, batch 5: is the Quran's local fit unusual? (2026-11-14)

Specified in `PREREGISTRATION_batch5.md` before the comparison data were parsed; run once. Numbers are in `results/batch5.json`; the post hoc check is in `results/batch5_posthoc.json`.

Question: batch 4 found that where two Quranic phrases differ by one word, the word used tends to recur in the ten verses around it. Do other parallel texts do the same?

The general test function was first checked against batch 4 and reproduced its figures exactly.

## Local fit (ten verses either side)

| Corpus | Phrases | Fit own place / fit twin's place | Mean excess (95% interval) | p |
|---|---|---|---|---|
| Quran, root level (batch 4) | 65 | 37 / 19 | 0.34 | 0.0006 |
| Quran, lemma level | 59 | 22 / 15 | 0.25 (-0.07 to 0.56) | 0.051 |
| Synoptic Gospels | 40 | 19 / 9 | 0.35 (0.10 to 0.60) | 0.010 |
| Samuel-Kings-Chronicles | 169 | 85 / 35 | 0.98 (0.50 to 1.68) | 0.00001 |
| Samuel-Kings-Chronicles without proper-name variants (post hoc) | 104 | 42 / 22 | 0.38 (0.17 to 0.60) | 0.00005 |

Difference in mean local excess, Quran (lemma level) minus Gospels: -0.50 to 0.29. Quran minus Samuel-Kings-Chronicles: -1.51 to -0.14.

## Reading under the pre-stated rule

Both comparison texts show local fit, the Gospels at about the Quran's size and Samuel-Kings-Chronicles larger. Under the rule set in advance, local fit of variant words is ordinary in parallel texts and the Quran's result is not distinctive.

The large Samuel-Kings-Chronicles figure comes mostly from formulas whose varying word is a king's name ("the rest of the acts of ... and all that he did", nineteen occurrences), where the name is bound to appear nearby. With proper-name variants removed (a check added after seeing the results), its mean excess is 0.38, in line with the other two.

So across three corpora in three languages the same thing appears at about the same size: when a repeated phrase varies by one word, the word used recurs nearby roughly two times in three.

## Whole document and strict contexts

The Gospels and Samuel-Kings-Chronicles also show fit to the whole book and to the book with the local passage removed (Gospels p = 0.008 and 0.030; Samuel-Kings-Chronicles p = 0.00001 for both). The Quran does not clearly show this (lemma level p = 0.096 and 0.21; root level 0.020 and 0.12). This difference is expected and is not evidence about the Quran's quality: in the comparison texts each book has its own author with his own habits (Matthew's "kingdom of heaven" against Luke's "kingdom of God" is among the top cases), while the Quran varies its own formulas in one voice.

## What this means for batch 4

Batch 4's local-fit finding stands, but it is a general property of how repeated phrases get varied, visible in texts with ordinary human authors. It does not set the Quran apart.

## Limits

- At lemma level the Quran's own local result is borderline (p = 0.051); the root-level result is the stronger one, and roots merge related words in a way Greek and Hebrew lemmas do not.
- The processes differ: authors rewriting a source in the comparison texts, one text varying its own formulas in the Quran.
- Two comparison texts are not a baseline for writing in general.
- The phrase rule finds few cases in every corpus (40 to 169), so the intervals are wide and a moderate difference between corpora could go undetected.

---

# Results, batch 6: the sound layer (2026-11-14)

Specified in `PREREGISTRATION_batch6.md` before any rhyme data were related to sura order or vocabulary; run once. Numbers are in `results/batch6.json`.

Rhyme was taken from each verse's final word as pronounced in pause (`src/rhyme.mjs`), checked beforehand against suras whose rhymes are well known.

## R1. Do mushaf neighbours share rhyme?

| Test | Effect (percentile points) | p |
|---|---|---|
| Primary: mushaf neighbours, with revelation order, period, length, verse length and each sura's baseline controlled | +7.1 | 0.0004 |
| Same, Noldeke's chronology | +6.8 | 0.0006 |
| Same, five strongest pairs removed (112-113, 111-112, 13-14, 91-92, 98-99) | +4.9 | 0.011 |
| Farrin's 53 pairs | +8.1 | 0.004 |
| The other 60 adjacent pairs | +6.1 | 0.018 |
| Farrin's pairs minus other adjacent pairs | +2.0 | 0.32 |
| Batch 2 vocabulary effect with rhyme similarity controlled | +4.8 | 0.0012 |

Mushaf neighbours sit at the 63rd percentile of each other's rhyme-similarity lists (chance is 50); 68 of 113 adjacent pairs are above expectation.

Reading under the pre-stated rules:

- **Neighbours resemble each other in rhyme** beyond what length and date predict. The arrangement now tracks similarity in two different features, vocabulary (batch 2) and rhyme. This result is sturdier than the vocabulary one: it survives removal of its five strongest pairs.
- **Rhyme does not single out Farrin's pairs.** His pairs and the other adjacent pairs are both above expectation and do not differ (p = 0.32). The pair structure found in batch 2 rests on vocabulary alone.
- **The batch 2 vocabulary effect is not explained by style.** It is nearly unchanged with rhyme similarity controlled (+4.8 against +5.4 points).

## R2. Do rhyme shifts mark a change of subject?

Across 39 suras with both kinds of boundary (114 shifts, 1,843 continuations), vocabulary changes more sharply where the rhyme switches than where it continues: shifts are higher in 29 of 39 suras, p = 0.014. Windows of two verses (p = 0.003) and five verses (p = 0.009) agree. The effect appears in short-verse suras (p = 0.049) and is weaker in long-verse ones (p = 0.095).

The difference is small in absolute terms (0.958 against 0.936) because three-verse windows share little vocabulary anywhere, so the measure sits near its ceiling.

Reading: where the rhyme changes, the subject tends to change. This agrees with what Neuwirth and others describe from close reading of the Meccan suras.

## Limits

- No comparison text for rhyme. Nothing here says whether either property is unusual. Rhymed sermons or poetry collections arranged by someone would be the relevant comparison and are not available in analysed form.
- Rhyme style changed over the period of revelation. It is controlled through two traditional chronologies, period, and verse length; residual confounding by period is possible.
- Whoever arranged the suras could hear the rhymes. Placing similar-sounding suras together is something an arranger could do deliberately.
- R2 shows an association. A new subject introduced with a new rhyme is a compositional habit found in rhymed and strophic verse generally.
- The rhyme key is an approximation built from the script.

---

# Results, batch 7: the disconnected letters (2026-11-14)

Specified in `PREREGISTRATION_batch7.md` before any letter counts were made; run once. Numbers are in `results/batch7.json`; post hoc checks are in `results/batch7_posthoc.json`.

## L1. Do same-letter suras form families?

| Test | Effect (percentile points) | p |
|---|---|---|
| Primary: same opening letters, with both-lettered, neighbours, mushaf distance, revelation order, period, length, verse length and sura baselines controlled | -2.3 | 0.80 |
| Rhyme in place of vocabulary | -0.6 | 0.51 |
| Noldeke's chronology | -1.7 | 0.74 |
| First five verses removed | -1.7 | 0.77 |
| HM family alone | +0.3 | 0.45 |
| Separated ALM pairs (2-3 against 29-32) | -3.5 | 0.73 |
| Share of letters in common | -1.3 | 0.61 |

No family effect. Raw similarity is high: same-letter pairs sit at the 81st percentile of each other's lists. But lettered suras with different letters sit at the 77th, and the separated ALM pairs at the 82nd. Once the model accounts for both suras being lettered, and for neighbourhood and date, having the same letters adds nothing.

**Post hoc:** the lettered suras resemble each other as a class. With the same controls, a pair of lettered suras (any letters) is +5.0 points above expectation, p = 0.0002. This was not a registered test and needs confirming.

Reading under the pre-stated rule: the letters do not mark families of suras that share vocabulary beyond being neighbours and contemporaries. What the data suggest instead is one broad group: suras with letters resemble other suras with letters, whichever letters they carry.

## L2. Are a sura's letters unusually frequent in it?

| Test | Suras with positive own score | p |
|---|---|---|
| Primary (written-skeleton count, standardised across the 29) | 19 of 29 | 0.0045 |
| Strict counting rule | 20 of 29 | 0.0030 |
| Standardised across all 114 suras | 18 of 29 | 0.0009 |
| Post hoc: without sura 50 | 18 of 28 | 0.048 |
| Post hoc: without the single-letter suras 38, 50, 68 | 16 of 26 | 0.16 |
| Post hoc: ALM, ALR and HM suras only | 11 of 18 | 0.22 |
| Post hoc: the other eleven suras only | 8 of 11 | 0.036 |

The registered test passes under both counting rules: taken together, suras' own letters are more frequent in them than other lettered suras' letters would be.

The post hoc breakdown shows where that comes from. It is carried by the suras with rare letters and short letter-sets. The three large families, which are 18 of the 29 suras, show nothing: for example the letter ha ranks 18th, 11th, 6th, 22nd, 28th, 10th and 16th of 29 in the seven HM suras.

The single-letter suras:

| Sura | Letter | Count | Rank among 29 lettered | Rank among all 114 |
|---|---|---|---|---|
| 50 (Qaf) | qaf | 56 | 1 | 4 |
| 68 (the Pen) | nun | 130 | 5 | 12 |
| 38 (Sad) | sad | 28 | 3 | 30 |

Sura 50 is the standout. Its qaf rate (38 per thousand letters) is the highest of all 68 suras with at least 1,000 letters; the three suras above it overall are very short (113, 75, 91). The count of 56, plus the opening letter itself, is the 57 often quoted. Nun in sura 68 and sad in sura 38 are above average and unremarkable.

Reading: the frequency idea holds for qaf in sura 50 and weakly for a few other rare letters (ta in suras 20, 26 and 27; kaf in 19). It does not hold as a general rule, and not at all for the ALM, ALR and HM suras.

## Limits

- Letter frequency follows vocabulary. Sura 50 is rich in words with qaf (Qur'an, speech, creation, truth); the test cannot tell "the letter was chosen to match the sura" from "the sura's subject favours the letter".
- The class effect in L1 is post hoc. Lettered suras are mostly late Meccan suras of similar length that open by affirming the Book, so a shared genre is the obvious explanation; the chronology and length controls only partly cover it.
- Traditional revelation orders may have been influenced by these groupings.
- With 29 suras in few families, the shuffle in L2 has limited resolution, and one sura (50) supplies a large share of the result.

---

# Results, batch 8: a tournament of theories about the disconnected letters (2026-11-14)

Specified in `PREREGISTRATION_batch8.md` before the tests were coded; run once. Numbers are in `results/batch8.json`. The ordinary pass mark is p < 0.05; with six theories in play the stricter mark is p < 0.008.

## Scoreboard (batches 7 and 8)

| Theory | Result | p | Verdict |
|---|---|---|---|
| Letters mark families of related suras | No effect beyond neighbourhood and date | 0.80 | Fails |
| A sura's letters are unusually frequent in it | Carried by qaf in sura 50; nothing in ALM, ALR, HM | 0.0045 overall | Mostly fails |
| A. Letters rhyme with their sura | 65% of verses match, against 55% under shuffling | 0.021 | Passes |
| B. Letters sample the shapes of the script | 14 letters, 14 different shapes | 0.014 | Passes |
| C. Letters keep one internal order | Consistent; 0.11% of random arrangements are | 0.0011 | Passes strictly |
| D. Letters balance the classes of sounds | As balanced as possible | 0.026 | Passes |
| E. Letter counts are multiples of 19 | 5 of 78, against 4.1 by chance | 0.39 | Fails |
| F. Lettered suras form one class | +13.1 points in rhyme; +5.0 in vocabulary | 0.0001 | Passes strictly |

My predictions, recorded beforehand, were that A, B, C and D would pass and E would fail. All five came out that way.

## A. Rhyme

Where the letters form a verse of their own (19 suras), the letter-name's ending belongs to the sura's rhyme in 17 of them: ta-ha ends in long a and sura 20 rhymes in long a; ha-mim, alif-lam-mim, ta-sin-mim and ya-sin end like the -im / -in / -un rhymes of their suras. The two exceptions are suras 7 and 19, both ending in sad.

Where the letters are not a verse of their own they mostly do not rhyme (suras 10 to 15 and 50). That fits the old observation that the letters are counted as a verse where they rhyme, and it also means the verse division and the rhyme are not independent facts. The primary test uses all 29 suras regardless.

## B. Letterforms

Grouped by shape in undotted writing, the 28 letters fall into 18 groups. The 14 letters come from 14 different groups, the most possible; 1.4% of all sets of 14 letters do as well. A coarser grouping of 15 gives the same figure. The groups not represented are ba-ta-tha, dal-dhal, fa and waw.

In all six multi-letter groups that are represented, the letter present is the one written without dots today (hard ha, ra, sin, sad, emphatic ta, 'ayn). Picking one letter per group at random would do that 1% of the time. Those undotted letters are also the commoner member of each group, so a letter chosen for being common would show the same pattern.

## C. Internal order

Across the 11 distinct multi-letter openings there is no pair of letters that appears in both orders, and all the "comes before" relations fit a single ranking. One forced chain runs through seven letters: kaf, ha, ya, 'ayn, sin, mim, sad. Only 0.11% of random arrangements of the same openings are consistent. This re-tests Massey (1996) and agrees with him.

## D. Sound classes

Of the classical classes, the 14 letters contain 5 of the 10 voiceless letters, 4 of the 8 stops, 2 of the 4 emphatics, 3 of the 7 elevated letters and 2 of the 5 qalqala letters. That is as close to half of each as whole numbers allow; 2.6% of random sets are as balanced.

## E. The number 19

Five of the 78 sura-letter counts are multiples of 19, where chance gives about four. Under the strict counting rule it is four; with the basmala included, five.

Of Khalifa's five headline claims, the two about qaf hold under this count: suras 50 and 42 each contain exactly 57. The other three do not: nun in sura 68 is 131 against his 133, sad across suras 7, 19 and 38 is 153 against 152, and ha plus mim across suras 40 to 46 is 2,112 against 2,147.

## F. Lettered suras as a class

The lead from batch 7 is confirmed with a feature not used to find it. With neighbourhood, mushaf distance, revelation order, period, length, verse length and sura baselines controlled, two lettered suras are +13.1 percentile points more alike in rhyme than expected (p = 0.0001, the smallest the test can return).

The vocabulary effect is unchanged (+5.0 points) when the opening formula is controlled. Twenty-four of the 29 lettered suras mention the Book, the recitation or the sending-down in their first three verses, against 16 of the 85 others, but that does not account for the resemblance.

## What the tournament says

The theories that tie the letters to the content of particular suras fail: families, letter frequency (qaf aside) and the number 19. The theories that treat the letters as a constructed selection from the alphabet pass: distinct shapes, a fixed order, balanced sound classes, and agreement with the rhyme. And the suras that carry letters are a distinct group in both vocabulary and rhyme, whichever letters they carry.

The reading these results support best is that the letters are a deliberate, ordered sample of the Arabic alphabet placed at the head of one class of suras, the ones that present themselves as the Book. They do not show what the letters were meant to convey.

## Limits

- B, C and D are patterns scholars noticed by looking at the letters (the letterform observation is in the modern literature, the order is Massey's, the sound classes are al-Zamakhshari's). A probability worked out afterwards overstates the surprise, because the patterns that were looked for and not found are unrecorded. Only C clears the stricter mark.
- B, C and D are not independent of one another: all three describe the same 14 letters.
- Fourteen letters and fourteen distinct openings are small numbers.
- A depends on a rhyme extractor built from the script, and on the traditional verse division, which may itself follow the rhyme.
- F shows the lettered suras are alike beyond the listed controls. A shared period or genre that the two chronologies capture poorly could still be behind it.

---

# Results, batch 9: three predictions of my own about the letters (2026-11-14)

Specified in `PREREGISTRATION_batch9.md` before the tests were coded; run once. Numbers are in `results/batch9.json`.

The theory under test: the letters put the alphabet on display at the head of the suras whose subject is the scripture as an Arabic text.

| Prediction | Result | p | Outcome |
|---|---|---|---|
| M1. Lettered suras talk about scripture and writing throughout, not only in their openings | 17.3 against 16.4 words per thousand; adjusted difference -0.3 | 0.56 | Wrong |
| M2. "Arabic" belongs to the lettered suras (not blind) | 9 of 11 occurrences, against 5.2 expected | 0.021 | Holds |
| M3. The fixed order runs from the throat to the lips | 21 of 28 letter pairs agree | 0.061 | Not shown |
| M3. The alphabetical orders do not fit | Abjad order: 23 of 28 pairs agree | 0.010 | Wrong: abjad fits best |

## M1. Scripture vocabulary

With the first three verses removed, lettered suras use the vocabulary of books, recitation, writing and revelation no more than other suras. Every variant agrees: Meccan suras only (lower in lettered suras, p = 0.96), the narrower lexicon (p = 0.26), opening verses kept (p = 0.23), Noldeke's order (p = 0.70).

The core prediction of the theory failed. Whatever makes the lettered suras resemble each other (batch 8, test F), it is not that they talk about the Book more.

## M2. "Arabic"

Nine of the eleven occurrences of 'arabi are in lettered suras (12, 13, 20, 26, 41 twice, 42, 43, 46; the other two are in 16 and 39). Lettered suras hold 47% of the text. I knew the rough distribution before testing, so this is a count and not a blind test.

## M3. What the internal order is

| Candidate order | Letter pairs agreeing | p (two-sided) |
|---|---|---|
| Abjad (the old Semitic alphabet order) | 23 of 28 | 0.010 |
| Articulation, throat to lips | 21 of 28 | 0.061 |
| Frequency in the Quran | 19 of 28 | 0.21 |
| Modern alphabetical | 14 of 28 | 1.0 |

I predicted articulation would win and the alphabetical orders would sit at chance. The opposite happened for abjad: it fits best. The five pairs that break it are kaf before ha and ya (in KHY'S), emphatic ta before ha (TH), sin before mim (TSM) and 'ayn before sin ('SQ).

Abjad was the order in which the alphabet was known in the seventh century; the modern order came later. With four candidates tried, the corrected p-value is about 0.04, so this is a modest result. It points the same way as batch 8: the letters relate to the alphabet as a system.

## What this does to the theory

The half about the alphabet gains a little (the abjad tendency; "Arabic"). The half about subject matter loses: lettered suras are not marked by talk of scripture beyond their first lines. The link between the letters and the Book is in the opening formula (24 of 29 open with it) and not in the body of the sura.

## Limits

- M1 uses a lexicon I chose; a different choice could behave differently, though the narrow and full versions agree.
- M3 rests on 28 letter pairs and four candidates.
- M2 was not blind.

---

# Results, batch 10: what sets the lettered suras apart? (2026-11-14)

Specified in `PREREGISTRATION_batch10.md` before the analysis was coded; run once. Numbers are in `results/batch10.json`. This batch was a search, with the check against noise fixed in advance. 111 suras (three have no verses after the first three), 304 roots.

## Part 1. Vocabulary: the validation failed

Words picked as distinguishing in one half of the suras did not reliably distinguish lettered suras in the other half. Across 40 confirmation tests the median p was 0.18, and 6 were below 0.05 (2 would be expected by chance). The pre-set pass mark was a median below 0.05.

Under the rule written in advance, no list of distinguishing words is offered as a finding. Only two roots were selected consistently, h-z-n (grieve) and '-r-d (earth), and with the validation failed they should be treated as noise until shown otherwise.

So the vocabulary resemblance among lettered suras found in batch 8 is real but diffuse. It is not carried by a set of words that can be named.

## Part 2. Formal features: one holds

| Feature | Lettered | Unlettered | p | p adjusted for nine tests |
|---|---|---|---|---|
| Verses rhyming in long i/u + consonant (-un, -in, -im) | 85% | 61% | 0.0028 | 0.025 |
| Vocative ya per 1,000 words | 5.3 | 4.1 | 0.14 | 0.60 |
| First-person plural verbs per 1,000 words | 25.4 | 23.1 | 0.23 | 0.60 |
| Imperatives per 1,000 words | 26.2 | 22.3 | 0.27 | 0.60 |
| Proper nouns per 1,000 words | 49.3 | 51.9 | 0.38 | 0.64 |
| Second-person verbs per 1,000 words | 62.4 | 57.5 | 0.43 | 0.64 |
| Verbs as a share of content words | 40.0% | 37.6% | 0.53 | 0.68 |
| Share of verbs in the perfect tense | 47.5% | 46.5% | 0.70 | 0.78 |
| Passive verbs per 1,000 words | 14.5 | 15.3 | 1.00 | 1.00 |

The one feature that separates lettered suras is rhyme. With period, revelation order, length and verse length controlled, 25 points more of their verses end in the -un / -in / -im type of rhyme. Nothing about their grammar or narrative style differs: not proper nouns, tense, person, imperatives or passives.

## How this fits with the earlier batches

- Batch 8 F: lettered suras resemble each other strongly in rhyme (+13 points) and weakly in vocabulary (+5).
- Batch 8 A: where the letters form their own verse, the letter-name rhymes with the sura in 17 of 19 cases. Twenty-two of the 29 openings end in mim, sin or nun, whose names end in exactly this kind of rhyme.
- This batch: the lettered suras are the suras with the most uniform rhyme of that kind.

Put together: the firmest thing the data say about which suras carry letters is a fact about sound. The letters sit on suras with a uniform -un / -in / -im rhyme, and most of the letters rhyme with it.

## Limits

- This rhyme became dominant in the later Meccan period, where most lettered suras fall. Two chronologies, a period flag and verse length are controlled, but the chronologies are coarse and some of the effect may still be period.
- Five lettered suras do not have this rhyme (19, 20 and 38 rhyme in long a; the letters of 10 to 15 and 50 do not rhyme with their suras), so the description is a tendency and not a rule.
- The split-half validation had only about 14 lettered suras per half. A real but modest vocabulary signature could have been missed.

---

# Results, batch 11: why the mushaf departs from longest-first order (2026-11-14)

Specified in `PREREGISTRATION_batch11.md` before the analysis was coded; run once. Numbers are in `results/batch11.json`.

Sura 1 is held first and left out. Among suras 2 to 114, 423 of the 6,328 sura pairs (6.7%) stand in the wrong order for a strict longest-first sort, and in 49 of the 112 adjacent pairs the shorter sura comes first.

The mushaf is compared with 15,541 random orders that break the length rule to the same degree (within 10%), with the breaks placed at random.

## Results

| Test | Mushaf | Strict longest-first | Orders with random exceptions | p |
|---|---|---|---|---|
| O1. Vocabulary similarity of neighbours (percentile; chance is 0.50) | 0.623 | 0.599 | 0.554 | 0.00006 |
| O2. Rhyme similarity of neighbours | 0.628 | 0.585 | 0.557 | 0.0002 |
| O3. Vocabulary similarity beyond period and length | 0.051 | 0.037 | 0.003 | 0.0035 |
| O4. Adjacent pairs with identical opening letters | 13 | 1 | 1.8 | 0.00006 |
| Mean revelation-rank gap between neighbours (lower is closer) | 23.9 | 27.6 | 30.7 | 0.0001 |

For O1 and O4, no random order did as well as the mushaf; the p-value shown is the smallest the test can return.

All five predictions recorded beforehand held.

## Reading

- **The exceptions are not placed at random.** Breaking the length rule at random lowers the resemblance between neighbours (0.599 to 0.554 for vocabulary). The mushaf breaks it just as often and its neighbours are more alike than under a perfect sort (0.623).
- **It is not only the letter groups (O5).** With the 29 lettered suras removed, the 84 remaining suras show the same thing: vocabulary p = 0.0009, rhyme p = 0.003, beyond period and length p = 0.008.
- **It is not only date.** The exceptions also bring suras of similar date together, but the vocabulary result survives after period, revelation order, length and verse length are removed (O3).
- **Letter groups are held together.** Thirteen adjacent pairs share identical letters, against fewer than two expected.
- A rank-based version of the random orders gives the same results.

## How this squares with the earlier dispute

A fully random order would score 0.50. The strict length sort reaches 0.599 and the mushaf 0.623, so the sort accounts for about 80% of the mushaf's raw advantage over a random order. That matches the 70 to 82 percent reported by the study noted in batch 2.

The remaining fifth is the point at issue. It is not noise: an order that departs from the sort as much as the mushaf does would be expected to fall to 0.554, and the mushaf rises instead.

## How optimised is it?

A search for the best order with no more disorder than the mushaf's found one scoring 0.744. The mushaf sits 36% of the way from the random-exception average to that order. It is arranged with resemblance in view, and it is far from the arrangement that would maximise resemblance alone.

## Limits

- The random orders come from one model of a loosely applied length rule (noise in the logarithm of length, or in rank). Real looseness might be structured differently, for example by sheets or booklets of suras copied together.
- Length is counted in words. The arrangers may have judged it by lines or pages.
- This shows the exceptions raise resemblance. It does not show who placed them or why; an arranger grouping suras by ear, subject and date would produce it.
- The similarity measures were built in earlier batches of this project, on the same text.

---

# Results, batch 12: a census of shapes (2026-11-14)

Specified in `PREREGISTRATION_batch12.md` before either detector had been run on real text; run once. Numbers, including every unit, are in `results/batch12.json`.

Each sura or chapter with at least 300 content words was cut into 12 equal blocks and scanned, with no outline, for ring structure and for parallel structure.

A fault in the block-cutting function was found and fixed during the eligibility count, before any detector ran on real text: it had silently dropped one sura (42). Counts below are after the fix.

## Results

| | Quran suras | Hebrew chapters | Gospel chapters | Above false-alarm rate? | Quran above baseline? |
|---|---|---|---|---|---|
| Rings | 2 of 47 | 4 of 121 | 1 of 40 | p = 0.87 | p = 0.50 |
| Parallel structure | 2 of 47 | 0 of 121 | 1 of 40 | p = 0.78 | p = 0.13 |

Neither shape is detected more often than the detectors' own error rates, and the Quran does not differ from the biblical chapters.

- Suras flagged as rings: 17 (centre around verses 65 to 84) and 30 (centre around 33 to 41). Two of 47 is what the false-alarm rate alone would give, so these are candidates for a close reading and nothing more.
- Suras flagged as parallel: 5 and 41.
- **Sura 12 was not detected** (p = 0.36), although an outline-based test confirmed its ring in batch 1. The detector did place its best centre at verses 46 to 53, close to Farrin's, and paired the opening verses with the closing ones, but not strongly enough to count.

My prediction was a small number of rings, somewhat above the false-alarm rate, not clearly more than in biblical chapters, with sura 12 possibly missed. The count was not above the false-alarm rate; the rest held.

## Reading under the pre-stated rule

At this resolution, with shared wording as the only evidence, rings are not detectable beyond the detector's error rate. This does not contradict the outline-based result for sura 12.

The miss on sura 12 matters for how much weight the null carries. A detector that cannot find the one ring already confirmed has little power on real text, most likely because real sections are of very unequal length (in sura 12 they run from 3 to 41 verses) and twelve equal blocks blur them. The census therefore shows that rings are not obvious at this resolution; it does not show they are absent.

## Limits

- One resolution (twelve equal blocks). A detector that allows unequal sections would have more power but far more freedom, and would need a much stricter check against false alarms.
- Biblical chapters are later divisions, not compositional units.
- Wording only.

---

# Results, batch 13: a second length-ordered collection, the Mishnah (2026-11-14)

Specified in `PREREGISTRATION_batch13.md`, which was committed to the public repository (commit 6096135) before any similarity between tractates was computed and before this batch's code was written. Run once. Numbers are in `results/batch13.json`.

The Mishnah has 63 tractates in six orders. Within each order the tractates run from the most chapters to the fewest, with exceptions: 22 of the 308 within-order pairs (7.1%) stand the wrong way round. The mushaf's figure is 6.7%.

## The measure works

Tractates in the same order are far more alike than tractates in different orders (+0.27, p = 0.0001), and the three Bavot, originally one tractate, score 0.95 to 0.99 with each other.

## Results

| Test | Mishnah | Strict sort | Random exceptions | p |
|---|---|---|---|---|
| M1. Similarity of adjacent tractates, length in chapters | 0.822 | 0.761 | 0.740 | 0.0001 |
| M2. Length in words | 0.822 | 0.753 | 0.749 | 0.0003 |
| M3. True exceptions only (tied tractates left as they are) | 0.822 | 0.761 | 0.758 | 0.0004 |
| M4. Without Avot, the three Bavot as one | 0.813 | 0.745 | 0.730 | 0.0002 |

In M1 none of the 7,363 random orders did as well as the Mishnah.

I predicted M1 would pass and that M3 might fail for lack of exceptions. M3 passed.

## Reading under the pre-stated rule

M1 and M3 pass. Exceptions that raise resemblance are found in a second length-ordered collection. The pattern in the mushaf is what careful human arrangement looks like, and it is not distinctive.

The two collections are close in size of effect as well as in kind:

| | Share of pairs out of order | Actual | Random exceptions | Gap in null standard deviations |
|---|---|---|---|---|
| Mushaf (batch 11, vocabulary) | 6.7% | 0.623 | 0.554 | 3.9 |
| Mishnah (M1) | 7.1% | 0.822 | 0.740 | 4.2 |

## What this does to batch 11

Batch 11 stands: the mushaf's order is deliberate and not a bare sort by length. What changes is how much that says. The Mishnah was arranged by its editors, and it shows the same thing to the same degree. So the arrangement finding is evidence of deliberate arrangement and gives no ground for saying the arrangement is beyond what people do.

## Limits

- One comparison collection, in a different genre.
- The Mishnah measure uses word forms without lemmas, so it is cruder than the Quran measure. A cruder measure would be expected to weaken the result, and it is strong anyway.
- The Mishnah is built in six thematic orders; the mushaf has no such divisions. The tests respect that (only within-order pairs are used), but the two arrangements are not built the same way.
- Printed chapter counts differ slightly from older ones in a few tractates.

---

# Results, batch 14: the seams between suras (2026-11-16)

Specified in `PREREGISTRATION_batch14.md`, committed to the public repository (commit c4caad3) before this batch's code was written. Run once. Numbers are in `results/batch14.json`; every seam is in `results/seam_map.json` and, in readable form, in `SEAMS.md`.

Question: does the close of each sura connect to the opening of the next, as the classical *munasabat* literature holds?

## S1. Is the link at the boundary? No, not as a general rule.

| Window | Seam (close of N, opening of N+1) | Reverse (opening of N, close of N+1) | Seam higher / reverse higher / equal | p |
|---|---|---|---|---|
| 40 content words, roots (primary) | 0.083 | 0.088 | 41 / 55 / 17 | 0.79 |
| 20 content words | 0.059 | 0.060 | 48 / 52 / 13 | 0.57 |
| 80 content words | 0.122 | 0.125 | 38 / 46 / 29 | 0.67 |
| Three verses | 0.043 | 0.047 | 33 / 45 / 35 | 0.74 |
| Lemmas in place of roots | 0.047 | 0.049 | 49 / 47 / 17 | 0.68 |

The end of a sura is no closer to the start of the next than the start of the first is to the end of the second. I predicted a modest pass. That was wrong.

How specific is the link to the next sura? As a match for a sura's close, the next sura's opening sits on average at the 57th percentile among all suras' openings, and the opening of the sura after next sits at the 60th. Eight seams share no root at all (all among the short suras from 80 onward).

## Reading under the pre-stated rule

Neighbouring suras resemble each other as wholes (batches 2, 6, 11), but the boundary itself is not marked in shared word-families. Links of meaning that use different words could still be there; this measure cannot see them.

## What the map does show

The rule fails on average, but individual seams are striking. Twenty-three of the 113 are above the 90th percentile. The strongest:

| Seam | Close | Opening | Similarity | Reverse | Shared word-families |
|---|---|---|---|---|---|
| 43-44 | 43:83-89 | 44:1-10 | 0.288 | 0.076 | "play" (43:83, 44:9); blessed; wise |
| 82-83 | 82:6-19 | 83:1-14 | 0.275 | 0.080 | "the wicked" (82:14, 83:7); "what will make you know" (82:17-18, 83:8); denying the Day of Judgement (82:9, 83:11) |
| 11-12 | 11:119-123 | 12:1-6 | 0.219 | 0.064 | "We relate to you" the stories (11:120, 12:3); "unaware" (11:123, 12:3) |
| 113-114 | 113:1-5 | 114:1-6 | 0.218 | 0.218 | "Say: I seek refuge in the Lord of ... from the evil of ..." |
| 38-39 | 38:76-88 | 39:1-4 | 0.218 | 0.044 | "sincere" servants (38:83) and sincere religion (39:2-3); might / the Mighty |
| 91-92 | 91:1-15 | 92:1-19 | 0.205 | 0.105 | "the most wretched" (91:12, 92:15); purify (91:9, 92:18) |
| 28-29 | 28:85-88 | 29:1-7 | 0.178 | 0.064 | "hope" (28:86, 29:5) |

In several of these the reverse is weak, so the link really is at the boundary for those pairs.

## Check against Farrin's eight boundary claims

Of the eight pairs for which Farrin states a link at the boundary, two rank high here (38-39 is 5th of 113; 2-3 is 13th), one is in the upper third (22-23, 29th), and five are in the middle or bottom (12-13, 27-28, 4-5, 54-55, 101-102). His links for those five are thematic (for example "measure" in 54:49 against "balance" in 55:7-9) and do not share a root.

## Limits

- Shared word-families only. This is the main limit: the classical authors argue from meaning, and a link such as a prayer at the end of one sura answered at the start of the next need not share a root.
- The map lists shared roots by rarity. Several listed roots are common words (Lord, say, people); a shared root is a candidate link, and judging it needs a reader.
- For 17 pairs of very short suras the opening and close are the same verses, so they contribute nothing to S1.

---

# Results, batch 15: the word-choice atlas (2026-11-16)

Specified in `PREREGISTRATION_batch15.md`, committed to the public repository (commit d1d8fa4) before this batch's code was written. Run once. Numbers are in `results/batch15.json`; the atlas is in `ATLAS.md` and `results/word_atlas.json`; the reading used for W7 is in `claims/w7_reading.json`.

I know many of these verses, so the rules were not written blind. What the checks add is that each rule is applied to every occurrence and every exception is listed.

## Part 1. Seven classical claims

| Claim | Result | p | Verdict |
|---|---|---|---|
| W1. *matar* is rain as punishment, *ghayth* rain as mercy | *matar*: 15 of 15 with a punishment word nearby. *ghayth*: 1 of 3 | 0.020 | Holds; very small numbers |
| W2. Singular *rih* is a harmful wind, plural *riyah* a merciful one | Plural: 8 mercy, 0 harm, 2 neither. Singular: 10 harm, 0 mercy alone, 2 both, 7 neither | 0.00002 | Holds as a tendency |
| W3. *anzala* for the Torah and Gospel, *nazzala* for the Quran | With Torah or Gospel named: *anzala* 10 of 183, *nazzala* 2 of 62 | 0.38 | Does not hold by this rule |
| W4. *khashya* is fear of God, *khawf* fear in general | God named within three words: 42% against 15% | 0.0002 | Holds as a tendency |
| W5. *fu'ad* is the heart as a faculty beside hearing and sight | Hearing and sight in the verse: 7 of 16 against 7 of 132 | 0.0001 | Holds as a tendency |
| W6. *halafa* for the oaths of liars, *aqsama* for solemn oaths | Falsehood nearby: 8 of 13 against 1 of 20. First-person oaths: 0 against 8 | 0.0007 | Holds |
| W7. *sana* for years of hardship, *'am* for years of ease | By reading: *sana* 3 hardship, 1 ease, 15 plain counts. *'am* 1 hardship, 1 ease, 7 plain counts | none | Does not hold as a rule |

My predictions were right for six of the seven. I expected W3 to hold weakly and it did not.

### Notes on each

- **W1 rain.** The 15 occurrences of the root m-t-r sit in nine verses: the destruction of Lot's people, the taunt "rain down stones on us" (8:32), the cloud that 'Ad took for rain (46:24), and "if you are troubled by rain" (4:102), where rain is a hardship and not a punishment. The one marker hit for *ghayth* (57:20) is a false alarm: the rain there is an image of worldly life, and the punishment mentioned is in the Hereafter.
- **W2 wind.** The plural is never a harmful wind. The singular usually is, but not always: Solomon's wind (21:81, 34:12, 38:36) is a favour, 10:22 has "a pleasant wind" before the storm, and two uses are not weather at all (your strength, 8:46; the scent of Joseph, 12:94). Two of the ten singular "harm" hits are Solomon's wind, caught by the marker words "violent" and "punishment" in the same verse. So the fair statement is: a merciful wind may be singular or plural; a destructive wind is always singular.
- **W3 sent down.** 3:3 sets the two verbs side by side (*nazzala* for the Book sent to the Prophet, *anzala* for the Torah and Gospel), and that verse is the basis of the claim. Across all verses that name the Torah or Gospel, *anzala* is used ten times and *nazzala* once (3:93), which is the ratio expected from how common each verb is. *anzala* is also used freely of the Quran.
- **W4 fear.** A tendency with many cases on both sides: 28 of 48 uses of kh-sh-y do not have God within three words, and 18 uses of kh-w-f do. The rule misses "fear Him" where God is a pronoun.
- **W5 heart.** All 16 occurrences of *fu'ad* are in Meccan suras; *qalb* is mostly Medinan (93 of 132). Seven of the 16 list it with hearing and sight ("He gave you hearing, sight and hearts").
- **W6 oaths.** Of the five uses of h-l-f without a falsehood marker nearby, four are still about the hypocrites or a habitual swearer (9:56, 9:62, 9:95, 68:10). Only 5:89, on expiating oaths, is neutral. All eight oaths in God's own voice ("I swear by ...") use *aqsama*.
- **W7 year.** The claim fits the cases it is built on: years of famine (7:130), years in prison (12:42), forty years of wandering (5:26), and the year of rain (12:49). Against it: "if We gave them enjoyment for years" uses *sana* (26:205), and "they are tried every year" uses *'am* (9:126). Twenty-two of the 28 occurrences are plain counts of time. Counting three disputed cases the way the claim's supporters do (12:47, 20:40, 29:14) gives *sana* 6 hardship of 19, still a minority.

## Part 2. The atlas

`ATLAS.md` gives, for ten pairs, how often each word occurs, its Meccan and Medinan split, and the words that keep company with one member of the pair far more than the other. Three things that stand out from it (description, not tested):

- **Human: *bashar* / *insan*.** *bashar* keeps company with "like" (15 verses against 2), "messenger" and "angel": it is the word in "you are only a human like us" and in the contrast of human with angel. *insan* keeps company with "favour", "turns away" and "calls": the human as the one who is given, forgets and pleads.
- **Did: *'amila* / *fa'ala*.** *'amila* goes with "righteous" (87 verses against 3), "evil deed", "recompense" and "He sees": deeds that are judged. *fa'ala* goes with "fathers" and "how": what people did, and how God dealt with earlier peoples.
- **Came: *ja'a* / *ata*.** No simple rule shows. Each has its own fixed phrases (*ja'a* in "whoever comes with a good deed"; *ata* in "has the story reached you" and "it comes upon them while they do not perceive").

## Limits

- Small numbers for several pairs.
- The marker lists are mine, and markers misfire in both directions (W1's false alarm at 57:20; W2's Solomon verses).
- W7 is one reader's judgement.
- Batch 5 found that the Gospels and Kings also choose between near-equivalent words in ways that fit their surroundings. These checks say which classical observations hold across every occurrence. They do not say such choices are unusual.

---

# Results, batch 16: the retold stories (2026-11-16)

Specified in `PREREGISTRATION_batch16.md`, committed to the public repository (commit 0715b3b) before this batch's code was written. Run once. Numbers are in `results/batch16.json`; the map is in `RETELLINGS.md` and `results/retellings.json`.

Moses, Pharaoh or Aaron is named in 44 suras. Twenty-nine have a telling of at least 30 content words; the other 15 are passing mentions.

## R1. Are a telling's particular details tied to its sura? Yes.

A telling's "particular" roots are those found in it and in no other telling of the same story. The echo is the share of them that also occur elsewhere in the same sura.

| Test | Tellings | Echo in own sura | Echo if suras are reassigned | p |
|---|---|---|---|---|
| Moses (primary) | 26 | 25% | 12% | 0.00006 |
| Moses, verse-final words removed | 26 | 23% | 11% | 0.0005 |
| Moses, reassigned within the same period only | 26 | 25% | 13% | 0.0006 |
| Noah | 20 | 37% | 26% | 0.0014 |
| Adam and Iblis | 9 | 61% | 46% | 0.0010 |
| Abraham | 18 | 37% | 29% | 0.0050 |
| Thamud | 9 | 54% | 46% | 0.013 |
| Lot | 7 | 49% | 42% | 0.035 |
| 'Ad | 8 | 50% | 44% | 0.053 |

For Moses, no random reassignment in 100,000 did as well. Shu'ayb has only three tellings and was not tested. I predicted a clear pass that would weaken without verse-final words and survive; that is what happened.

Reading under the pre-stated rule: what is particular to each telling is shared with the rest of its sura. Each telling is cut to its sura, not copied from a stock version. The effect is not produced by rhyme words or by period alone.

Two exceptions worth noting: the two fullest tellings, suras 20 and 28, show little or no tie (15% against 12%, and 5% against 13%). In both, the Moses story takes up most of the sura, so there is little "rest of the sura" for it to echo.

## Examples of the tie, checked against the text

- **Sura 10.** Only this telling has Pharaoh, drowning, say he believes, and the reply "Now? When you disobeyed before" (10:91). The same word opens the rebuke to the Prophet's own audience forty verses earlier: "Now? When you used to hasten it" (10:51). The sura then names the one people whose late belief was accepted, the people of Jonah (10:98).
- **Sura 26.** Only here do the magicians say "we hope our Lord will forgive us our sins" (26:51). Thirty verses on, Abraham says "whom I hope will forgive me my sin" (26:82). Only here are Pharaoh's people "brought near" the sea (26:64); later the Garden is "brought near" the God-fearing (26:90).
- **Sura 18.** The servant of God is taught knowledge "from Us" (18:65), with the same rare word as the cave-youths' prayer for mercy "from You" (18:10). Moses is told he cannot bear "what you do not encompass in knowledge" (18:68); of Dhul-Qarnayn it is said "We encompassed what he had in knowledge" (18:91).
- **Sura 7.** Only this telling has the appointed time and the Lord manifesting Himself to the mountain (7:142-143). Near the end of the sura, the Hour is something "none will make manifest at its time but He" (7:187), with both roots again.

## The map of Moses episodes

`RETELLINGS.md` has a table of suras against 18 episodes, found from marker words. It is an automatic first pass. Reading it against the text gives these corrections:

**Marked in error** (the marker word is there, the episode is not):
- Sura 2, infancy: the "chest" at 2:248 is the Ark in the story of Saul.
- Sura 4, the magicians: "crucify" at 4:157 concerns Jesus.
- Sura 7, the journey of sura 18: the "fish" at 7:163 are those of the Sabbath-breakers.
- Sura 22, Madyan: 22:44 names Madyan in a list of peoples.

**Missed** (the episode is there, outside the verses the name rule captured or in other words):
- Sura 26, the staff and hand (26:32-33): Pharaoh is not named for some verses and the passage fell outside the telling.
- Suras 43 and 44, the drowning (43:55, 44:24): just beyond the captured verses.
- Sura 10, the magicians (10:79-82): told without the marker words.

With those corrections, the picture is:

- **Three long tellings carry most of the story:** sura 20 (nine episodes), sura 28 (seven) and sura 7 (seven).
- **The most retold episode is the sea and the drowning,** in at least ten suras.
- **Several episodes are told once only:** the plagues and the tablets (sura 7), the believer in Pharaoh's house (sura 40), the cow (sura 2), the forty years of wandering (sura 5), the journey with the servant of God (sura 18), and Pharaoh's body being preserved (sura 10).
- **Moses' early life** (infancy, the killing, Madyan) is told only in suras 20 and 28.
- **Twelve tellings have none of the 18 episodes.** They refer to Moses and the Book, or to Pharaoh's end, without narrating a scene.

## Limits

- Tellings are found by names, with a three-verse tail. This cuts some passages short, as the corrections show.
- The episode table depends on marker words and needed seven corrections by reading. It should be read as a draft.
- The host includes other prophets' stories in the same sura. Sura 26 tells its stories with shared refrains, which is part of why its tie is visible.
- Batch 5 found that the Gospels and Kings also fit wording to context. This batch shows that the Quran's tellings are fitted to their suras; it does not show that this is unusual.

---

# Results, batch 17: sound and subject (2026-11-16)

Specified in `PREREGISTRATION_batch17.md`, committed to the public repository (commit 5697214) before this batch's code was written. Run once. Numbers are in `results/batch17.json`.

Question: with the marker words themselves removed, do verses of warning and verses of mercy differ in sound, as several descriptive studies say?

626 verses were classed as mercy and 578 as warning. Thirty-three suras have at least five of each and were used; the comparison is made within each sura.

A correction to the plan's wording: it speaks of "22" consonants, but the rule it defines (all letters except alif, waw and ya) gives 25. The rule was applied as defined.

## Results

| Feature | Warning verses | Mercy verses | Suras higher in warning / in mercy | Predicted | p |
|---|---|---|---|---|---|
| F1. Hard consonants (share of consonants) | 15.4% | 14.5% | 23 / 10 | Higher in warning | 0.063 |
| F2. Soft consonants (share of consonants) | 48.4% | 49.4% | 15 / 18 | Higher in mercy | 0.17 |
| F3. Long vowels per short vowel | 0.233 | 0.210 | 25 / 8 | Higher in mercy | 1.0 |
| F4. Verse length in words | 15.7 | 16.5 | 11 / 22 | No direction | 0.23 |

None of the four passes.

- **Hard consonants** lean the way the claim says, in 23 of 33 suras, but the difference is under one percentage point and misses the threshold.
- **Soft consonants** show no reliable difference.
- **Long vowels go the opposite way** to the prediction: warning verses have more of them, in 25 of 33 suras. The test was one-sided in the other direction, so it counts as a failed prediction. As an observation it is the largest difference in the table.
- **Verse length** does not differ.

I expected verse length to differ and the other three to show small effects in the predicted directions. Verse length did not differ, and the long-vowel prediction was wrong in direction.

## Reading under the pre-stated rule

The claim that warning sounds harsh and mercy sounds soft does not hold across the whole text by these measures, whatever is true of chosen passages.

## Letter by letter (description; 25 letters, so only very small p-values mean anything)

| Leans towards | Letter | Per thousand consonants, warning / mercy | Suras leaning each way | p |
|---|---|---|---|---|
| Mercy | lam | 162 / 184 | 9 / 24 | 0.00006 |
| Mercy | zay | 7 / 15 | 10 / 23 | 0.002 |
| Warning | fa | 46 / 35 | 25 / 8 | 0.003 |
| Warning | dhal | 28 / 20 | 25 / 8 | 0.011 |
| Warning | qaf | 32 / 25 | 23 / 10 | 0.029 |

Only lam clears a correction for 25 letters. It is the commonest consonant in mercy verses largely because of a few very common words that stay in the verse after the markers are removed: the name of God (two lams), "those who" and "for". The letters leaning towards warning also trace to common words: "in" and "disbelieved" for fa, "those who" and "taste" for dhal, "said" and "taste" for qaf.

So the differences that exist are differences of vocabulary. This is the limit stated in advance: two subjects use different words, and different words have different letters.

## Rhyme endings (description)

Of verses ending in long a plus a consonant, 59 are warning and 29 mercy. That is not evidence of sound matching subject: the warning words themselves ("fire", "punishment") end that way and often stand at the end of the verse.

## Limits

- Subject is assigned by marker words. Many "mercy" verses are legal or narrative verses that close with the names "the Forgiving, the Merciful".
- Only what the script shows is measured. Features of recitation, such as nasalisation, lengthening and pauses, are not.
- The descriptive studies argue from chosen passages, where an effect could be real and local. A test across all verses averages those passages with many that have no such effect.
- No comparison with other Arabic texts, so nothing here separates the Quran's choices from properties of the language.

---

# Results, batch 18: an audit of popular word-count claims (2026-11-16)

Specified in `PREREGISTRATION_batch18.md`, committed to the public repository (commit e38b682) before any count was made. Run once. Numbers are in `results/batch18.json`.

Each word is counted three ways, the same for every claim: the dictionary word in all its forms (Word), its singular forms only (Singular), and every word from its root (Root). The text is the Hafs reading in the Tanzil edition, 77,429 words.

## Tally

| Verdict | Claims |
|---|---|
| Holds | 8 |
| Holds under another rule (the same rule for both words) | 4 |
| Only with mixed rules | 1 |
| Does not hold | 7 |

## The claims

| # | Claim | Claimed | Counted | Verdict |
|---|---|---|---|---|
| 1 | This world = the hereafter | 115 | *dunya* 115, *akhira* 115 | Holds |
| 2 | Angels = devils | 88 | *malak* in all forms 88, *shaytan* in all forms 88 | Holds |
| 8 | "Say" = "they said" | 332 | *qul* 332, *qalu* 332 | Holds |
| 6 | Day | 365 | 365 as the claim defines it (singular, no attached pronoun, not "on that day"). All singular forms: 445 | Holds, under the claim's own definition |
| 7 | Days, plural and dual | 30 | 27 plural + 3 dual | Holds |
| 11 | Prayers, plural | 5 | 5 | Holds |
| 19 | Iblis | 11 | 11 | Holds |
| 20 | Muhammad | 4 | 4 | Holds |
| 4 | Man = woman | 24 | Singular: 24 and 24. All forms: 29 and 26 | Holds for the singular only |
| 5 | Month | 12 | Singular: 12. All forms: 21 | Holds for the singular only |
| 13 | Benefit = corruption | 50 | Roots: 50 and 50. The nouns themselves: 11 and 11 | Holds for the whole roots |
| 16 | Tongue = admonition | 25 | Roots: 25 and 25. *maw'iza* itself: 9 | Holds for the whole roots |
| 10 | Alms = blessing | 32 | *zakat* 32. *baraka* 3; its root 32 | Only with mixed rules |
| 3 | Life = death | 145 | *hayat* 76, *mawt* 50. Roots: 189 and 165 | Does not hold |
| 9 | Sea 32, land 13 | 32 and 13 | Sea 33. Land 12, plus "dry land" 1 = 13 | Does not hold: sea is 33 |
| 12 | "Seven heavens" | 7 | 5 as "seven heavens" | Does not hold by the registered rule; see below |
| 14 | Calamity = thanks | 75 | Roots: 77 and 75 | Does not hold |
| 15 | Patience = hardship | 114 | Roots: 103 and 102 | Does not hold |
| 17 | Reason = light | 49 | Root of reason 49. *nur* 43 | Does not hold |
| 18 | Desire = dread | 8 | Roots: 8 and 12 | Does not hold |

I predicted that a minority would hold under the Word rule (8 of 20 did), that the names and the days would hold (they did), that "month" would hold (it does only for the singular), and that "day 365" would hold under the claim's own narrow definition (it did).

## Notes

- **Claims 1, 2 and 8 are exact under the plainest rule.** The word for this world and the word for the hereafter each occur 115 times; angel and devil, in all their forms, 88 times each; the command "say" and the report "they said" 332 times each.
- **Day 365** depends on its definition. All singular forms of "day" number 445. Leaving out "on that day" gives 375, and also leaving out forms with an attached pronoun ("their day", "your day") gives 365. The definition is the one the claim's supporters use, and it was written into the plan before counting, but it is a narrow one.
- **Man and woman, and month,** hold for the singular. That is the natural reading for "month" (twelve mentions of "a month"); for man and woman it leaves out the dual and, for men, the separate plural.
- **Sea and land.** The singular "sea" occurs 33 times, not 32 (18:109 has it twice). "Land" occurs 12 times; the thirteenth form with the article, at 52:28, is a name of God ("the Kind"). Adding the one "dry land" (20:77), as the claim does, gives 13. So 33 to 13, which is 71.7% sea; the claim's 32 to 13 would be 71.1%.
- **Seven heavens (post hoc).** My rule counted "seven" directly followed by "heavens", which occurs five times (2:29, 41:12, 65:12, 67:3, 71:15). The reverse order, "the heavens, the seven", occurs twice more (17:44, 23:86). Counting both orders gives 7, as claimed. The registered rule was narrower than the claim, so by the plan this is a miss, and by the claim's natural meaning it holds.
- **Zakat and blessing** match only by counting one as a word and the other as a whole root.
- **The four that miss by a little** (calamity and thanks 77 and 75; patience and hardship 103 and 102) show how close near-misses are when whole roots are counted.

## What these counts mean

Each is a fact about this edition under a stated rule. Three things should be kept in mind before drawing more from them.

- **Selection.** These lists were compiled by people looking for matches. The pairs that were tried and did not match are not on the lists, so the share that hold here says nothing about how often a random pair would match.
- **Rule choice.** Seven of the twelve that hold need a particular rule (a narrow definition, the singular only, the whole root). The rules were fixed before counting here, but the claims' authors were free to choose them.
- **Edition.** Counts can shift by one or two between reading traditions and between ways of dividing words.

The three plain matches (115, 88, 332) are the ones least open to these objections: one word against one word, counted in all forms, with no special definition.
